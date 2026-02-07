FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

RUN npm install
RUN npm run prisma:generate

COPY src ./src

RUN npm run build

EXPOSE 3005

CMD ["npm", "start"]
