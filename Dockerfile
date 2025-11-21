# build environment
FROM node:22-alpine as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json ./
RUN yarn install
COPY . ./

ARG APP_BUILD=production
ENV APP_BUILD=${APP_BUILD}

RUN yarn build

# production environment
FROM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/assets /usr/share/nginx/html/assets

# Install envsubst
RUN apk add --no-cache gettext

CMD ["/bin/sh", "-c", "envsubst < /usr/share/nginx/html/assets/env.sample.js > /usr/share/nginx/html/assets/env.js && exec nginx -g 'daemon off;'"]

EXPOSE 80
