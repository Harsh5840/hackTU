FROM node:18-alpine

RUN apk -U add openssl

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

RUN npm install
RUN npm run prisma:generate

COPY src ./src

RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
