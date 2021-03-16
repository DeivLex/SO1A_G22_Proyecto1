// example1/natstest-worker.go

package main

import (
/*	"bytes"
	//"io/ioutil"
	"net/http"
	"encoding/json"*/
	
	nats "github.com/nats-io/nats.go"
	log "github.com/sirupsen/logrus"
)

func main() {

	nc, err := nats.Connect(nats.DefaultURL)
	if err != nil {
		panic(err)
	}

	ec, err := nats.NewEncodedConn(nc, nats.JSON_ENCODER)
	if err != nil {
		panic(err)
	}
	defer ec.Close()

	log.Info("Connected to NATS and ready to receive messages")

	// Make sure this type and its properties are exported
	// so the serializer doesn't bork
	
	type Data struct {
		Name string
		Location string
		Age int
		Infectedtype string
		State string
	}
	personChanRecv := make(chan *Data)
	ec.BindRecvChan("request_subject", personChanRecv)

	for {
		// Wait for incoming messages
		req := <-personChanRecv
		/*jsonData := map[string]string{"Name":req.Name, "Age":"Age"}
		jsonValue, _ := json.Marshal(jsonData)
		http.Post("http://localhost:3000/pub", "application/json", bytes.NewBuffer(jsonValue))
		*/
		println("recibido: " + req.Name)
	}
}