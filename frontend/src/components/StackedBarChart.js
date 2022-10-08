import 'chartjs-adapter-moment';

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  registerables as registrablesJS
} from 'chart.js';

import { Bar } from 'react-chartjs-2';
import React from "react";

ChartJS.register(...registrablesJS);
ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend
);

export default function StackedBarChart(props) {

  const chartData = {
    labels: props.data.labels,
    datasets: props.data.data.map(d => (
      {
        xAxisID: 'xAxis',
        yAxisID: 'yAxis',
        backgroundColor: 'green',
        ...d,
      }
    ))
  }

  const chartOptions = {
    responsive: true,
    scales: {
      xAxis: {
        type: 'time',
        time: {
          unit: 'day',
          displayFormats: {
            day: 'YYYY-MM-DD'
          }
        },
        stacked: true
      },
      yAxis: {
        stacked: true
      }
    }
  }

  return (
    <div style={{ width: '100%', padding: '2%' }}>
      <Bar options={chartOptions} data={chartData} />
    </div>
  )
}
