const fs = require('fs');
const path = require('path');

class FileStorage {
  constructor(filePath) {
    this.filePath = path.resolve(filePath);

    // Garante que o arquivo exista
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2));
    }
  }

  read() {
    try {
      const content = fs.readFileSync(this.filePath, 'utf-8');
      return content ? JSON.parse(content) : [];
    } catch (err) {
      console.error('Erro ao ler arquivo:', err);
      return [];
    }
  }

  write(data) {
    try {
      fs.writeFileSync(
        this.filePath,
        JSON.stringify(data, null, 2),
        'utf-8'
      );
    } catch (err) {
      console.error('Erro ao escrever arquivo:', err);
    }
  }
}

module.exports = FileStorage;