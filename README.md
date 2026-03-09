# ⚓ Batalha Naval - PLP 2025.2

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)

Uma recriação do clássico jogo de tabuleiro **Batalha Naval**, construída com uma arquitetura Fullstack em JavaScript. 

Projeto Desenvolvido como requisito para aprovação na disciplina de Paradigmas de Linguagens de Programação, ministrada pelo professor **Dimas Cassimiro**, na Universidade Federal do Agreste de Pernambuco - UFAPE

## Como Executar o Projeto Localmente

Antes de começar, você precisará ter o [Node.js](https://nodejs.org/) instalado na sua máquina.

Abra o seu terminal e rode os comando abaixo:
```bash
# 1. Clone o repositório e entre na pasta
git clone [https://github.com/baracholeticia/batalha-naval.git](https://github.com/baracholeticia/batalha-naval.git)
cd batalha-naval

# 2. Terminal 1: Iniciando o Backend
cd backend/src
npm install
node index.js
# O servidor iniciará na porta 3000. Deixe este terminal rodando!

# 3. Terminal 2: Iniciando o Frontend 
# (Abra uma nova aba ou janela de terminal na raiz do projeto 'batalha-naval')
cd frontend
npm install
npm run dev
# O Vite exibirá um link (ex: http://localhost:5173). Clique nele para jogar!
```

## Funcionalidades

* **Modos de Jogo:**
  * **Clássico:** Posicione sua frota e afunde os navios da IA.
  * **Dinâmico:** Mova um de seus navios uma casa por turno para desviar dos ataques inimigos.
  * **Campanha:** Enfrente três níveis de dificuldade de IA em sequência.
* **Sistema de Usuários:** Cadastro, login e edição de perfil (nome, username e senha).
* **Ranking Global:** Tabela de classificação baseada no número de vitórias dos jogadores.
* **Trilha sonora:** Efeitos sonoros para tiros na água (miss), acertos (hit) e música ambiente.
* **Persistência de Dados:** Backend construído com sistema de armazenamento em arquivos JSON (`FileStorage`), garantindo que contas, estatísticas e rankings fiquem salvos.

## Tecnologias Utilizadas

**Frontend:**
* React.js (com Vite)
* React Router DOM (Navegação)
* CSS3 (Estilização pura e animações)

**Backend:**
* Node.js
* Express
* Cors
* File System (`fs`)
