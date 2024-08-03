# Start from the official Golang base image
FROM golang:1.22.5-alpine as builder

# Set the current working directory inside the container
WORKDIR /app

# Copy go.mod and go.sum files
COPY go.mod go.sum ./

# Download all dependencies. Dependencies will be cached if the go.mod and go.sum files are not changed
RUN go mod download

# Copy the entire project to the container
COPY . .

# Set the working directory to where your main.go file is located for each service
# Build the domains_api binary
RUN go build -o /bin/domains_api ./cmd/domains_api

# Build the artefacts_api binary
# RUN go build -o /bin/artefacts_api ./cmd/artefacts_api

# Build the nuclei_scanner binary
# RUN go build -o /bin/nuclei_scanner ./cmd/nuclei_scanner

# Create a minimal runtime image
FROM alpine:latest

# Copy binaries from the builder stage
COPY --from=builder /bin/domains_api /bin/domains_api

# COPY --from=builder /bin/artefacts_api /bin/artefacts_api
# COPY --from=builder /bin/nuclei_scanner /bin/nuclei_scanner

# Default command
CMD ["sh"]