import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Pie,Bar } from '@reactchartjs/react-chart.js'
import {Chart} from 'chartjs-funnel'

var config = {
    type: 'funnel',
    data: {
        datasets: [{
            data: [10, 35, 90, 123, 148],
            backgroundColor: [
                "#FF6384",
                "#36A2EB",
                "#FFCE56",
                "#FF6384",
                "#36A2EB"
            ],
            hoverBackgroundColor: [
                "#FF6384",
                "#36A2EB",
                "#FFCE56",
                "#FF6384",
                "#36A2EB"
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
            text: 'Chart.js Funnel Chart'
        },
        animation: {
            animateScale: true,
            animateRotate: true
        }
    }
};

const data = {
    labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
    datasets: [
      {
        label: '# of Votes',
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
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
          Reporte4: [],
          Reporte5: [],
          Reporte6: [],
          Reporte7: []
        };

        window.onload = function() {
            var ctx = document.getElementById("chart-area").getContext("2d");
            window.myDoughnut = new Chart(ctx, config);
        };
      }

    componentDidMount() {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        };
        Promise.all([
            fetch("http://34.121.110.42/find",requestOptions),
            fetch("http://34.121.110.42/find",requestOptions),
            fetch("http://34.121.110.42/funnel",requestOptions),
            fetch("http://34.121.110.42/circular1",requestOptions),
            fetch("http://34.121.110.42/circular2",requestOptions),
            fetch("http://34.121.110.42/ultimos",requestOptions),
            fetch("http://34.121.110.42/edades",requestOptions)
          ]).then(allResponses => {
            allResponses[0].json().then(data => this.setState({ Reporte1: data }))
            allResponses[1].json().then(data => this.setState({ Reporte2: data }))
            allResponses[2].json().then(data => this.setState({ Reporte3: data }))
            allResponses[3].json().then(data => this.setState({ Reporte4: data }))
            allResponses[4].json().then(data => this.setState({ Reporte5: data }))
            allResponses[5].json().then(data => this.setState({ Reporte6: data }))
            allResponses[6].json().then(data => this.setState({ Reporte7: data })) 
          });
    }

    render() {
        const { Reporte1,Reporte2,Reporte3,Reporte4,Reporte5,Reporte6,Reporte7 } = this.state;
        console.log(Reporte1);
        console.log(Reporte2);
        console.log(Reporte3);
        console.log(Reporte4);
        console.log(Reporte5);
        console.log(Reporte6);
        console.log(Reporte7);
    return (
        <div>
            <br></br>
            <br></br>
            <br></br>
            <div class="card" style={divStyle}>
            <div class="card-body">
                <h3>Tabla de datos recopilados</h3>
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
                    Reporte1.map(el => 
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
                <h3>Región más infectada</h3>
                <table class="table">
                <thead>
                    <tr>
                    <th scope="col">#</th>
                    <th scope="col">First</th>
                    <th scope="col">Last</th>
                    <th scope="col">Handle</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                    <th scope="row">1</th>
                    <td>Mark</td>
                    <td>Otto</td>
                    <td>@mdo</td>
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
                <Pie data={data} />
            </div>
            </div>
            <hr></hr>
            <div class="card" style={divStyle}>
            <div class="card-body">
                <h3>Casos infectados por infectedType</h3>
                <Pie data={data} />
            </div>
            </div>
            <hr></hr>
            <div class="card" style={divStyle}>
            <div class="card-body">
                <h3>Tabla con los últimos 5 casos registrados</h3>
                <table class="table">
                <thead>
                    <tr>
                    <th scope="col">#</th>
                    <th scope="col">First</th>
                    <th scope="col">Last</th>
                    <th scope="col">Handle</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                    <th scope="row">1</th>
                    <td>Mark</td>
                    <td>Otto</td>
                    <td>@mdo</td>
                    </tr>
                    <tr>
                    <th scope="row">2</th>
                    <td>Jacob</td>
                    <td>Thornton</td>
                    <td>@fat</td>
                    </tr>
                    <tr>
                    <th scope="row">3</th>
                    <td>Larry</td>
                    <td>the Bird</td>
                    <td>@twitter</td>
                    </tr>
                </tbody>
                </table>
            </div>
            </div>
            <hr></hr>
            <div class="card" style={divStyle}>
            <div class="card-body">
                <h3>Rango de edad de infectados</h3>
                <Bar data={data} />
            </div>
            </div>
        </div>
      );
    }
}

export {Metrica};
