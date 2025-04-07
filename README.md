# MCP Businessmap

Projeto Model Context Protocol (MCP) para Businessmap (Kanbanize). Esta integração suporta acesso a cards, quadros, workfluxos e outras funcionalidades do Businessmap.

## Funcionalidades 

- Busca de cards usando texto
- Obtenção, criação, atualização e exclusão de cards
- Gerenciamento de comentários
- Visualização de quadros e colunas
- Movimentação de cards entre colunas

## Instalação

```bash
# Usando pip
pip install mcp-businessmap

# Usando Docker
git clone https://github.com/seu-usuario/mcp-businessmap.git
cd mcp-businessmap
docker build -t mcp/businessmap .
```

## Configuração e Uso

Você pode configurar o servidor MCP usando argumentos de linha de comando:

```bash
mcp-businessmap \
  --businessmap-url https://sua-empresa.kanbanize.com \
  --businessmap-apikey sua_api_key
```

### Argumentos Opcionais

- `--transport`: Escolha o tipo de transporte (`stdio` [padrão] ou `sse`)
- `--port`: Número da porta para transporte SSE (padrão: 8000)
- `--businessmap-ssl-verify/--no-businessmap-ssl-verify`: Ativar/desativar verificação SSL
- `--businessmap-boards-filter`: Lista separada por vírgulas de IDs de quadros para filtrar resultados
- `--read-only`: Executar em modo somente leitura (desativa todas as operações de escrita)
- `--verbose`: Aumentar verbosidade de log

## Integração com IDEs

### Claude Desktop Setup

```json
{
  "mcpServers": {
    "mcp-businessmap": {
      "command": "mcp-businessmap",
      "args": [
        "--businessmap-url=https://sua-empresa.kanbanize.com",
        "--businessmap-apikey=sua_api_key"
      ]
    }
  }
}
```

### Cursor IDE Setup

1. Abra as Configurações do Cursor
2. Navegue até `Recursos` > `Servidores MCP`
3. Clique em `+ Adicionar novo servidor MCP global`

## Recursos Disponíveis

- `businessmap://{board_id}`: Acesso a quadros do Businessmap

## Ferramentas Disponíveis

| Ferramenta | Descrição |
|------|-------------|
| `businessmap_search` | Busca cards no Businessmap |
| `businessmap_get_card` | Obtém detalhes de um card específico |
| `businessmap_create_card` | Cria um novo card |
| `businessmap_update_card` | Atualiza um card existente |
| `businessmap_delete_card` | Exclui um card existente |
| `businessmap_add_comment` | Adiciona um comentário a um card |

## Licença

Licenciado sob MIT - veja o arquivo LICENSE.

Este projeto é baseado no projeto [MCP-Atlassian](https://github.com/sooperset/mcp-atlassian) mas foi adaptado para trabalhar com o Businessmap (Kanbanize). 