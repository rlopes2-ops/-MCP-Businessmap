#!/usr/bin/env node

const spawn = require('cross-spawn');
const path = require('path');
const fs = require('fs');

// AVISO: Nunca inclua dados sensíveis como chaves de API diretamente no código
// Use variáveis de ambiente ou arquivos de configuração separados

// Obtém argumentos da linha de comando
const args = process.argv.slice(2);

// Verificação básica de segurança para evitar exposição de chaves de API no histórico
args.forEach((arg, index) => {
  if ((arg.includes('--businessmap-apikey=') || arg === '--businessmap-apikey') && args[index + 1] && args[index + 1].length > 10) {
    console.warn('\x1b[33m%s\x1b[0m', 'AVISO DE SEGURANÇA: Você está passando uma chave de API diretamente na linha de comando.');
    console.warn('\x1b[33m%s\x1b[0m', 'Considere usar variáveis de ambiente para proteger suas credenciais.');
  }
});

// Verifica se o Python está instalado
try {
  const pythonVersion = spawn.sync('python', ['--version']).stdout;
  if (!pythonVersion) {
    console.error('Python não encontrado. Certifique-se de que o Python (3.7+) está instalado e acessível.');
    process.exit(1);
  }
} catch (error) {
  console.error('Erro ao verificar a versão do Python:', error.message);
  console.error('Certifique-se de que o Python (3.7+) está instalado e acessível.');
  process.exit(1);
}

// Verifica se o módulo mcp_businessmap está instalado
try {
  // Tenta instalar o mcp-businessmap se não estiver instalado
  const pipCheck = spawn.sync('pip', ['show', 'mcp-businessmap']);
  
  if (pipCheck.status !== 0) {
    console.log('Instalando mcp-businessmap...');
    // Tenta clonar e instalar do GitHub se não estiver disponível via pip
    const tempDir = path.join(require('os').tmpdir(), 'mcp-businessmap-' + Date.now());
    
    try {
      fs.mkdirSync(tempDir, { recursive: true });
      
      // Clone repo
      console.log('Clonando repositório...');
      const cloneResult = spawn.sync('git', [
        'clone',
        'https://github.com/rlopes2-ops/-MCP-Businessmap.git',
        tempDir
      ], { stdio: 'inherit' });
      
      if (cloneResult.status !== 0) {
        throw new Error('Falha ao clonar o repositório');
      }
      
      // Instalar com pip
      console.log('Instalando pacote...');
      const installResult = spawn.sync('pip', [
        'install',
        '-e',
        tempDir
      ], { stdio: 'inherit' });
      
      if (installResult.status !== 0) {
        throw new Error('Falha ao instalar o pacote');
      }
      
      console.log('mcp-businessmap instalado com sucesso!');
    } catch (error) {
      console.error('Erro durante a instalação:', error.message);
      process.exit(1);
    }
  }
} catch (error) {
  console.error('Erro ao verificar instalação do mcp-businessmap:', error.message);
  process.exit(1);
}

// Executa o módulo Python
console.log('Iniciando servidor MCP-Businessmap...');
const result = spawn.sync('python', ['-m', 'mcp_businessmap', ...args], {
  stdio: 'inherit'
});

process.exit(result.status); 