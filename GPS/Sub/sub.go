package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"sync"

	"cloud.google.com/go/pubsub"
)

func pullMsgs(projectID, subID string) error {
	host := "http://34.121.110.42/"

	// projectID := "my-project-id"
	// subID := "my-sub"
	ctx := context.Background()
	client, err := pubsub.NewClient(ctx, projectID)
	if err != nil {
		return fmt.Errorf("pubsub.NewClient: %v", err)
	}

	// Consume 10 messages.
	var mu sync.Mutex
	received := 0
	sub := client.Subscription(subID)
	cctx, cancel := context.WithCancel(ctx)
	err = sub.Receive(cctx, func(ctx context.Context, req *pubsub.Message) {
		mu.Lock()
		defer mu.Unlock()
		fmt.Printf("Got message: %q\n", string(req.Data))

		type Data struct {
			Name         string
			Location     string
			Age          int
			Infectedtype string
			State        string
			Path         string
		}

		var res Data
		json.Unmarshal([]byte(string(req.Data)), &res)

		edad := strconv.Itoa(res.Age)
		jsonData := map[string]string{"name": res.Name, "location": res.Location, "age": edad, "infectedtype": res.Infectedtype, "state": res.State, "path": "GPS"}

		data, _ := json.Marshal(jsonData)
		http.Post(host, "application/json", bytes.NewBuffer(data))

		req.Ack()
		received++
		if received == 10 {
			cancel()
		}
	})
	if err != nil {
		return fmt.Errorf("Receive: %v", err)
	}
	return nil
}

func main() {
	fmt.Println("Iniciando recibimiento...")

	for {
		pullMsgs("pure-advantage-305004", "eli")
	}
}
