import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import ReporteRam from './ReporteRam';
import ReporteRam2 from './ReporteRam2';

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
    fetch('http://34.121.110.42/cpu',requestOptions)
        .then(response => response.json())
        .then(data => this.setState({ Reporte1: data }));
}

  render() {
    const { Reporte1 } = this.state;
    var cont = 1;
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
                    <th scope="col">#</th>
                    <th scope="col">Nombre</th>
                    <th scope="col">Pid</th>
                    <th scope="col">Padre</th>
                    <th scope="col">Estado</th>
                    </tr>
                </thead>
                <tbody>
                  {
                    Reporte1.map(el => 
                      <tr>
                      <th scope="row"> {cont++} </th>
                      <td>{el.nombre}</td>
                      <td>{el.pid}</td>
                      <td>{el.padre}</td>
                      <td>{el.estado}</td>
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
                <ReporteRam />
            </div>
            </div>
            <hr></hr>
            <div class="card" style={divStyle}>
            <div class="card-body">
                <h3>Utilización de la RAM (Valor)</h3>
                <ReporteRam2/>
            </div>
            </div>
            <hr></hr>
        </div>
      );
    }
}

export {Vista};
