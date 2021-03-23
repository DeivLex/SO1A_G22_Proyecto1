package main

import (
	"context"

	"log"

	"encoding/json"
	"net/http"

	greetpb "grpcclient/greet.pb"

	"google.golang.org/grpc"
)

func enviarMensaje(name string, location string, age int64, infectedtype string, state string) {
	server := "grpcserver:3000"
	//server := "0.0.0.0:3000"

	println("CLIENTE: Enviando peticion a ", server)

	//para no utilizar ssl
	cc, err := grpc.Dial(server, grpc.WithInsecure())
	if err != nil {
		log.Fatalf("CLIENTE: error 1 ", err)
	}

	defer cc.Close()

	c := greetpb.NewGreetServiceClient(cc)

	//println("CLIENTE: Conectado a ", server)

	request := &greetpb.GreetRequest{
		Greeting: &greetpb.Greeting{
			Name:         name,
			Location:     location,
			Age:          age,
			Infectedtype: infectedtype,
			State:        state,
			Path:         "GRPC",
		},
	}

	res, err := c.Greet(context.Background(), request)
	if err != nil {
		log.Fatalf("CLIENTE:  error 2 ", err)
	}

	//println("CLIENTE: resultado ", res.Result)

}

func main() {
	type Data struct {
		Name         string
		Location     string
		Age          int64
		Infectedtype string
		State        string
	}

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		var d Data
		err := json.NewDecoder(r.Body).Decode(&d)
		if err != nil {
			//println("CLIENTE: error 3")
		} else {
			enviarMensaje(d.Name, d.Location, d.Age, d.Infectedtype, d.State)
		}
	})
	println("CLIENTE: servidor de cliente escuchando")
	http.ListenAndServe("0.0.0.0:8000", nil)

}

//Creo que no es necesario con el anterior de greet.proto
//go get github.com/golang/protobuf/proto
//go get google.golang.org/grpc
//go get google.golang.org/protobuf/reflect/protoreflect@v1.25.0
