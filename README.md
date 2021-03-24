# SO1A_G22_Proyecto1 💡
Proyecto 1 de Sistemas Operativos 1 - Grupo 22

# Manual Tecnico📔
# Locust 
![image](https://user-images.githubusercontent.com/34359891/112256664-c87b3e80-8c29-11eb-8c1b-64c4c8777ec7.png)

Es importante realizar test de peticiones hacia nuestra aplicacion, es por ello que se utilizo un servidor local que es el encargado de realizar el load test. Enviando los datos que se encuentran en el archivo .JSON que se carga para generar las peticiones.

Para poder utilizar locust es importante instalarlo, mediante el siguiente comando:
--Locust trabaja con la version 3 de python.
```sh
    pip3 install locust
```
Locust trabaja con diferentes metodos donde se definen que datos se enviaran y hacia donde se enviaran, mediante la interfaz grafica se indica la cantidad de usuarios a simular, el tiempo entre cada usuario y el host al cual se realizaran las peticiones.
--La clase Reader es la encargada de cargar el archivo de trafico a la app, y en esta misma se hacen validaciones para que dependiendo de la cantidad de ususario no se duplique la informacion a mandar.
--La class MessageTraffic es la encargada de realizar las peticiones al host que se indica en la interfaz de este, indicando a que endpoint se haran.
```sh
class Reader():
    def __init__(self):
        self.file_path = "traffic.json"
        self.lista_datos = []
        self.lista_leidos = []
        self.indice_obtenido = 0
        self.obtenido = False

    def obtener_index(self):
        length = len(self.lista_datos)
        for x in range(length):
            self.indice_obtenido = x
            if self.existe_index() is None:
                return self.lista_datos[x]
        return None       

    def existe_index(self):
        for x in self.lista_leidos:
            if x == self.indice_obtenido:
                return x
        self.lista_leidos.append(self.indice_obtenido)
        return None
            
    def load(self):
        print ("Cargando datos...")
        try:
            with open("traffic.json", 'r') as data_file:
                self.lista_datos = json.loads(data_file.read())

        except Exception as e:
            print (f'>> error, {e}')
class MessageTraffic(HttpUser):
    wait_time = between(0.2, 0.9)
    reader = Reader()
     
    def on_start(self):
        if self.reader.obtenido == False:
            self.reader.load()
            self.reader.obtenido = True
        print ("Mandando datos...")
        print("\n")
        
    @task
    def PostMessage(self):
        random_data = self.reader.obtener_index()
        if (random_data is not None):
            self.client.post("/", json=random_data)
        else:
            print("Se envio correctamente.")
            self.stop(True)

```


# Servidor en go 

[![N|Solid](https://raw.githubusercontent.com/coneking/golang/develop/images/gogo.png)](https://golang.org/)

Para poder recibir la informacion de locust, es necesario tener corriendo un servidor en cada servicio de mensajeria, este fuciona mediante una peticion http, que realiza el balanceador de carga y redirige la informacion hacia los diferentes servicios.

el servidor consiste en una peticion POST la cual recibe la informacion que pasa por el balancer y la almacena para luego ser enviada por el emisor de los distintos servicios.
```sh
http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		
		var d Data
		err := json.NewDecoder(r.Body).Decode(&d)
		if err != nil {
			println("error" )
		}else{
			req := d
			personChanSend <- &req
		}
	})
    http.ListenAndServe(":8000", nil)
```
# Estructura usada en los diferentes servicios
```sh
type Data struct {
	Name string
	Location string
	Age int
	Infectedtype string
	State string
}
```
# NATS

[![N|Solid](https://gblobscdn.gitbook.com/spaces%2F-LqMYcZML1bsXrN3Ezg0%2Favatar.png?alt=media)](https://nats.io/)
Desarrollar e implementar aplicaciones y servicios que se comunican en sistemas distribuidos puede ser complejo y difícil. Sin embargo, existen dos patrones básicos, solicitud / respuesta o RPC para servicios y flujos de datos y eventos. Una tecnología moderna debería proporcionar características para hacer esto más fácil, escalable, seguro, independiente de la ubicación y observable.

## Configuracion
La configuracion basica de nats se basa en un publisher y un suscriber, donde el pub es el encargado de transmitir el mensaje al sub. Esto se logra mediante un servidor de nats, el cual puede ser local o bien en una imagen de docker.

Estos archivos pub y sub ambos estan programados en go.


- Archivo publisher Go
--Este tiene la funcionalidad de recibir los datos a travez del servidor go, y enviarlos por medio de la red que se genera usando el servidor de nats hacia el suscriber.
```sh
    func main() {

	nc, err := nats.Connect("nats://nats:4222")
	if err != nil {
		panic(err)
	}
	ec, err := nats.NewEncodedConn(nc, nats.JSON_ENCODER)
	if err != nil {
		panic(err)
	}
	defer ec.Close()
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
```
 
- Archivo Docker publisher 
--La configuracion para poder generar la imagen del publisher es la siguiente:
    donde se define el lenguaje, el directorio, el puerto en el cual se expone el server de go y el metodo de ejecucion.
```sh
FROM golang

WORKDIR /

COPY . .

RUN go mod download

EXPOSE 8000

CMD ["go", "run", "pub.go"]
```
- Archivo suscriber Go
-- En este se realiza el envio de los datos hacia la api, los cuales fueron recibidos del publisher. Haciendo la modificacion de la ruta por la cual pasa, en este caso es NATS.
Se debe configurar en este caso la IP del balanceador de carga, asi mismo con los otros 3 servicios.
```sh
func main() {
    nc, err := nats.Connect("nats://nats:4222")
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
	personChanRecv := make(chan *Data)
	ec.BindRecvChan("request_subject", personChanRecv)
	for {
		req := <-personChanRecv
		edad := strconv.Itoa(req.Age)
		jsonData := map[string]string{"name": req.Name,"location": req.Location,"age": edad,"infectedtype": req.Infectedtype,"state": req.State, "path" : "NATS"}
		jsonValue, _ := json.Marshal(jsonData)
		res, err:= http.Post(url, "application/json", bytes.NewBuffer(jsonValue))
		if(err != nil){}else{
			var pt Data
			err := json.NewDecoder(res.Body).Decode(&pt)
			if err != nil {}else{
				println("Se envio a la API: " + pt.Name)
			}
		}
	}
}
```
- Archivo Docker suscriber
-- A diferencia del Dockerfile del pub, en este no se expone ningun puerto debido a que no es un servidor, solo se define que cada vez que reciba un mensaje del pub, este se envie a la API.
```sh
FROM golang
WORKDIR /
COPY . .
RUN go mod download
CMD ["go", "run", "sub.go"]
```
- Arhcivo Docker compose
-- Para poder generar las imagenes de docker en la instancia, es de suma importancia el docker compose, en este se define la red con la cual se va trabajar de forma interna en docker. Definiendo puertos y la construcion de las imagenes.
```sh
version: "2"
services:
  nats:
    image: 'nats:2.1.9'
    expose:
      - "4222"
    ports:
      - "8222:8222"
    hostname: nats-server

  nats-pub:
      build: ./nats-pub
      restart: on-failure
      ports:
        - "80:8000"
      depends_on:
        - nats

  nats-sub:
      build: ./nats-sub
      restart: on-failure
      depends_on:
        - nats
```

# Rabbit
[![N|Solid](https://www.rabbitmq.com/img/logo-rabbitmq.svg?alt=media)](https://www.rabbitmq.com/)
Con decenas de miles de usuarios, RabbitMQ es uno de los corredores de mensajes de código abierto más populares. Desde T-Mobile hasta Runtastic, RabbitMQ se utiliza en todo el mundo en pequeñas empresas emergentes y grandes.

RabbitMQ es liviano y fácil de implementar en las instalaciones y en la nube. Admite múltiples protocolos de mensajería. RabbitMQ se puede implementar en configuraciones distribuidas y federadas para cumplir con los requisitos de alta disponibilidad y gran escala.

- Archivo Reciber Go
-- En este archivo se reciben los datos que se envian del sender, y consecuente a esto, los datos se envian por medio de una peticion post a la API. Para visualizar con mayor detalle el archivo, visite el siguiente link.
https://github.com/DeivLex/SO1A_G22_Proyecto1/blob/main/RabbitMQ/Receiver
Donde se encuentran el archivo reciber y el dockerfile del mismo.

- Archivo Sender Go
-- En este archivo se crea el servidor que recibe la informacion del balancer y este mismo lo envia al reciber.  Para visualizar con mayor detalle el archivo, visite el siguiente link.
https://github.com/DeivLex/SO1A_G22_Proyecto1/blob/main/RabbitMQ/Sender
Donde se encuentran el archivo sender y el dockerfile del mismo.
- Arhcivo Docker compose
-- Al igual que nats, es importante el docker compose para la deficion de las imagenes que se van a crear.
```sh
version: "3.3"
services:
  rabbitmq:
      image : rabbitmq:3-management
      ports: 
          - "5672:5672"
          - "15672:15672"

  publisher-rmq:
      build: ./Sender
      restart: on-failure
      ports:
        - "80:3000"
      depends_on:
        - rabbitmq

  consumer-rmq:
      build: ./Receiver
      restart: on-failure
      depends_on:
        - rabbitmq
```

# Google Pub Sub
[![N|Solid](https://blog.iron.io/wp-content/uploads/2020/12/google-cloud-pubsub-white.png)](https://cloud.google.com/pubsub/docs/overview)
Pub/Sub es un servicio de mensajería asíncrona que separa los servicios que producen eventos de servicios que procesan eventos.

Puedes usar Pub/Sub, como middleware orientado a la mensajería o transferencia y entrega de eventos para las canalizaciones de estadísticas de transmisión.

Pub/Sub ofrece almacenamiento de mensajes duradero y entrega de mensajes en tiempo real con alta disponibilidad y rendimiento coherente a gran escala. Los servidores de Pub/Sub se ejecutan en todas las regiones de Google Cloud, en todo el mundo.

- Archivo publisher Go
-- Al igual que NATS google pub sub se basa en un publisher y en un suscriber.
El publisher tambien tiene la funcion de recibir los datos del balanceador de carga y asi mismo mandarlos al suscriber, para mayor detalle visitar el siguiente link, donde se encuentran el pub.go y el dockerfile del mismo.
https://github.com/DeivLex/SO1A_G22_Proyecto1/tree/main/PUBSUB/Pub
- Archivo suscriber Go
-- Al igual que NATS google pub sub se basa en un publisher y en un suscriber.
El publisher tambien tiene la funcion de recibir los datos del balanceador de carga y asi mismo mandarlos al suscriber, para mayor detalle visitar el siguiente link, donde se encuentran el pub.go y el dockerfile del mismo.
https://github.com/DeivLex/SO1A_G22_Proyecto1/tree/main/PUBSUB/Sub
- Arhcivo Docker compose
--El archivo docker compose del servicio de google pub sub, define la red en la cual se trabajara, teniendo en cuenta que el servicio se obtiene de google cloud.
```sh
version: "3.3"
services:
  publisher:
    build: ./Pub
    ports:
      - "80:8000"
    networks:
      - goo

  subscriber:
    build: ./Sub
    restart: always
    networks:
      - goo

networks:
  goo:
    driver: "bridge"
```
# GRPC
![image](https://user-images.githubusercontent.com/34359891/112257085-f19bcf00-8c29-11eb-80cd-52f7d6612309.png)


gRPC es un moderno sistema de llamada a procedimiento remoto que procesa la comunicación en estructuras cliente-servidor distribuidas de manera especialmente eficiente gracias a una innovadora ingeniería de procesos. Actúa en el nivel del proceso, al igual que su antecesor, el sistema RPC. Un elemento característico de la comunicación entre procesos mediante gRPC es el principio de transparencia: la colaboración entre instancias (en parte muy) distanciadas es tan estrecha y sencilla que no se percibe ninguna diferencia en comparación con una comunicación local entre procesos internos de una máquina.

Desarrollado por Google en el año 2015, hoy es la Cloud Native Computing Foundation la encargada de su distribución y desarrollo. gRPC es un elemento de código abierto, es decir, el código fuente está accesible para que otros desarrolladores hagan modificaciones y participen en su desarrollo.

Por defecto, gRPC ejecuta el transporte de flujos de datos entre ordenadores alejados mediante HTTP/2 y gestiona la estructura y la distribución de los datos mediante los Protocol buffers desarrollados por Google. Estos últimos se guardan en forma de archivos de texto plano con la extensión .proto.

- Cliente
--El cliente escribe una secuencia de mensajes y la envía al servidor vía stream. Una vez que el cliente ha preparado los mensajes, espera a que el servidor los lea y le responda. En este caso, la solicitud de mensajes también se realiza dentro de una sola llamada RPC.
Para visualizar el dockerfile y el archivo cliente.go visite el siguiente link:
https://github.com/DeivLex/SO1A_G22_Proyecto1/tree/main/GRPC/client
- Servidor
--Permite un intercambio más complejo de mensajes dentro de una única llamada RPC. Primero, el cliente envía una solicitud al servidor. Entonces recibe como respuesta un hilo (stream) con una larga secuencia de mensajes (solicitud eficiente de mensajes dentro de una sola llamada RPC). A continuación, el cliente lee el hilo hasta que no queden mensajes.
Para visualizar el dockerfile y el archivo server.go visite el siguiente link:
https://github.com/DeivLex/SO1A_G22_Proyecto1/tree/main/GRPC/server
- Docker compose
--Como se puede observar este archivo docker compose cuenta con una red la cual se define mediante los servicios y los voumenes, al igual que los demas docker compose, en este se define el puerto en el cual se va estar escuchando para recibir los datos del load test.
```sh
version: "3.3"

services:
  grpcclient:
    container_name: clientgo
    build: ./client
    restart: always
    ports:
      - "80:8000"
    networks:
      - grpc
    volumes:
      - ./client:/app
  
  grpcserver:
    container_name: servergo
    build: ./server
    restart: always
    ports:
      - "3000:3000"
    networks:
      - grpc
    volumes:
      - ./server:/app

networks:
  grpc:
    driver: "bridge"
```

## MongoDB
![mongo](https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/MongoDB_Logo.svg/1280px-MongoDB_Logo.svg.png)

Dentro de las bases de datos NoSQL, probablemente una de las más famosas sea MongoDB. Con un concepto muy diferente al de las bases de datos relacionales, se está convirtiendo en una interesante alternativa.

Pero cuándo uno se inicia en MongoDB se puede sentir perdido. No tenemos tablas, no tenemos registros y lo que es más importante, no tenemos SQL. Aun así, MongoDB es una seria candidata para almacenar los datos de nuestras aplicaciones.

MongoDB guarda la estructura de los datos en documentos BSON con un esquema dinámico, lo que implica que no existe un esquema predefinido. Los elementos de los datos se denominan documentos y se guardan en colecciones. Una colección puede tener un número indeterminado de documentos. Comparando con una base de datos relacional, se puede decir que las colecciones son como tablas y los documentos son registros en la tabla. 

En un documento, se pueden agregar, eliminar, modificar o renombrar nuevos campos en cualquier momento, ya que no hay un esquema predefinido. La estructura de un documento es simple y compuesta por pares llave/valor, parecido a las matrices asociativas en un lenguaje de programación, esto es debido a que MongoDB sigue el formato de JSON. En MongoDB la clave es el nombre del campo y el valor es su contenido, los cuales se separan mediante el uso de “:”, tal y como se puede ver en el siguiente ejemplo. Como valor se pueden usar números, cadenas o datos binarios como imágenes o cualquier otro.

## API 
![(hola)](https://icon-library.com/images/api-icon/api-icon-3.jpg)


Una API es un conjunto de definiciones y protocolos que se utiliza para desarrollar e integrar el software de las aplicaciones. API significa interfaz de programación de aplicaciones.

Las API permiten que sus productos y servicios se comuniquen con otros, sin necesidad de saber cómo están implementados. Esto simplifica el desarrollo de las aplicaciones y permite ahorrar tiempo y dinero. Las API le otorgan flexibilidad; simplifican el diseño, la administración y el uso de las aplicaciones, y proporcionan oportunidades de innovación, lo cual es ideal al momento de diseñar herramientas y productos nuevos (o de gestionar los actuales).

A veces, las API se consideran como contratos, con documentación que representa un acuerdo entre las partes: si una de las partes envía una solicitud remota con cierta estructura en particular, esa misma estructura determinará cómo responderá el software de la otra parte.


### Servidor Node JS 
![node](https://fernando-gaitan.com.ar/wp-content/uploads/nodejs_id.png)

Librerias utilizadas:
- Express
- BodyParser
- Cors
- Router
- Fs
- Mongoose

Se importan las librerias:
```
var express = require('express');
var bodyParser = require('body-parser');
const cors = require('cors');
const Router  = require("express");
const fs = require('fs');
let mongoose = require("mongoose")
```

Se instancia el servidor con sus configuraciones y se inicia:
```
/*SERVIDOR Y CONFIGURACIONES*/
var app = express();
var port = 5000;

var corsOptions = { origin: true, optionsSuccessStatus: 200 };
app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '10mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))

app.use(require("./rutas.js"));
app.use(express.static('public'));

/*INICIO DEL SERVIDOR*/
app.listen(port);
console.log('Server running in port: ', port);
```

Se instancias las variables y los servicios de mongodb a utilizar:
```
const Casos = require("./schemas/Casos");

/*VARIABLES A UTILIZAR*/
const app = Router();
let top = new Array;
```

```
var Schema = mongoose.Schema;

/* localhost = mongo (docker containter name)*/
/*CONEXION A MONGODB*/
mongoose.connect('mongodb://mongo:27017/proyecto1', {useNewUrlParser: true, useUnifiedTopology: true})
    .then(result => console.log("Conectado a db"))
    .catch(err => console.log(err));
    
var Model = new Schema({
    name: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    region: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    infectedtype: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    }
}, { timestamps: true});

let Casos = mongoose.model("Casos", Model)
module.exports = Casos;
```

Ejemplos de servicios (los demas se encuentran en la carpeta [API](https://github.com/DeivLex/SO1A_G22_Proyecto1/tree/main/API)):
- Insercion de datos a mongodb
```
/*AGREGA LOS DATOS QUE ENVIAN LOS INTERMEDIARIOS*/
app.post("/", async (req, res) => {
    let region = getRegion(req.body.location);

    let nuevo = new Casos({
        name: req.body.name,
        location: req.body.location,
        region: region,
        age: req.body.age,
        infectedtype: req.body.infectedtype,
        state: req.body.state,
        path: req.body.path
    });

    nuevo.save(nuevo)
     .then(result => {
        res.send(result);
     })
     .catch(err => {
         console.log(err)
         res.send(err);
     });
});
```

- Busqueda de todos los registros en mongodb
```
/*TABLA DE DATOS RECOPILADOS*/
app.post("/find", async (req, res) => {
    Casos.find()
     .then(result => {
        res.send(result);
     })
     .catch(err => {
         console.log(err)
         res.send(err);
     });
});
```

## Modulos
![modulo](https://images.vexels.com/media/users/3/140692/isolated/preview/72d1f12edf758d24f5b6db73bac4f297-logo-de-linux-by-vexels.png)

El kernel de Linux tiene un diseño modular. En el momento de arranque, sólo se carga un kernel residente mínimo en memoria. Por ello, cuando un usuario solicita alguna característica que no esta presente en el kernel residente, se carga dinámicamente en memoria un módulo kernel, también conocido algunas veces como un controlador.

Durante la instalación, se prueba el hardware en el sistema. Basado en esta prueba y en la información proporcionada por el usuario, el programa de instalación decide qué módulos necesita cargar en el momento de arranque. El programa de instalación configura el mecanismo de carga dinámica para que funcione de forma transparente.

Si se añade un nuevo hardware después de la instalación y este requiere un módulo kernel, el sistema debe ser configurado para cargar el módulo adecuado para el nuevo hardware. Cuando el sistema es arrancado con el nuevo hardware, se ejecuta el programa Kudzu detecta el nuevo hardware si es soportado y configura el módulo necesario para él. El módulo tambíen puede ser especificado manualmente modificando el archivo de configuración del módulo, /etc/modules.conf.

### CPU
![cpu](https://user-images.githubusercontent.com/53025349/112263981-c61ee180-8c35-11eb-9d59-8a1408b120eb.jpg)

Librerias utilizadas:
```
#include <linux/proc_fs.h>
#include <linux/seq_file.h>
#include <linux/module.h>
#include <linux/init.h>
#include <linux/kernel.h>
#include <linux/sched/signal.h>
#include <linux/sched.h>
#include <linux/fs.h>
```

Estructuras utilizadas para la lectura de CPU:
```
struct task_struct *task;
struct task_struct *childtask; secundarios
struct task_struct *memtask; 
struct list_head *list;
```

Codigo de inicio y fin del modulo:
```
static struct file_operations my_fops = {
    .owner = THIS_MODULE,
    .open = my_proc_open,
    .release = single_release,
    .read = seq_read,
    .llseek = seq_lseek,
    .write = my_proc_write
};

static int __init cpu_mod_init(void){ //modulo de inicio
	struct proc_dir_entry *entry;
    entry = proc_create("cpu_proyecto1", 0, NULL, &my_fops);
	
	if(!entry){
        return -1;
    }else{
		printk(KERN_INFO "@cpu_proyecto1 lectura de cpu iniciado");
    }
    return 0;
}

static void __exit cpu_mod_exit(void){
	remove_proc_entry("cpu_proyecto1", NULL);
	printk(KERN_INFO "@cpu_proyecto1 lectura de cpu finalizado");
}

module_init(cpu_mod_init);
module_exit(cpu_mod_exit);
```

Lectura de la informacion de los procesos y escritura del archivo:
```
//Mostrar PID, nombre, PID del padre y estado
static int write_cpu(struct seq_file * cpufile, void *v){
	
	int p = 0;
	seq_printf(cpufile, "[\n");
	for_each_process( task ){
		if(p == 0){
			p = 1;
		}else if(p == 1){
			seq_printf(cpufile, "},\n");
		}

		seq_printf(cpufile, "{\n");
		seq_printf(cpufile, "\"nombre\": \"%s\",\n",task->comm);
		seq_printf(cpufile, "\"pid\": %d,\n",task->pid);
		seq_printf(cpufile, "\"padre\": %d,\n",task->pid);
		seq_printf(cpufile, "\"estado\": %ld,\n",task->state);
		seq_printf(cpufile, "\"hijo\":\n");
		seq_printf(cpufile, "\t[\n");

		int p2 = 0;
		list_for_each( list,&task->children ){
			if(p2 == 0){
				p2 = 1;
			}else if(p2 == 1){
				seq_printf(cpufile, "\t},\n");
			}

			seq_printf(cpufile, "\t{\n");
			childtask= list_entry( list, struct task_struct, sibling );
			
			seq_printf(cpufile, "\t\"nombre\": \"%s\",\n",childtask->comm);
			seq_printf(cpufile, "\t\"pid\": %d,\n",childtask->pid);
			seq_printf(cpufile, "\t\"padre\": %d,\n",task->pid);
			seq_printf(cpufile, "\t\"estado\": %ld\n",childtask->state);
			
		}
		if(p2 == 1){
			seq_printf(cpufile, "\t}\n");
		}
		seq_printf(cpufile, "\t]\n");
		
	}
	seq_printf(cpufile, "}\n");
	seq_printf(cpufile, "]");

	return 0;
}

static int my_proc_open(struct inode *inode, struct file*file){
	return single_open(file, write_cpu, NULL);	
}

static ssize_t my_proc_write(struct file *file, const char __user *buffer, size_t count, loff_t *f_pos)
{
    return 0;
}
```


### RAM
![ram](https://user-images.githubusercontent.com/53025349/112263952-b7382f00-8c35-11eb-867e-ace3a2fe9b3b.jpg)

Librerias utilizadas:
```
#include <linux/proc_fs.h>
#include <linux/seq_file.h>
#include <asm/uaccess.h>
#include <linux/hugetlb.h>
#include <linux/module.h>
#include <linux/init.h>
#include <linux/kernel.h>
#include <linux/fs.h>
```

Estructuras utilizadas para la lectura de RAM:
```
struct sysinfo inf;
```

Codigo de inicio y fin del modulo:
```
static struct file_operations my_fops = {
    .owner = THIS_MODULE,
    .open = my_proc_open,
    .release = single_release,
    .read = seq_read,
    .llseek = seq_lseek,
    .write = my_proc_write
};

static int ram_mod_init(void){
	proc_create("ram_proyecto1", 0, NULL, &my_fops);
	printk(KERN_INFO "@ram_proyecto1 lectura de cpu iniciado");
 	return 0;
}

static void ram_mod_exit(void){
	remove_proc_entry("ram_proyecto1",NULL);
	printk(KERN_INFO "@ram_proyecto1 lectura de cpu finalizado");
}


module_init(ram_mod_init);
module_exit(ram_mod_exit);
```

Lectura de la informacion de los procesos y escritura del archivo:
```
//Mostrar total, uso, libre en MB
static int write_ram(struct seq_file * archivo, void *v){
    si_meminfo(&inf);
    long total_memoria = (inf.totalram * 4);
    long memoria_libre = (inf.freeram * 4);
    seq_printf(archivo, "{\n\t\"total\":%8lu,\n", total_memoria/1024);
    seq_printf(archivo, "\t\"uso\":%8lu,\n", (total_memoria-memoria_libre)/1024);
    seq_printf(archivo, "\t\"libre\":%8lu\n}", memoria_libre/1024);
	return 0;
}

static int my_proc_open(struct inode *inode, struct file*file){
	return single_open(file, write_ram, NULL);	
}

static ssize_t my_proc_write(struct file *file, const char __user *buffer, size_t count, loff_t *f_pos){
    return 0;
}
```

### Makefile
![make](https://lignux.com/wp-content/uploads/2013/09/linux-tux-console.jpg)

El comando de linux make nos ayuda a compilar nuestros programas. Presenta muchas ventajas para programas grandes, en los que hay muchos ficheros fuente (muchos .c y muchos .h) repartidos por varios directorios. Principalmente aporta dos ventajas:

- Es capaz de saber qué cosas hay que recompilar. Si cuando estamos depurando nuestro programa tocamos un fichero fuente, al compilar con make sólo se recompilaran aquellos ficheros que dependan del que hemos tocado. Si compilamos a mano con cc, (o el compilador que sea), o tenemos en la cabeza esas dependencias para compilar sólo lo que hace falta, o lo compilamos todo. Si el proyecto es grande, se nos olvidará alguna dependencia o nos pasaremos horas compilando.
- Nos guarda los comandos de compilación con todos sus parámetros para encontrar librerías, ficheros de cabecera (.h), etc, etc. No tendremos que escribir largas líneas de compilación con montones de opciones que debemos saber de memoria o, al menos, sólo tendremos que hacerlo una vez.

Archivos mekifile para compilar los modulos CPU y RAM:
- CPU
```
obj-m += modulo_cpu.o

all:
	make -C /lib/modules/$(shell uname -r)/build/ M=$(shell pwd) 
clean:
	make -C /lib/modules/$(shell uname -r)/build/ M=$(shell pwd) clean
```

- RAM
```
obj-m += modulo_ram.o

all:
	make -C /lib/modules/$(shell uname -r)/build/ M=$(shell pwd) 
clean:
	make -C /lib/modules/$(shell uname -r)/build/ M=$(shell pwd) clean
```


Comandos necesarios para crear los modulos, cargarlos o eliminaros:
```
#Compilar el makefile
make

#Ver los modulos
lsmod

#Ver los archivos en lista
ls -l

#Agregar el modulo modulo_cpu.ko
insmod modulo_cpu.ko

#Eliminar modulo modulo_cpu
rmmod modulo_cpu

#Ver modulo existente modulo_cpu
lsmod | grep modulo_cpu
```
