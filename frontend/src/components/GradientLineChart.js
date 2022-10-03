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

function computeGradient(ctx, area, axisConfig, dataPoints, opacity=1) {
  const avg = dataPoints.reduce((a, b) => a + b, 0) / dataPoints.length;
  const max = Math.max.apply(0, dataPoints);
  const min = Math.min.apply(0, dataPoints);
  const maxViewportRatio = max / ((axisConfig && axisConfig.y && axisConfig.y.max) || max)
  const minViewportRatio = min / ((axisConfig && axisConfig.y && axisConfig.y.max) || max)
  const gradient = ctx.createLinearGradient(0, area.bottom, 0, area.top);

  gradient.addColorStop(minViewportRatio, `rgba(0, 255, 0, ${opacity})`);
  if (avg && max) {
    gradient.addColorStop(maxViewportRatio * avg / max, `rgba(255, 255, 0, ${opacity})`);
  }

  gradient.addColorStop(maxViewportRatio, `rgba(255, 0, 0, ${opacity})`);

  return gradient
}

function getOptions(title, axisConfig, legendConfig) {
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
        min: axisConfig && axisConfig.y && axisConfig.y.min,
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
        display: legendConfig && legendConfig.display,
        position: (legendConfig && legendConfig.position) || "top",
        labels: {
          filter: (item, chart) => item.text !== "__timeMarker"
        }
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
    labels: [],
    datasets: []
  });

  useEffect(() => {
    const chart = chartRef.current;

    if (!chart) return;

    const timeMarker = props.currentTime
      ? [{
          data: props.labels.map((label, index) => {
            const currentDate = props.currentTime;
            const labelDate = new Date(label);
            return dateCompareHours(currentDate, labelDate) ? props.data[0][index] : null
          }),
          label: "__timeMarker",
          xAxisID: 'xAxis',
          yAxisID: 'yAxis',
          borderWidth: 5,
          borderColor: 'black',
          backgroundColor: 'black'
        }]
      : [];
    
    const datasets = props.data.map(d => ({
      data: d.data,
      label: d.dataType,
      borderColor: d.borderColor || computeGradient(chart.ctx, chart.chartArea, props.axisConfig, d.data),
      backgroundColor: d.backgroundColor || d.borderColor,
      xAxisID: 'xAxis',
      yAxisID: 'yAxis',
      tension: 0.3,
      fill: true
    }))

    const chartData = {
      labels: props.labels,
      datasets: timeMarker.concat(datasets)
    };

    setChartData(chartData);
  }, [])

  return (
    <div style={{ width: '100%', padding: '2%' }} >
      <Chart ref={chartRef} options={getOptions(props.title, props.axisConfig)} type='line' data={chartData} />
    </div>
  )
}
