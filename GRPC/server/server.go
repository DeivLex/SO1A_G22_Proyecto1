package main

import (
	"bytes"
	"context"
	"fmt"
	"log"
	"net"
	"net/http"

	"encoding/json"

	greetpb "grpcserver/greet.pb"

	"google.golang.org/grpc"
)

type server struct{}

func (*server) Greet(ctx context.Context, req *greetpb.GreetRequest) (*greetpb.GreetResponse, error) {
	fmt.Println("SERVER: recibiendo data ", req.GetGreeting().GetPath())
	host := "http://34.121.110.42/"
	//host := "http://localhost:5000/"
	//host := "http://0.0.0.0:5000/"

	result := "todo bien SERVER"

	data, _ := json.Marshal(req.GetGreeting())
	http.Post(host, "application/json", bytes.NewBuffer(data))

	res := &greetpb.GreetResponse{
		Result: result,
	}

	return res, nil
}

func main() {
	host := "0.0.0.0:3000"

	fmt.Println("SERVER: server iniciado en ", host)

	lis, err := net.Listen("tcp", host)
	if err != nil {
		log.Fatalf("SERVER: error 1 ", err)
	}

	s := grpc.NewServer()

	greetpb.RegisterGreetServiceServer(s, &server{})

	if err := s.Serve(lis); err == nil {
		log.Fatalf("SERVER: error ", err)
	}

}
