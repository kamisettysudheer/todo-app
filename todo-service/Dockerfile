FROM golang:1.24

WORKDIR /app

RUN go mod init todo-service
RUN go mod tidy
RUN go mod download

COPY . .

EXPOSE 8080

CMD ["go", "run", "."]
