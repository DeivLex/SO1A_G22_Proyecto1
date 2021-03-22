import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Doughnut, Line } from '@reactchartjs/react-chart.js'

const data = {
    labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
    datasets: [
      {
        label: '# of Votes',
        data: [12, 19, 20, 21, 20, 17],
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

class Vista extends React.Component{

  constructor(props) {
    super(props);

    this.state = {
      Reporte1: []
    };
  }

  componentDidMount() {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
    };
    // Simple GET request using fetch
    fetch('http://34.121.110.42/find',requestOptions)
        .then(response => response.json())
        .then(data => this.setState({ Reporte1: data }));
}

  render() {
    const { Reporte1 } = this.state;
     return(
        <div>
            <br></br>
            <br></br>
            <br></br>
            <div class="card" style={divStyle}>
            <div class="card-body">
                <h3>Tabla de lista de procesos</h3>
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
                <h3>Utilización de la RAM (Porcentaje)</h3>
                <Doughnut data={data} />
            </div>
            </div>
            <hr></hr>
            <hr></hr>
            <div class="card" style={divStyle}>
            <div class="card-body">
                <h3>Utilización de la RAM (Valor)</h3>
                <Line data={data} />
            </div>
            </div>
            <hr></hr>
        </div>
      );
    }
}

export {Vista};
