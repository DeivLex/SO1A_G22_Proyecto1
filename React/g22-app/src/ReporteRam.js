import React, { useState, useEffect } from "react";
import { Doughnut } from '@reactchartjs/react-chart.js';
import axios from "axios";

let totalRam = '';

const ReporteRam = () => {
  const [chartData, setChartData] = useState({});
  const chart = () => {
    let empSal = [];
    axios
      .post("http://34.121.110.42/ram")
      .then(res => {
        empSal.push(parseInt((res.data.uso/res.data.total)*100));
        empSal.push(parseInt((res.data.libre/res.data.total)*100));
        totalRam =  res.data.total;
        setChartData({
          labels: ["Uso %","Libre %"],
          datasets: [
            {
              label: "level of thiccness",
              data: empSal,
              backgroundColor: ["rgba(75, 192, 192, 0.6)",'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)','rgba(255, 206, 86, 0.2)',
              'rgba(153, 102, 255, 0.2)','rgba(255, 159, 64, 0.2)'],
              borderColor: [
                'rgba(0,0,0, 1)','rgba(0,0,0, 1)','rgba(0,0,0, 1)',
                'rgba(0,0,0, 1)','rgba(0,0,0, 1)','rgba(0,0,0, 1)',
                'rgba(0,0,0, 1)','rgba(0,0,0, 1)','rgba(0,0,0, 1)'
              ],
              borderWidth: 1
            }
          ]
        });
      })
      .catch(err => {
        console.log(err);
      });
  };

  useEffect(() => {
    setInterval(() => {
      chart();
    }, 5000);
  }, []);
  return (
    <div className="App">
      <div>
        <h2>Total: {totalRam}MB </h2>
        <Doughnut data={chartData}/>
      </div>
    </div>
  );
};

export default ReporteRam;