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

# Install envsubst
RUN apk add --no-cache gettext

CMD ["/bin/sh", "-c", "exec nginx -g 'daemon off;'"]

EXPOSE 80
