import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export default class FileStorage {
  constructor(filePath) {
    this.filePath = path.join(__dirname, '..', 'data', 'players.json');

    const dir = path.dirname(this.filePath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
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