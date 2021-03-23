/*IMPORTS*/
var express = require('express');
var bodyParser = require('body-parser');
const cors = require('cors');


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
