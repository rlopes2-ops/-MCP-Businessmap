// package-scripts.js
const { series, rimraf } = require('nps-utils');

module.exports = {
  scripts: {
    clean: {
      description: 'Remove node_modules e arquivos de build',
      default: rimraf('node_modules')
    },
    build: {
      description: 'Prepara o pacote para publicação',
      default: 'echo "Preparando pacote para publicação"'
    },
    test: {
      description: 'Testa o script do wrapper',
      default: 'node ./bin/mcp-businessmap.js --help'
    },
    prepare: {
      description: 'Prepara o pacote para publicação',
      default: series.nps('clean', 'build')
    }
  }
}; 