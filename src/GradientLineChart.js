import 'chartjs-adapter-moment';

import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  TimeScale,
  Title,
  Tooltip,
} from 'chart.js';
import React, { createRef, useEffect, useState } from "react";

import { Chart } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
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
  gradient.addColorStop(avg/max, 'yellow');
  gradient.addColorStop(1, 'red');

  return gradient
}

function getOptions(title) {
  return {
    scales: {
      xAxis: {
        type: 'time',
        time: {
          unit: 'minute'
        }
      }
    },
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: title,
      },
    },
  }
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
          data: props.data.data,
          label: props.data.label,
          borderColor: computeGradient(chart.ctx, chart.chartArea, props.data.data),
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          xAxisID: 'xAxis'
        }
      ]
    };

    setChartData(chartData);
  }, [])

  console.log(chartData)
  return <Chart ref={chartRef} options={getOptions(props.title)} type='line' data={chartData} />
}
