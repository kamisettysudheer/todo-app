FROM golang:1.24

WORKDIR /app

# Copy go.mod and go.sum first for better caching
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the source code
COPY . .

# Build the application
RUN go build -o main .

EXPOSE 8080

CMD ["./main"]
