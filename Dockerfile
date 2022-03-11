FROM node:16.13.0-alpine
WORKDIR /usr/app

COPY package*.json ./

RUN npm install \
    && chmod -R +xr .

COPY . .

USER node

CMD [ "npm", "start" ]
