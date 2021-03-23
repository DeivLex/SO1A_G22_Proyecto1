let mongoose = require("mongoose")
var Schema = mongoose.Schema;

/* localhost = mongo*/
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