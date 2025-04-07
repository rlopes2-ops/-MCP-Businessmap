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

### Instalação via npm (Recomendado)

```bash
# Instalar globalmente
npm install -g mcp-businessmap

# Executar o servidor (substitua os valores pelas suas credenciais)
mcp-businessmap --transport=sse --port=8000 --businessmap-url=https://sua-instancia.kanbanize.com --businessmap-apikey=SUA_API_KEY
```

Ou use-o diretamente via npx:

```bash
# Substitua os valores com suas credenciais
npx mcp-businessmap --transport=sse --port=8000 --businessmap-url=https://sua-instancia.kanbanize.com --businessmap-apikey=SUA_API_KEY
```

### Instalando no Claude Desktop

Antes de começar, certifique-se de que o Node.js está instalado em seu desktop.

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
        "--businessmap-url=https://sua-instancia.kanbanize.com",
        "--businessmap-apikey=SUA_API_KEY"
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
        "--businessmap-url=https://sua-instancia.kanbanize.com",
        "--businessmap-apikey=SUA_API_KEY",
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
     --businessmap-url=https://sua-instancia.kanbanize.com
     --businessmap-apikey=SUA_API_KEY
     ```

**IMPORTANTE**: 
- Certifique-se de que cada argumento esteja em uma linha separada, conforme mostrado acima.
- Substitua "https://sua-instancia.kanbanize.com" pela URL do seu Businessmap
- Substitua "SUA_API_KEY" pela sua chave de API do Businessmap
- Por segurança, considere usar variáveis de ambiente para armazenar sua chave de API

Alternativamente, você pode iniciar o servidor separadamente e configurar o N8N para se conectar a ele:

1. Inicie o servidor em uma máquina acessível pela rede:
```bash
npx mcp-businessmap --transport=sse --port=8000 --businessmap-url=https://sua-instancia.kanbanize.com --businessmap-apikey=SUA_API_KEY
```

2. No N8N, use a opção "MCP Client (MCP Server)" em vez de "MCP Client (STDIO) API":
   - URL: `http://IP-DA-MÁQUINA:8000`

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
docker run -p 8000:8000 mcp/businessmap --transport=sse --port=8000 --businessmap-url=https://sua-instancia.kanbanize.com --businessmap-apikey=SUA_API_KEY
```

## Configuração e Uso

Você pode configurar o servidor MCP usando argumentos de linha de comando:

```bash
mcp-businessmap \
  --transport=sse \
  --port=8000 \
  --businessmap-url=https://sua-instancia.kanbanize.com \
  --businessmap-apikey=SUA_API_KEY
```

### Argumentos Opcionais

- `--transport`: Escolha o tipo de transporte (`stdio` [padrão] ou `sse`)
- `--port`: Número da porta para transporte SSE (padrão: 8000)
- `--businessmap-ssl-verify/--no-businessmap-ssl-verify`: Ativar/desativar verificação SSL
- `--businessmap-boards-filter`: Lista separada por vírgulas de IDs de quadros para filtrar resultados
- `--read-only`: Executar em modo somente leitura (desativa todas as operações de escrita)
- `--verbose`: Aumentar verbosidade de log

## Segurança

**IMPORTANTE**: Nunca compartilhe sua chave de API do Businessmap em código-fonte público ou repositórios. Prefira usar:

1. Variáveis de ambiente
2. Arquivos de configuração que não são versionados (.env)
3. Segredos gerenciados pelo seu serviço de hospedagem

## Build (para desenvolvedores)

```bash
# Clonando o repositório
git clone https://github.com/rlopes2-ops/-MCP-Businessmap.git
cd MCP-Businessmap

# Instalando dependências
pip install -e .

# Para desenvolvimento do pacote npm
npm install
npm link  # Para testar localmente
```

## Publicação no npm

Este pacote é publicado automaticamente no npm através de GitHub Actions. O processo funciona da seguinte forma:

1. **Push para branch main**: Sempre que ocorre um push para a branch main, o GitHub Actions executa o workflow de publicação.

2. **Criação de tag**: Para criar uma versão específica, crie e faça push de uma tag no formato `v1.0.0`:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

3. **Configuração necessária**: Para que a publicação automática funcione, você precisa adicionar um segredo chamado `NPM_TOKEN` nas configurações do repositório no GitHub:
   - Vá para o repositório no GitHub
   - Acesse "Settings" > "Secrets and variables" > "Actions"
   - Clique em "New repository secret"
   - Nome: `NPM_TOKEN`
   - Valor: Token de acesso do npm (gere um em npmjs.com > Account > Access Tokens)

### Publicação manual (alternativa)

Para publicar manualmente (se tiver npm instalado):

```bash
npm login
npm publish
```

## Licença

Este MCP server é licenciado sob a Licença MIT.

## Disclaimer

Businessmap e Kanbanize são marcas registradas de seus respectivos proprietários. Este projeto não está relacionado oficialmente à Kanbanize ou suas subsidiárias. 