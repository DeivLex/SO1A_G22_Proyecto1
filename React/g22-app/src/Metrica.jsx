import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import {Chart} from 'chartjs-funnel'
import Reporte4 from './Reporte4'
import Reporte5 from './Reporte5'
import Reporte7 from './Reporte7'

const tbodyStyle =  {
    height: '500px',     
    overflow : 'auto'
}

const divStyle = {
    margin: '2%'
};
class Metrica extends React.Component{

    constructor(props) {
        super(props);
    
        this.state = {
          Reporte1: [],
          Reporte2: [],
          Reporte3: [],
          Reporte6: [],
          name : "Todos"
        };

        this.config = {
            type: 'funnel',
            data: {
                datasets: [{
                    data: [10, 35, 90, 123, 148],
                    backgroundColor: [
                        "#FF3333",
                        "#FFF833",
                        "#6FFF33",
                        "#33FFC9",
                        "#33AAFF",
                        "#3433FF",
                        "#FF33B4"
                    ],
                    hoverBackgroundColor: [
                        "#FF6384",
                        "#36A2EB",
                        "#FFCE56",
                        "#36A2EB",
                        "#FFCE56", 
                        "#36A2EB",
                        "#FFCE56"
                    ]
                }],
                labels: [
                    "Red",
                    "Blue",
                    "Yellow",
                    "Red",
                    "Blue"
                ]
            },
            options: {
                responsive: true,
                sort: 'desc',
                legend: {
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Click para ver grafica'
                },
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        };

      }

      handleSelectChange = (event) => {
        this.setState({
          name: event.target.value
        })
      }

    componentDidMount() {
        var ctx = document.getElementById("chart-area").getContext("2d");
        window.myDoughnut = new Chart(ctx, this.config);

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        };
        Promise.all([
            fetch("http://34.121.110.42/find",requestOptions),
            fetch("http://34.121.110.42/region",requestOptions),
            fetch("http://34.121.110.42/funnel",requestOptions),
            fetch("http://34.121.110.42/ultimos",requestOptions)
          ]).then(allResponses => {
            allResponses[0].json().then(data => this.setState({ Reporte1: data }))
            allResponses[1].json().then(data => this.setState({ Reporte2: data }))
            allResponses[2].json().then(data => this.setState({ Reporte3: data }))
            allResponses[3].json().then(data => this.setState({ Reporte6: data }))
          });
    }

    render() {
        const { Reporte1,Reporte2,Reporte3,Reporte6,name } = this.state;
        var R3Data = [];
        var R3Label = [];
        Reporte3.forEach( Element => R3Label.push(Element[1]));
        Reporte3.forEach( Element => R3Data.push(parseInt(Element[0])));
        for (let index = 0; index < 5; index++) {
            this.config.data.labels.pop();  
            this.config.data.datasets[0].data.pop();
        }
        for (let index = 0; index < 5; index++) {
            this.config.data.labels.push(R3Label[index]); 
            this.config.data.datasets[0].data.push(R3Data[index]);
        }
        let report2 = String(Reporte2[0]).split(',');
    return (
        <div>
            <br></br>
            <br></br>
            <br></br>
            <div class="card" style={divStyle}>
            <div class="card-body">
            <div class="scrollit" style={tbodyStyle}>
                <h3>Tabla de datos recopilados
                <select name="cars"  onClick={this.handleSelectChange} id="cars">
                    <option value="Todos">Todos</option>
                    <option value="NATS">NATS</option>
                    <option value="GRPC">GRPC</option>
                    <option value="RabbitMQ">RabbitMQ</option>
                    <option value="GPS">GPS</option>
                </select>
                </h3>
                <table class="table">
                <thead>
                    <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Location</th>
                    <th scope="col">Age</th>
                    <th scope="col">InfectedType</th>
                    <th scope="col">State</th>
                    <th scope="col">Path</th>
                    </tr>
                </thead>
                <tbody>
                  {
                    Reporte1.filter(number => (number.path === name) || (name === 'Todos') ).map(el =>
                      <tr>
                      <th scope="row"> {el.name} </th>
                      <td>{el.location}</td>
                      <td>{el.age}</td>
                      <td>{el.infectedtype}</td>
                      <td>{el.state}</td>
                      <td>{el.path}</td>
                      </tr>
                    )
                  }
                </tbody>
                </table>
            </div>
            </div>
            </div>
            <hr></hr>
            <div class="card" style={divStyle}>
            <div class="card-body">
                <h3>Región más infectada</h3>
                <table class="table">
                <thead>
                    <tr>
                    <th scope="col">#</th>
                    <th scope="col">Nombre</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                    <th scope="row">{report2[0]}</th>
                    <td>{report2[1]}</td>
                    </tr>
                </tbody>
                </table>
            </div>
            </div>
            <hr></hr>
            <div class="card" style={divStyle}>
            <div class="card-body">
                <h3>Top 5 departamentos infectados</h3>
                <div id="canvas-holder">
                    <canvas id="chart-area"></canvas>
                </div>
            </div>
            </div>
            <hr></hr>
            <div class="card" style={divStyle}>
            <div class="card-body">
                <h3>Casos infectados por state</h3>
                <Reporte4/>
            </div>
            </div>
            <hr></hr>
            <div class="card" style={divStyle}>
            <div class="card-body">
                <h3>Casos infectados por infectedType</h3>
                <Reporte5 />
            </div>
            </div>
            <hr></hr>
            <div class="card" style={divStyle}>
            <div class="card-body">
                <h3>Tabla con los últimos 5 casos registrados</h3>
                <table class="table">
                <thead>
                    <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Location</th>
                    <th scope="col">Age</th>
                    <th scope="col">InfectedType</th>
                    <th scope="col">State</th>
                    <th scope="col">Path</th>
                    </tr>
                </thead>
                <tbody>
                  {   
                    Reporte6.map(el => 
                      <tr>
                      <th scope="row"> {el.name} </th>
                      <td>{el.location}</td>
                      <td>{el.age}</td>
                      <td>{el.infectedtype}</td>
                      <td>{el.state}</td>
                      <td>{el.path}</td>
                      </tr>
                    )
                  }
                </tbody>
                </table>
            </div>
            </div>
            <hr></hr>
            <div class="card" style={divStyle}>
            <div class="card-body">
                <h3>Rango de edad de infectados</h3>
                <Reporte7/>
            </div>
            </div>
        </div>
      );
    }
}

export {Metrica};
