FROM node:20-alpine

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar todas as dependências (incluindo dev)
RUN npm install

# Copiar código fonte
COPY . .

EXPOSE 5173

# Rodar Vite em modo desenvolvimento para hot reload
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]