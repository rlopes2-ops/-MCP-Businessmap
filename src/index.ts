#!/usr/bin/env node

import path from 'path';
import * as dotenv from 'dotenv';
import minimist from 'minimist';
import express from 'express';
import { StdioServer, SseServer, Schema, Resource, Parameter } from 'modelcontextprotocol';
import { BusinessmapClient } from './businessmap-client';
import { BusinessmapConfig } from './types';

// Carregar variáveis de ambiente do arquivo .env se existir
dotenv.config();

// Processar argumentos da linha de comando
const argv = minimist(process.argv.slice(2), {
  boolean: ['verbose', 'read-only', 'businessmap-ssl-verify'],
  string: ['transport', 'port', 'businessmap-url', 'businessmap-apikey', 'businessmap-boards-filter'],
  default: {
    transport: 'stdio',
    port: '8000',
    verbose: false,
    'read-only': false,
    'businessmap-ssl-verify': true
  },
  alias: {
    v: 'verbose',
    t: 'transport',
    p: 'port'
  }
});

// Configurar nível de log
if (argv.verbose) {
  console.debug('Verbose logging enabled');
}

// Configurar cliente Businessmap
const config: BusinessmapConfig = {
  url: argv['businessmap-url'] || process.env.BUSINESSMAP_URL || '',
  apikey: argv['businessmap-apikey'] || process.env.BUSINESSMAP_APIKEY || '',
  sslVerify: argv['businessmap-ssl-verify'] !== false,
  readOnly: argv['read-only'] === true || process.env.READ_ONLY_MODE === 'true',
  boardsFilter: argv['businessmap-boards-filter'] ? 
    argv['businessmap-boards-filter'].split(',') : 
    process.env.BUSINESSMAP_BOARDS_FILTER ? 
      process.env.BUSINESSMAP_BOARDS_FILTER.split(',') : 
      undefined
};

// Verificar configuração
if (!config.url || !config.apikey) {
  console.error('Error: Businessmap URL and API key are required!');
  console.error('Please provide them via environment variables or command line arguments:');
  console.error('  --businessmap-url=https://your-instance.kanbanize.com');
  console.error('  --businessmap-apikey=YOUR_API_KEY');
  process.exit(1);
}

// Inicializar cliente
const businessmapClient = new BusinessmapClient(config);

// Log config info
console.log(`Starting MCP Businessmap server with ${argv.transport} transport`);
if (config.readOnly) {
  console.log('Running in READ-ONLY mode - all write operations are disabled');
}

// Criar schema MCP
const schema = new Schema();

// Define tools
@schema.tool
async function businessmap_search(
  query: string = Parameter.describe("Text to search for"),
  board_ids: string | undefined = Parameter.describe("Comma-separated list of board IDs to search in").optional(),
  max_results: number = Parameter.describe("Maximum number of results to return").optional(50),
) {
  try {
    const boardIds = board_ids ? board_ids.split(',') : undefined;
    return await businessmapClient.searchCards({ 
      query, 
      boardIds, 
      maxResults: max_results 
    });
  } catch (error: any) {
    console.error('Error in businessmap_search:', error.message);
    return { error: error.message };
  }
}

@schema.tool
async function businessmap_get_card(
  card_id: string = Parameter.describe("Card ID to retrieve"),
) {
  try {
    return await businessmapClient.getCard(card_id);
  } catch (error: any) {
    console.error('Error in businessmap_get_card:', error.message);
    return { error: error.message };
  }
}

@schema.tool
async function businessmap_create_card(
  board_id: string = Parameter.describe("Board ID"),
  workflow_id: string = Parameter.describe("Workflow ID"),
  lane_id: string = Parameter.describe("Lane ID"),
  column_id: string = Parameter.describe("Column ID"),
  title: string = Parameter.describe("Card title"),
  description: string | undefined = Parameter.describe("Card description").optional(),
  priority: string | undefined = Parameter.describe("Card priority").optional(),
  assignee_ids: string | undefined = Parameter.describe("Comma-separated list of assignee IDs").optional(),
) {
  try {
    const assigneeIdsList = assignee_ids ? assignee_ids.split(',') : undefined;
    return await businessmapClient.createCard({
      boardId: board_id,
      workflowId: workflow_id,
      laneId: lane_id,
      columnId: column_id,
      title,
      description,
      priority,
      assigneeIds: assigneeIdsList
    });
  } catch (error: any) {
    console.error('Error in businessmap_create_card:', error.message);
    return { error: error.message };
  }
}

@schema.tool
async function businessmap_update_card(
  card_id: string = Parameter.describe("Card ID to update"),
  title: string | undefined = Parameter.describe("New card title").optional(),
  description: string | undefined = Parameter.describe("New card description").optional(),
  column_id: string | undefined = Parameter.describe("New column ID").optional(),
  lane_id: string | undefined = Parameter.describe("New lane ID").optional(),
  priority: string | undefined = Parameter.describe("New priority").optional(),
  assignee_ids: string | undefined = Parameter.describe("Comma-separated list of new assignee IDs").optional(),
) {
  try {
    const assigneeIdsList = assignee_ids ? assignee_ids.split(',') : undefined;
    return await businessmapClient.updateCard({
      cardId: card_id,
      title,
      description,
      columnId: column_id,
      laneId: lane_id,
      priority,
      assigneeIds: assigneeIdsList
    });
  } catch (error: any) {
    console.error('Error in businessmap_update_card:', error.message);
    return { error: error.message };
  }
}

@schema.tool
async function businessmap_delete_card(
  card_id: string = Parameter.describe("Card ID to delete"),
) {
  try {
    return await businessmapClient.deleteCard(card_id);
  } catch (error: any) {
    console.error('Error in businessmap_delete_card:', error.message);
    return { error: error.message };
  }
}

@schema.tool
async function businessmap_add_comment(
  card_id: string = Parameter.describe("Card ID"),
  text: string = Parameter.describe("Comment text"),
) {
  try {
    return await businessmapClient.addComment(card_id, text);
  } catch (error: any) {
    console.error('Error in businessmap_add_comment:', error.message);
    return { error: error.message };
  }
}

// Iniciar o servidor MCP
const startServer = async () => {
  try {
    if (argv.transport === 'stdio') {
      // Usar transporte stdio
      const server = new StdioServer(schema);
      await server.run();
    } else if (argv.transport === 'sse') {
      // Usar transporte SSE
      const port = parseInt(argv.port);
      const server = new SseServer(schema);
      await server.listen(port);
      console.log(`MCP server listening on port ${port}`);
    } else {
      console.error(`Unsupported transport: ${argv.transport}`);
      process.exit(1);
    }
  } catch (error) {
    console.error('Failed to start MCP server:', error);
    process.exit(1);
  }
};

// Iniciar servidor
startServer().catch(error => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
}); 