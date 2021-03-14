import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import Vista from './Vista';
import Metrica from './Metrica';

function App() {
  return (
      <Router>
      <nav className="navbar navbar-expand-md navbar-dark fixed-top bg-dark"> 
        <a className="navbar-brand">Grupo 22</a>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarCollapse">
          <ul className="navbar-nav mr-auto">
              <li className="nav-item">
                  <a className="nav-link" href="/vistas">Vista de metricas</a>
              </li>
              <li className="nav-item">
                  <a className="nav-link" href="/metricas">Monitoreo del server</a>
              </li>
          </ul>
        </div>
      </nav>
      <Switch>
          <Route exact path="/vistas">
            <Vista />
          </Route>
          <Route exact path="/metricas">
            <Metrica />
          </Route>
      </Switch>
    </Router>
  );
}

export default App;
