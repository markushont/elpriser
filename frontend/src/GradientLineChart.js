import 'chartjs-adapter-moment';

import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  TimeScale,
  Title,
  Tooltip,
  registerables as registrablesJS
} from 'chart.js';
import React, { createRef, useEffect, useState } from "react";

import { Chart } from 'react-chartjs-2';

ChartJS.register(...registrablesJS);
ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineController,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function computeGradient(ctx, area, dataPoints) {
  const avg = dataPoints.reduce((a, b) => a + b, 0) / dataPoints.length;
  const max = Math.max.apply(0, dataPoints);
  const gradient = ctx.createLinearGradient(0, area.bottom, 0, area.top);

  gradient.addColorStop(0, 'green');
  if (avg && max) {
    gradient.addColorStop(avg/max, 'yellow');
  }
  gradient.addColorStop(1, 'red');

  return gradient
}

function getOptions(title, axisConfig) {
  return {
    scales: {
      xAxis: {
        type: 'time',
        time: {
          unit: 'hour',
          displayFormats: {
            hour: 'HH:mm'
          }
        }
      },
      yAxis: {
        min: axisConfig && axisConfig.x && axisConfig.x.max,
        max: axisConfig && axisConfig.y && axisConfig.y.max
      }
    },
    legend: {
      labels: {
        filter: (legendItem, chartData) => {
          return legendItem.datasetIndex === 0
        }
      }
    },
    responsive: true,
    plugins: {
      legend: {
        display: false,
        position: 'top',
      },
      title: {
        display: false,
        text: title,
      },
    },
  }
}

function dateCompareHours(d1, d2) {
  return d1
    && d1.getFullYear() === d2.getFullYear()
    && d1.getMonth() === d2.getMonth()
    && d1.getDay() === d2.getDay()
    && d1.getHours() === d2.getHours() 
}

export default function LineChart(props) {
  const chartRef = createRef();
  const [chartData, setChartData] = useState({
    datasets: []
  })

  useEffect(() => {
    const chart = chartRef.current;

    if (!chart) return;

    const chartData = {
      labels: props.labels,
      datasets: [
        {
          data: props.labels.map((label, index) => {
            const currentDate = props.currentTime;
            const labelDate = new Date(label);
            return dateCompareHours(currentDate, labelDate) ? props.data[index] : null
          }),
          xAxisID: 'xAxis',
          yAxisID: 'yAxis',
          borderWidth: 5,
          borderColor: 'black',
          backgroundColor: 'black'
        },
        {
          data: props.data,
          label: props.dataType,
          borderColor: computeGradient(chart.ctx, chart.chartArea, props.data),
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          xAxisID: 'xAxis',
          yAxisID: 'yAxis'
        }
      ]
    };

    setChartData(chartData);
  }, [])

  return (
    <div style={{width: '100%', padding: '2%'}} >
      <Chart ref={chartRef} options={getOptions(props.title, props.axisConfig)} type='line' data={chartData} />
    </div>
  )
}
