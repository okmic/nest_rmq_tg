FROM node:20-alpine

WORKDIR /app

RUN corepack enable && \
    yarn global add nodemon

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

EXPOSE 3000 9229

CMD ["yarn", "start:dev"]