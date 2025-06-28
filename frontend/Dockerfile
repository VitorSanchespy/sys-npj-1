# Etapa 1: Servir o frontend em modo desenvolvimento
FROM node:18-alpine

WORKDIR /app

# Copiar os arquivos de dependências
COPY package*.json ./

RUN npm config set registry https://registry.npmjs.org/

# Instalar dependências
RUN npm install

# Copiar o código do frontend
COPY . .

# Expor a porta do Vite (padrão 5173)
EXPOSE 5173

# Rodar o servidor de desenvolvimento do Vite
CMD ["npm", "run", "dev"]
