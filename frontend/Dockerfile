FROM node:20-alpine

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Usar npm install em vez de npm ci (quando não há package-lock.json)
RUN npm install

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Expor porta
EXPOSE 5173

# Usar dev server para desenvolvimento
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]