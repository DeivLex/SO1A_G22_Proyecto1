import React, { useState, useEffect } from "react";
import { Line } from '@reactchartjs/react-chart.js';
import axios from "axios";

let totalRam = '0';

let empSal = [0];
let empAge = ['Uso'];
const ReporteRam2 = () => {
  const [chartData, setChartData] = useState({});
  const chart = () => {
    axios
      .post("http://34.121.110.42/ram")
      .then(res => {
        console.log(res.data);
        empSal.push(parseInt(res.data.uso));
        empAge.push('Uso')
        totalRam =  res.data.total;
        setChartData({
          labels: empAge,
          datasets: [
            {
              label: "Ram utilizada",
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
        <Line data={chartData} options={
          {
            scales: {
              yAxes: [
                {
                  ticks: {
                    min: 0,
                    max: parseInt(totalRam),
                    stepSize: 200
                  },
                },
              ],
            },
          }
        }/>
      </div>
    </div>
  );
};

export default ReporteRam2;