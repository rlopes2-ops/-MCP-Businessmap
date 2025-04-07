# MCP-Businessmap

MCP Server para o Businessmap (Kanbanize), permitindo buscar, visualizar e gerenciar quadros e cartões.

## Ferramentas

O MCP-Businessmap fornece as seguintes ferramentas para interação com o Businessmap:

1. `businessmap_search`: Busca por cartões no Businessmap.
   - Parâmetros obrigatórios:
     - `query`: Texto para buscar
   - Parâmetros opcionais:
     - `board_ids`: Lista de IDs de quadros (separados por vírgula)
     - `max_results`: Número máximo de resultados

2. `businessmap_get_card`: Obtém detalhes de um cartão específico.
   - Parâmetros obrigatórios:
     - `card_id`: ID do cartão

3. `businessmap_create_card`: Cria um novo cartão.
   - Parâmetros obrigatórios:
     - `board_id`: ID do quadro
     - `workflow_id`: ID do workflow
     - `lane_id`: ID da lane
     - `column_id`: ID da coluna
     - `title`: Título do cartão
   - Parâmetros opcionais:
     - `description`: Descrição do cartão
     - `priority`: Prioridade do cartão
     - `assignee_ids`: IDs dos responsáveis (separados por vírgula)

4. `businessmap_update_card`: Atualiza um cartão existente.
   - Parâmetros obrigatórios:
     - `card_id`: ID do cartão
   - Parâmetros opcionais:
     - `title`: Novo título
     - `description`: Nova descrição
     - `column_id`: Nova coluna
     - `lane_id`: Nova lane
     - `priority`: Nova prioridade
     - `assignee_ids`: Novos responsáveis (separados por vírgula)

5. `businessmap_delete_card`: Remove um cartão.
   - Parâmetros obrigatórios:
     - `card_id`: ID do cartão

6. `businessmap_add_comment`: Adiciona um comentário a um cartão.
   - Parâmetros obrigatórios:
     - `card_id`: ID do cartão
     - `text`: Texto do comentário

## Requisitos

- Node.js 14+
- Acesso a uma instância do Businessmap/Kanbanize
- API key do Businessmap

## Instalação

```bash
npm install -g mcp-businessmap
```

## Uso

### Como executável

```bash
mcp-businessmap --transport=stdio --businessmap-url=https://your-instance.businessmap.io --businessmap-apikey=YOUR_API_KEY
```

### Como servidor HTTP/SSE

```bash
mcp-businessmap --transport=sse --port=8000 --host=0.0.0.0 --businessmap-url=https://your-instance.businessmap.io --businessmap-apikey=YOUR_API_KEY
```

## Opções

- `--transport`: Protocolo de transporte (`stdio` ou `sse`). Padrão: `stdio`
- `--port`: Porta para o servidor HTTP (apenas para o transporte `sse`). Padrão: `8000`
- `--host`: Host para o servidor HTTP (apenas para o transporte `sse`). Padrão: `0.0.0.0`
- `--businessmap-url`: URL da sua instância do Businessmap.
- `--businessmap-apikey`: Chave de API do Businessmap.
- `--businessmap-boards-filter`: Lista de IDs de quadros para filtrar (separados por vírgula).
- `--read-only`: Modo somente leitura (desativa operações de escrita). Padrão: `false`
- `--businessmap-ssl-verify`: Verificar certificados SSL. Padrão: `true`
- `--verbose`: Logs detalhados. Padrão: `false`

## Variáveis de ambiente

Em vez de passar argumentos na linha de comando, você pode usar variáveis de ambiente:

- `BUSINESSMAP_URL`: URL da sua instância do Businessmap.
- `BUSINESSMAP_APIKEY`: Chave de API do Businessmap.
- `BUSINESSMAP_BOARDS_FILTER`: Lista de IDs de quadros para filtrar (separados por vírgula).
- `READ_ONLY_MODE`: Modo somente leitura (`true` ou `false`).

## Uso com n8n

Para usar o MCP-Businessmap com o n8n:

1. Instale o pacote mcp-businessmap globalmente no servidor onde o n8n está rodando:
   ```bash
   npm install -g mcp-businessmap
   ```

2. Inicie o MCP como um servidor HTTP/SSE:
   ```bash
   mcp-businessmap --transport=sse --port=8001 --host=0.0.0.0 --businessmap-url=https://your-instance.businessmap.io --businessmap-apikey=YOUR_API_KEY --verbose
   ```

3. No n8n, adicione uma nova credencial:
   - Tipo: MCP Client (MCP Server)
   - SSE URL: `http://your-server-ip:8001/sse`
   - Messages Post Endpoint: `http://your-server-ip:8001/json-rpc`

4. Agora você pode usar o nó MCP nos seus workflows para interagir com o Businessmap.

## Melhorias para compatibilidade com n8n

Versão 1.1.0 traz as seguintes melhorias para compatibilidade com n8n:

- Suporte completo a CORS para evitar problemas de conexão
- Escuta em todas as interfaces de rede por padrão
- Implementação SSE mais robusta com heartbeat a cada 30 segundos
- Logs detalhados para ajudar no diagnóstico de problemas
- Endpoint de verificação de saúde para monitoramento
- Tratamento de erros aprimorado

## Desenvolvimento

### Clonar o repositório

```bash
git clone https://github.com/rlopes2-ops/-MCP-Businessmap.git
cd -MCP-Businessmap
```

### Instalar dependências

```bash
npm install
```

### Executar em modo de desenvolvimento

```bash
npm run dev -- --transport=sse --port=8000 --businessmap-url=https://your-instance.businessmap.io --businessmap-apikey=YOUR_API_KEY
```

### Compilar

```bash
npm run build
```

## Licença

MIT

## Disclaimer

Businessmap e Kanbanize são marcas registradas de seus respectivos proprietários. Este projeto não está relacionado oficialmente à Kanbanize ou suas subsidiárias. 