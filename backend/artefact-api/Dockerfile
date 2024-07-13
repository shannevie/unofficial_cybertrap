# Start from the official Golang base image
FROM golang:1.22.5-alpine

# Set the current working directory inside the container
WORKDIR /app

# Copy go.mod and go.sum files
COPY go.mod go.sum ./

# Download all dependencies. Dependencies will be cached if the go.mod and go.sum files are not changed
RUN go mod download

# Copy the entire project to the container
COPY . .

# Set the working directory to where your main.go file is located
WORKDIR /app/cmd

# Build the Go application
RUN go build -o /app/main .

# Set the working directory to the app root again
WORKDIR /app

# Expose port 8080 to the outside world
EXPOSE 8080

# Command to run the executable
CMD ["./main"]