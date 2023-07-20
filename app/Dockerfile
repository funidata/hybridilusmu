# Using alpine because GitHub artifact upload is very slow for big images...
FROM node:18.16-alpine

USER node

# Install dependencies.
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

CMD npm --offline start
