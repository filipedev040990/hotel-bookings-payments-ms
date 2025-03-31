FROM node:20.12

WORKDIR /app

COPY package*.json ./

RUN npm install --loglevel verbose --legacy-peer-deps

RUN apt-get update

COPY . .

RUN npm run build

EXPOSE 3004

CMD [ "npm", "start" ]