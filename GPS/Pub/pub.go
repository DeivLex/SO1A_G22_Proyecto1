package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"cloud.google.com/go/pubsub"
)

func publish(msg string) error {
	projectId := "pure-advantage-305004"
	topicId := "TopicSis"

	ctx := context.Background()

	client, err := pubsub.NewClient(ctx, projectId)
	if err != nil {
		fmt.Print("Error :( ")
		fmt.Print(err)
		return fmt.Errorf("Error al conectarse %%v", err)
	}

	t := client.Topic(topicId)
	result := t.Publish(ctx, &pubsub.Message{Data: []byte(msg)})

	id, err := result.Get(ctx)
	if err != nil {
		fmt.Print("error")
		fmt.Print(err)
		return fmt.Errorf("Error: %v", err)
	}

	fmt.Print("Publicado: %v", id)
	return nil
}

type Data struct {
	Name         string
	Location     string
	Age          int
	Infectedtype string
	State        string
}

func main() {
	fmt.Println("Iniciando envio...")

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {

		var d Data
		err := json.NewDecoder(r.Body).Decode(&d)
		if err != nil {
			fmt.Print(err)
		} else {
			edad := strconv.Itoa(d.Age)
			publish("{\"name\": \"" + d.Name + "\",\"location\":\"" + d.Location + "\",\"age\":" + edad + ",\"infectedtype\": \"" + d.Infectedtype + "\",\"state\":\"" + d.State + "\", \"path\":\"GPS\"}")
		}
	})
	http.ListenAndServe(":8000", nil)
}
