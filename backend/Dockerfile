FROM node:20-alpine

WORKDIR /app

# Instalar dependências necessárias para bcrypt e nodemon
RUN apk add --no-cache python3 make g++

# Copiar apenas os arquivos de dependências primeiro
COPY package*.json ./

# Instalar todas as dependências (incluindo dev)
RUN npm install

# Copiar o resto do código
COPY . .

EXPOSE 3001

# Usar nodemon para desenvolvimento (hot reload)
CMD ["npx", "nodemon", "index.js"]