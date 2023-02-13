FROM node:16-alpine3.16 as builder

COPY . .

COPY localhost.env .env

RUN yarn install \ 
    && NODE_ENV=production yarn build

EXPOSE 3001

ENTRYPOINT [ "yarn", "start" ]

