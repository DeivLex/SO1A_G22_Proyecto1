package main

import (
	"bytes"
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"strconv"

	"github.com/streadway/amqp"
)

func failOnError(err error, msg string) {
	if err != nil {
		log.Fatalf("%s: %s", msg, err)
	}
}

func main() {
	// Connecting to server
	conn, err := amqp.Dial("amqp://guest:guest@rabbitmq:5672/")
	failOnError(err, "Failed to connect to RabbitMQ")
	defer conn.Close()

	// Openning a channel
	ch, err := conn.Channel()
	failOnError(err, "Failed to open a channel")
	defer ch.Close()

	// Declaring a new queue
	q, err := ch.QueueDeclare(
		"labso1", // name
		false,    // durable
		false,    // delete when unused
		false,    // exclusive
		false,    // no-wait
		nil,      // arguments
	)
	failOnError(err, "Failed to declare a queue")

	// Declaring a new consumer
	msgs, err := ch.Consume(
		q.Name, // queue
		"",     // consumer
		true,   // auto-ack
		false,  // exclusive
		false,  // no-local
		false,  // no-wait
		nil,    // args
	)
	failOnError(err, "Failed to register a consumer")

	type Data struct {
		Name         string `json:"name"`
		Location     string `json:"location"`
		Age          int    `json:"age"`
		Infectedtype string `json:"infectedtype"`
		State        string `json:"state"`
	}
	// Receiving messages
	forever := make(chan bool)

	go func() {
		for d := range msgs {
			log.Printf("Received a message: %s", d.Body)
			user := Data{}
			json.Unmarshal(d.Body, &user)
			edad := strconv.Itoa(user.Age)
			jsonData := map[string]string{"name": user.Name, "location": user.Location, "age": edad, "infectedtype": user.Infectedtype, "state": user.State, "path": "RabbitMQ"}
			jsonValue, _ := json.Marshal(jsonData)
			req, err := http.Post("http://34.121.110.42/", "application/json", bytes.NewBuffer(jsonValue))
			req.Header.Set("Content-Type", "application/json")
			failOnError(err, "POST new document")
			defer req.Body.Close()

			//Read the response body
			newBody, err := ioutil.ReadAll(req.Body)
			failOnError(err, "Reading response from HTTP POST")
			sb := string(newBody)
			log.Printf(sb)
		}
	}()

	log.Printf(" [*] Waiting for messages. To exit press CTRL+C")
	<-forever
}
