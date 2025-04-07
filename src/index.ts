#!/usr/bin/env node

import * as dotenv from 'dotenv';
import minimist from 'minimist';
import express from 'express';
import http from 'http';
import { createReadStream, createWriteStream } from 'fs';
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

// Definição das ferramentas e seus parâmetros
const tools = {
  businessmap_search: {
    description: 'Search for cards in Businessmap',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Text to search for' },
        board_ids: { type: 'string', description: 'Comma-separated list of board IDs to search in' },
        max_results: { type: 'integer', description: 'Maximum number of results to return' }
      },
      required: ['query']
    },
    handler: async (params: any) => {
      try {
        const boardIds = params.board_ids ? params.board_ids.split(',') : undefined;
        return await businessmapClient.searchCards({ 
          query: params.query, 
          boardIds, 
          maxResults: params.max_results || 50
        });
      } catch (error: any) {
        console.error('Error in businessmap_search:', error.message);
        return { error: error.message };
      }
    }
  },
  
  businessmap_get_card: {
    description: 'Get a specific card from Businessmap by ID',
    parameters: {
      type: 'object',
      properties: {
        card_id: { type: 'string', description: 'Card ID to retrieve' }
      },
      required: ['card_id']
    },
    handler: async (params: any) => {
      try {
        return await businessmapClient.getCard(params.card_id);
      } catch (error: any) {
        console.error('Error in businessmap_get_card:', error.message);
        return { error: error.message };
      }
    }
  },
  
  businessmap_create_card: {
    description: 'Create a new card in Businessmap',
    parameters: {
      type: 'object',
      properties: {
        board_id: { type: 'string', description: 'Board ID' },
        workflow_id: { type: 'string', description: 'Workflow ID' },
        lane_id: { type: 'string', description: 'Lane ID' },
        column_id: { type: 'string', description: 'Column ID' },
        title: { type: 'string', description: 'Card title' },
        description: { type: 'string', description: 'Card description' },
        priority: { type: 'string', description: 'Card priority' },
        assignee_ids: { type: 'string', description: 'Comma-separated list of assignee IDs' }
      },
      required: ['board_id', 'workflow_id', 'lane_id', 'column_id', 'title']
    },
    handler: async (params: any) => {
      try {
        const assigneeIdsList = params.assignee_ids ? params.assignee_ids.split(',') : undefined;
        return await businessmapClient.createCard({
          boardId: params.board_id,
          workflowId: params.workflow_id,
          laneId: params.lane_id,
          columnId: params.column_id,
          title: params.title,
          description: params.description,
          priority: params.priority,
          assigneeIds: assigneeIdsList
        });
      } catch (error: any) {
        console.error('Error in businessmap_create_card:', error.message);
        return { error: error.message };
      }
    }
  },
  
  businessmap_update_card: {
    description: 'Update an existing card in Businessmap',
    parameters: {
      type: 'object',
      properties: {
        card_id: { type: 'string', description: 'Card ID to update' },
        title: { type: 'string', description: 'New card title' },
        description: { type: 'string', description: 'New card description' },
        column_id: { type: 'string', description: 'New column ID' },
        lane_id: { type: 'string', description: 'New lane ID' },
        priority: { type: 'string', description: 'New priority' },
        assignee_ids: { type: 'string', description: 'Comma-separated list of new assignee IDs' }
      },
      required: ['card_id']
    },
    handler: async (params: any) => {
      try {
        const assigneeIdsList = params.assignee_ids ? params.assignee_ids.split(',') : undefined;
        return await businessmapClient.updateCard({
          cardId: params.card_id,
          title: params.title,
          description: params.description,
          columnId: params.column_id,
          laneId: params.lane_id,
          priority: params.priority,
          assigneeIds: assigneeIdsList
        });
      } catch (error: any) {
        console.error('Error in businessmap_update_card:', error.message);
        return { error: error.message };
      }
    }
  },
  
  businessmap_delete_card: {
    description: 'Delete a card from Businessmap',
    parameters: {
      type: 'object',
      properties: {
        card_id: { type: 'string', description: 'Card ID to delete' }
      },
      required: ['card_id']
    },
    handler: async (params: any) => {
      try {
        return await businessmapClient.deleteCard(params.card_id);
      } catch (error: any) {
        console.error('Error in businessmap_delete_card:', error.message);
        return { error: error.message };
      }
    }
  },
  
  businessmap_add_comment: {
    description: 'Add a comment to a card in Businessmap',
    parameters: {
      type: 'object',
      properties: {
        card_id: { type: 'string', description: 'Card ID' },
        text: { type: 'string', description: 'Comment text' }
      },
      required: ['card_id', 'text']
    },
    handler: async (params: any) => {
      try {
        return await businessmapClient.addComment(params.card_id, params.text);
      } catch (error: any) {
        console.error('Error in businessmap_add_comment:', error.message);
        return { error: error.message };
      }
    }
  }
};

// Implementação simples de um servidor MCP

