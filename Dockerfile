FROM node:14.7.0
USER node
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/hytuslain
COPY package.json ./
RUN npm install
USER node
COPY --chown=node:node . .
CMD [ "node", "index.js" ]
