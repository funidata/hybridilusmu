FROM node:16.13.0-alpine as build
WORKDIR /build

COPY package*.json ./
COPY src src/

RUN npm install \
    && chmod -R +xr .

FROM node:16.13.0-alpine
WORKDIR /usr/app

COPY --from=build /build ./

USER node

CMD [ "npm", "start" ]
