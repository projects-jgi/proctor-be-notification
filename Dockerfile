FROM node:25-alpine AS builder

WORKDIR /app

ARG PROCTOR_AI_URL
ENV PROCTOR_AI_URL=PROCTOR_AI_URL

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:25-alpine AS runner

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package*.json ./

ENV NODE_ENV=production

EXPOSE 3333

CMD ["npm", "run", "start:prod"]