import React, { useState, useEffect } from "react";
import { Pie } from '@reactchartjs/react-chart.js';
import axios from "axios";

const Reporte4 = () => {
  const [chartData, setChartData] = useState({});

  const chart = () => {
    let empSal = [];
    let empAge = [];
    axios
      .post("http://34.121.110.42/circular1")
      .then(res => {
        for (const dataObj of res.data) {
          empSal.push(parseInt(dataObj[0]));
          empAge.push(dataObj[1]);
        }
        setChartData({
          labels: empAge,
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
        <Pie data={chartData}/>
      </div>
    </div>
  );
};

export default Reporte4;