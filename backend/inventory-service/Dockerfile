FROM node:18-alpine

WORKDIR /app
RUN apk add --no-cache openssl


COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

RUN npm install
RUN npm run prisma:generate

COPY src ./src

RUN npm run build

EXPOSE 3002

CMD ["npm", "start"]
