FROM node:24.21-alpine

WORKDIR /app

RUN npm install -g npm@12.1

COPY ./package*.json ./

RUN npm ci

COPY . .

RUN npm run build

ENV APP_DB_HOST=host.docker.internal
ENV APP_DB_USERNAME=wpu_staff_clearance
ENV NODE_ENV=production

RUN chmod +x entrypoint.sh

EXPOSE 3000

CMD ["./entrypoint.sh"]
