FROM public.ecr.aws/bitnami/node:12-prod-debian-10
RUN mkdir -p /app
WORKDIR /app
COPY ./package.json ./
RUN npm install
COPY . .
RUN ls
RUN npm run build
EXPOSE 8081

RUN chmod +x start.sh

ENTRYPOINT ["./start.sh"]
