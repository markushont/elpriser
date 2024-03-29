import {
  Chart as ChartJS,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  Title,
  Tooltip
} from 'chart.js';
import React, { createRef, useEffect, useState } from "react";

import { Chart } from 'react-chartjs-2';

ChartJS.register(
  Legend,
  LinearScale,
  LineController,
  LineElement,
  Title,
  Tooltip
);


function getColorForZVal(zVal, maxZ, minZ, opacity) {
  const GREEN = [0, 255, 0];
  const GREENISH = [200, 255, 0 ];
  const YELLOW = [245, 245, 0];
  const RED = [255, 0, 0];
  
  const heat = maxZ !== minZ ? (zVal - minZ) / (maxZ - minZ) : 0;
  let color = GREEN;
  if (heat >= 0 && heat < 0.25) {
    color = GREEN;
  } else if (heat >= 0.25 && heat < 0.5) {
    color = GREENISH;
  } else if (heat >= 0.5 && heat < 0.75) {
    color = YELLOW;
  } else if (heat >= 0.75 && heat < 1) {
    color = RED;
  } else {
    color = RED;
  }

  return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${opacity})`
}

export default function HeatLineChart(props) {
  const [chartRef, setChartRef] = useState(createRef());
  const [chartWidth, setChartWidth] = useState(0);
  const [chartHeight, setChartHeight] = useState(0);
  const [chartGradient, setChartGradient] = useState(null);

  useEffect(() => {
    const chart = chartRef.current;

    if (!chart) {
      setChartRef(createRef());
    }

    if (!props.data.yData || !props.data.yData.length) return;
    
    const newWidth = chart.chartArea.right - chart.chartArea.left;
    const newHeight = chart.chartArea.bottom - chart.chartArea.top;
    if (chartGradient === null || chartWidth !== newWidth || chartHeight !== newHeight) {
      // Create the gradient because this is either the first render
      // or the size of the chart has changed
      setChartWidth(newWidth);
      setChartHeight(newHeight);
      const gradient = chart.ctx.createLinearGradient(chart.chartArea.left, 0, chart.chartArea.right, 0);
      const dX = 1 / props.data.labels.length;
      const maxZ = Math.max(...props.data.zData);
      const minZ = Math.min(...props.data.zData);
      for (let i = 0; i < props.data.labels.length; i++) {
        gradient.addColorStop(i*dX, getColorForZVal(props.data.zData[i], maxZ, minZ, 0.9))
      }
      setChartGradient(gradient);
    } 
  }, [props.data])

  const options = {
    scales: {
      xAxis: {
        type: 'time',
        time: {
          unit: 'hour',
          displayFormats: {
            hour: 'HH:mm'
          }
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          footer: (items) => {
            const price = items[0].dataset.zData[items[0].dataIndex];
            return `${items[0].dataset.zDataType}: ${price}`;
          }
        }
      }
    }
  }

  const chartData = {
    labels: props.data.labels,
    datasets: [
      {
        data: props.data.yData,
        label: props.data.yDataType,
        backgroundColor: chartGradient,
        fill: true,
        xAxisID: 'xAxis',
        tension: 0.4,
        pointRadius: 2,
        zData: props.data.zData,
        zDataType: props.data.zDataType
      }
    ]
  };

  return (
    <div>
      <Chart data={chartData} options={options} ref={chartRef} type='line' />
    </div>
  )
}
