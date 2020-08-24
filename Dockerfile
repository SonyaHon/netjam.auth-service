FROM node:lts-buster
WORKDIR /usr/app
COPY package.json /usr/app
RUN npm install
ADD . /usr/app

CMD ["npm", "start"]
EXPOSE 9091