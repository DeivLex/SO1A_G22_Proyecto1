FROM golang

WORKDIR /

COPY . .

RUN go mod download

CMD ["go", "run", "sub.go"]