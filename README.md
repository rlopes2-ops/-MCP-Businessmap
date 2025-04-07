# MCP Businessmap

MCP Server para busca e gerenciamento de cards no Businessmap (Kanbanize).

## Ferramentas

1. `businessmap_search`
   * Busca cards no Businessmap
   * Entrada Obrigatória: `query` (string)
   * Entradas Opcionais:
     * `board_id` (number)
     * `column_id` (number)
     * `limit` (number)
     * `sort_by` (string)
     * `sort_direction` (string)
   * Retorna: Array de cards com detalhes como título, descrição, status, etc.

2. `businessmap_get_card`
   * Obtém detalhes de um card específico
   * Entrada Obrigatória: `card_id` (number)
   * Retorna: Informações detalhadas sobre o card, incluindo histórico, comentários, anexos, etc.

3. `businessmap_create_card`
   * Cria um novo card
   * Entradas Obrigatórias:
     * `board_id` (number)
     * `title` (string)
   * Entradas Opcionais:
     * `description` (string)
     * `column_id` (number)
     * `priority` (string)
     * `tags` (array)
   * Retorna: Informações do card criado

4. `businessmap_update_card`
   * Atualiza um card existente
   * Entrada Obrigatória: `card_id` (number)
   * Entradas Opcionais:
     * `title` (string)
     * `description` (string)
     * `column_id` (number)
     * `priority` (string)
   * Retorna: Informações do card atualizado

5. `businessmap_delete_card`
   * Exclui um card existente
   * Entrada Obrigatória: `card_id` (number)
   * Retorna: Status da operação

6. `businessmap_add_comment`
   * Adiciona um comentário a um card
   * Entradas Obrigatórias:
     * `card_id` (number)
     * `comment` (string)
   * Retorna: Informações do comentário adicionado

## Funcionalidades

* Integração completa com a API do Businessmap (Kanbanize)
* Suporte para modo somente leitura (--read-only)
* Retorna dados JSON estruturados
* Filtragem por quadros específicos
* Configuração via variáveis de ambiente ou linha de comando

## Setup

### Instalando no Claude Desktop

Antes de começar, certifique-se de que o Python 3.7+ está instalado em seu desktop.

1. Vá para: Configurações > Desenvolvedor > Editar Configuração
2. Adicione o seguinte ao seu `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "businessmap": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-businessmap",
        "--transport=sse",
        "--port=8000",
        "--businessmap-url=https://sua-empresa.kanbanize.com",
        "--businessmap-apikey=sua_api_key"
      ]
    }
  }
}
```

Para modo somente leitura, use esta versão com `--read-only`:

```json
{
  "mcpServers": {
    "businessmap": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-businessmap",
        "--transport=sse",
        "--port=8000",
        "--businessmap-url=https://sua-empresa.kanbanize.com",
        "--businessmap-apikey=sua_api_key",
        "--read-only"
      ]
    }
  }
}
```

3. Reinicie o Claude Desktop e comece a gerenciar seus projetos com Businessmap!

### Configuração com N8N

Para usar o MCP-Businessmap com N8N:

1. No N8N, crie uma nova credencial do tipo "MCP Client (STDIO) API"
2. Configure com os seguintes parâmetros:
   - **Nome da Credencial**: "BusinessmapIntegration" (ou outro nome com pelo menos 3 caracteres)
   - **Comando**: `npx`
   - **Argumentos**:
     ```
     -y
     mcp-businessmap
     --transport=sse
     --port=8000
     --businessmap-url=https://sua-empresa.kanbanize.com
     --businessmap-apikey=sua_api_key
     ```

**IMPORTANTE**: Certifique-se de que cada argumento esteja em uma linha separada, conforme mostrado acima.

Para solucionar problemas de conexão, você pode adicionar o argumento `--verbose` para obter mais informações de depuração.

### Outra Opção: Instalando via Smithery

Para instalar mcp-businessmap para Claude Desktop automaticamente via Smithery:

```bash
npx -y @smithery/cli install mcp-businessmap --client claude
```

### Instalação Manual

```bash
# Usando pip
pip install mcp-businessmap

# Usando Docker
git clone https://github.com/rlopes2-ops/-MCP-Businessmap.git
cd MCP-Businessmap
docker build -t mcp/businessmap .
docker run -p 8000:8000 mcp/businessmap --transport=sse --port=8000 --businessmap-url=https://sua-empresa.kanbanize.com --businessmap-apikey=sua_api_key
```

## Configuração e Uso

Você pode configurar o servidor MCP usando argumentos de linha de comando:

```bash
mcp-businessmap \
  --transport=sse \
  --port=8000 \
  --businessmap-url=https://sua-empresa.kanbanize.com \
  --businessmap-apikey=sua_api_key
```

### Argumentos Opcionais

- `--transport`: Escolha o tipo de transporte (`stdio` [padrão] ou `sse`)
- `--port`: Número da porta para transporte SSE (padrão: 8000)
- `--businessmap-ssl-verify/--no-businessmap-ssl-verify`: Ativar/desativar verificação SSL
- `--businessmap-boards-filter`: Lista separada por vírgulas de IDs de quadros para filtrar resultados
- `--read-only`: Executar em modo somente leitura (desativa todas as operações de escrita)
- `--verbose`: Aumentar verbosidade de log

## Build (para desenvolvedores)

```bash
# Clonando o repositório
git clone https://github.com/rlopes2-ops/-MCP-Businessmap.git
cd MCP-Businessmap

# Instalando dependências
pip install -e .

# Executando testes
pytest
```

## Licença

Este MCP server é licenciado sob a Licença MIT.

## Disclaimer

Businessmap e Kanbanize são marcas registradas de seus respectivos proprietários. Este projeto não está relacionado oficialmente à Kanbanize ou suas subsidiárias. 