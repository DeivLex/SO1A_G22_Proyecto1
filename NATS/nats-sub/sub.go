// example1/natstest-worker.go

package main

import (
	"bytes"
	//"io/ioutil"
	"net/http"
	"encoding/json"
	"strconv"
	nats "github.com/nats-io/nats.go"
	log "github.com/sirupsen/logrus"
)

func main() {

	nc, err := nats.Connect("nats://nats:4222")
	//nc, err := nats.Connect(nats.DefaultURL)
	url := "http://34.121.110.42/"
	if err != nil {
		panic(err)
	}

	ec, err := nats.NewEncodedConn(nc, nats.JSON_ENCODER)
	if err != nil {
		panic(err)
	}
	defer ec.Close()

	log.Info("NATS sub conectado")

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
		edad := strconv.Itoa(req.Age)
		jsonData := map[string]string{"name": req.Name,"location": req.Location,"age": edad,"infectedtype": req.Infectedtype,"state": req.State, "path" : "NATS"}
		jsonValue, _ := json.Marshal(jsonData)
		 
		res, err:= http.Post(url, "application/json", bytes.NewBuffer(jsonValue))
		if(err != nil){
		
		}else{
			var pt Data
			err := json.NewDecoder(res.Body).Decode(&pt)
			if err != nil {
				
			}else{
				println("Se envio a la API: " + pt.Name)
			}
		}
	
	}
}