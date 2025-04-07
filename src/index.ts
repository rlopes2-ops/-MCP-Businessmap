#!/usr/bin/env node

import path from 'path';
import * as dotenv from 'dotenv';
import minimist from 'minimist';
import { createServer } from '@mcp/server';
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

// Definir schema MCP
const schema = {
  tools: {
    // Busca cards no Businessmap
    businessmap_search: {
      description: 'Search for cards in Businessmap',
      parameters: {
        query: { type: 'string', description: 'Text to search for' },
        board_ids: { type: 'string', description: 'Comma-separated list of board IDs to search in', optional: true },
        max_results: { type: 'integer', description: 'Maximum number of results to return', optional: true }
      },
      handler: async ({ query, board_ids, max_results }: any) => {
        try {
          const boardIds = board_ids ? board_ids.split(',') : undefined;
          return await businessmapClient.searchCards({ 
            query, 
            boardIds, 
            maxResults: max_results ? parseInt(max_results) : undefined 
          });
        } catch (error: any) {
          console.error('Error in businessmap_search:', error.message);
          return { error: error.message };
        }
      }
    },
    
    // Obter detalhes de um card específico
    businessmap_get_card: {
      description: 'Get a specific card from Businessmap by ID',
      parameters: {
        card_id: { type: 'string', description: 'Card ID to retrieve' }
      },
      handler: async ({ card_id }: any) => {
        try {
          return await businessmapClient.getCard(card_id);
        } catch (error: any) {
          console.error('Error in businessmap_get_card:', error.message);
          return { error: error.message };
        }
      }
    },
    
    // Criar um novo card
    businessmap_create_card: {
      description: 'Create a new card in Businessmap',
      parameters: {
        board_id: { type: 'string', description: 'Board ID' },
        workflow_id: { type: 'string', description: 'Workflow ID' },
        lane_id: { type: 'string', description: 'Lane ID' },
        column_id: { type: 'string', description: 'Column ID' },
        title: { type: 'string', description: 'Card title' },
        description: { type: 'string', description: 'Card description', optional: true },
        priority: { type: 'string', description: 'Card priority', optional: true },
        assignee_ids: { type: 'string', description: 'Comma-separated list of assignee IDs', optional: true }
      },
      handler: async ({ board_id, workflow_id, lane_id, column_id, title, description, priority, assignee_ids }: any) => {
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
    },
    
    // Atualizar um card existente
    businessmap_update_card: {
      description: 'Update an existing card in Businessmap',
      parameters: {
        card_id: { type: 'string', description: 'Card ID to update' },
        title: { type: 'string', description: 'New card title', optional: true },
        description: { type: 'string', description: 'New card description', optional: true },
        column_id: { type: 'string', description: 'New column ID', optional: true },
        lane_id: { type: 'string', description: 'New lane ID', optional: true },
        priority: { type: 'string', description: 'New priority', optional: true },
        assignee_ids: { type: 'string', description: 'Comma-separated list of new assignee IDs', optional: true }
      },
      handler: async ({ card_id, title, description, column_id, lane_id, priority, assignee_ids }: any) => {
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
    },
    
    // Excluir um card
    businessmap_delete_card: {
      description: 'Delete a card from Businessmap',
      parameters: {
        card_id: { type: 'string', description: 'Card ID to delete' }
      },
      handler: async ({ card_id }: any) => {
        try {
          return await businessmapClient.deleteCard(card_id);
        } catch (error: any) {
          console.error('Error in businessmap_delete_card:', error.message);
          return { error: error.message };
        }
      }
    },
    
    // Adicionar comentário a um card
    businessmap_add_comment: {
      description: 'Add a comment to a card in Businessmap',
      parameters: {
        card_id: { type: 'string', description: 'Card ID' },
        text: { type: 'string', description: 'Comment text' }
      },
      handler: async ({ card_id, text }: any) => {
        try {
          return await businessmapClient.addComment(card_id, text);
        } catch (error: any) {
          console.error('Error in businessmap_add_comment:', error.message);
          return { error: error.message };
        }
      }
    }
  }
};

// Iniciar o servidor MCP
const startServer = async () => {
  const server = createServer(schema);
  
  if (argv.transport === 'stdio') {
    // Usar transporte stdio
    await server.run();
  } else if (argv.transport === 'sse') {
    // Usar transporte SSE
    const port = parseInt(argv.port);
    await server.listen(port);
    console.log(`MCP server listening on port ${port}`);
  } else {
    console.error(`Unsupported transport: ${argv.transport}`);
    process.exit(1);
  }
};

// Iniciar servidor
startServer().catch(error => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
}); 