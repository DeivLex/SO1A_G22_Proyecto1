// example1/natstest-api.go

package main

import (
	"encoding/json"
    "net/http"
	
	"github.com/nats-io/nats.go"
	log "github.com/sirupsen/logrus"
)

type Data struct {
	Name string
	Location string
	Age int
	Infectedtype string
	State string
}

func main() {

	nc, err := nats.Connect("nats://nats:4222")
	//nc, err := nats.Connect(nats.DefaultURL)
	
	if err != nil {
		panic(err)
	}

	ec, err := nats.NewEncodedConn(nc, nats.JSON_ENCODER)
	if err != nil {
		panic(err)
	}
	defer ec.Close()

	log.Info("NATS pub conectado")

	personChanSend := make(chan *Data)
	ec.BindSendChan("request_subject", personChanSend)

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		
		var d Data
		err := json.NewDecoder(r.Body).Decode(&d)
		if err != nil {
			
		}else{
			req := d
			personChanSend <- &req

		}
	})
    http.ListenAndServe(":8000", nil)
	
}