// Processador de mensagens JSON-RPC para o protocolo MCP
async function handleJsonRpcRequest(request: any) {
  // Mensagem para debug
  if (argv.verbose) {
    console.debug('Received request:', JSON.stringify(request, null, 2));
  }

  // Verificar ID e método
  const id = request.id || null;
  const method = request.method;

  // Resposta básica
  const response: any = {
    jsonrpc: '2.0',
    id
  };

  try {
    // Processar métodos diferentes
    if (method === 'mcp.list_tools') {
      // Listar todas as ferramentas disponíveis
      response.result = Object.entries(tools).map(([name, tool]) => ({
        name,
        description: tool.description,
        parameters: tool.parameters
      }));
    } 
    else if (method === 'mcp.invoke_tool') {
      // Invocar uma ferramenta específica
      const toolName = request.params?.tool;
      const toolParams = request.params?.params || {};
      
      // Verificar se a ferramenta existe
      if (!tools[toolName]) {
        throw { code: -32601, message: `Tool '${toolName}' not found` };
      }
      
      // Executar a ferramenta
      response.result = await tools[toolName].handler(toolParams);
    }
    else {
      // Método desconhecido
      throw { code: -32601, message: `Method '${method}' not found` };
    }
  } catch (error: any) {
    // Formatação de erro seguindo o padrão JSON-RPC
    response.error = {
      code: error.code || -32000,
      message: error.message || 'Unknown error',
      data: error.data
    };
  }
  
  // Mensagem para debug
  if (argv.verbose) {
    console.debug('Sending response:', JSON.stringify(response, null, 2));
  }
  
  return response;
}

// Iniciar servidor baseado no transporte escolhido
async function startServer() {
  try {
    if (argv.transport === 'stdio') {
      // Transporte STDIO
      
      // Configurar stdin/stdout
      process.stdin.setEncoding('utf8');
      process.stdout.setEncoding('utf8');
      
      // Ler linhas da entrada padrão
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
      });
      
      // Processar cada linha como uma mensagem JSON-RPC
      rl.on('line', async (line: string) => {
        try {
          // Ignorar linhas vazias
          if (!line.trim()) return;
          
          // Processar mensagem JSON-RPC
          const request = JSON.parse(line);
          const response = await handleJsonRpcRequest(request);
          
          // Enviar resposta
          console.log(JSON.stringify(response));
        } catch (error: any) {
          // Enviar erro de parsing
          console.error('Error parsing request:', error.message);
          console.log(JSON.stringify({
            jsonrpc: '2.0',
            error: {
              code: -32700,
              message: 'Parse error',
              data: error.message
            },
            id: null
          }));
        }
      });
      
      // Tratar eventos de erro e fechamento
      rl.on('close', () => {
        console.log('STDIO stream closed');
        process.exit(0);
      });
      
      rl.on('error', (error: Error) => {
        console.error('STDIO error:', error.message);
        process.exit(1);
      });
      
      // Avisar que o servidor está pronto
      console.log('MCP server running in STDIO mode, waiting for input...');
    } 
    else if (argv.transport === 'sse') {
      // Transporte Server-Sent Events (SSE)
      const app = express();
      const port = parseInt(argv.port);
      
      // Middleware para processar JSON
      app.use(express.json());
      
      // Endpoint para envio de eventos
      app.get('/sse', (req, res) => {
        const headers = {
          'Content-Type': 'text/event-stream',
          'Connection': 'keep-alive',
          'Cache-Control': 'no-cache'
        };
        res.writeHead(200, headers);
        
        // Enviar evento de boas-vindas
        res.write('event: connected\ndata: {}\n\n');
        
        // Adicionar cliente à lista
        const clientId = Date.now();
        sseClients.set(clientId, res);
        
        // Remover cliente quando a conexão for fechada
        req.on('close', () => {
          sseClients.delete(clientId);
        });
      });
      
      // Armazenar clientes SSE
      const sseClients = new Map();
      
      // Função para enviar eventos para todos os clientes
      const sendSseEvent = (event: string, data: any) => {
        const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        for (const client of sseClients.values()) {
          client.write(message);
        }
      };
      
      // Endpoint JSON-RPC
      app.post('/json-rpc', async (req, res) => {
        try {
          const response = await handleJsonRpcRequest(req.body);
          res.json(response);
        } catch (error: any) {
          res.status(500).json({
            jsonrpc: '2.0',
            error: {
              code: -32000,
              message: error.message || 'Unknown error'
            },
            id: req.body.id || null
          });
        }
      });
      
      // Iniciar servidor HTTP
      app.listen(port, () => {
        console.log(`MCP server running in SSE mode on port ${port}`);
      });
    } 
    else {
      throw new Error(`Unsupported transport: ${argv.transport}`);
    }
  } catch (error: any) {
    console.error('Failed to start MCP server:', error.message);
    process.exit(1);
  }
}

// Iniciar servidor
startServer().catch(error => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
}); 