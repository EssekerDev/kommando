FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json ./
RUN npm install

FROM node:22-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# La valeur change à chaque livraison. Sans ça, Docker Desktop peut
# réutiliser l'ancien `npm run build` et le conteneur ne change pas.
ARG SOURCE_HASH=none
RUN echo "source ${SOURCE_HASH}" && npm run build

FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3847
ENV HOSTNAME=0.0.0.0
RUN addgroup -S kommando && adduser -S kommando -G kommando
COPY --from=build --chown=kommando:kommando /app/.next/standalone ./
COPY --from=build --chown=kommando:kommando /app/.next/static ./.next/static
COPY --from=build --chown=kommando:kommando /app/public ./public
USER kommando
EXPOSE 3847
CMD ["node", "server.js"]
