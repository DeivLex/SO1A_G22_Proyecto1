FROM golang
WORKDIR /
COPY . .
ENV GOOGLE_APPLICATION_CREDENTIALS="./llave.json"
RUN go mod download
CMD ["go", "run", "sub.go"]