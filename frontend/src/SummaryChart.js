import "./SummaryChart.css";

import React, { useEffect, useState } from "react";

import SingleValueAndDescription from "./components/SingleValueUnitAndDescription";
import StackedBarChart from "./components/StackedBarChart";

function parseSummaryData(summaryData) {
  return {
    price_avg_daily: summaryData['price_avg_daily'],
    consumption_avg_daily: summaryData['consumption_avg_daily'],
    cost_tot: Math.round(summaryData['cost_tot']),
    labels: summaryData['30_day_summary'].map(d => d['date']),
    data: [
      {
        data: summaryData['30_day_summary'].map(d => d['consumption_tot']),
        label: 'Förbrukning',
        backgroundColor: 'yellow',
        stack: 'stack_0'
      },
      {
        data: summaryData['30_day_summary'].map(d => d['price_avg']),
        label: 'Snittpris',
        backgroundColor: 'green',
        stack: 'stack_0'
      },
      {
        data: summaryData['30_day_summary'].map(d => d['cost_tot']),
        label: 'Kostnad',
        backgroundColor: 'rgba(200,200,200,0.5)',
        stack: 'stack_1'
      }
    ]
  }
}

export default function SummaryChart(props) {
  const [chartData, setChartData] = useState({
    avg_price: 0,
    avg_consumption: 0,
    cost_tot: 0,
    labels: [],
    data: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loading)
      setLoading(true);
    
    fetch(`${process.env.REACT_APP_API_BASE_URL || ""}/summary/${props.user}`)
      .then((response) => response.json())
      .then((jsonData) => setChartData(parseSummaryData(jsonData)))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [props.user])

  return (
    <div className="SummaryChart">
      <div className="chart">
        {loading && <div>Ett ögonlock...</div>}
        {!loading &&
          <StackedBarChart data={chartData} />
        }
      </div>
      {!loading &&
        <div className="stats-container">
          <SingleValueAndDescription val={chartData['cost_tot']} unit="kr" desc="betalar du" />
          <SingleValueAndDescription val={chartData['consumption_avg_daily']} unit="kWh/dag" desc="förbrukar du (typ)" />
          <SingleValueAndDescription val={chartData['price_avg_daily']} unit="kr/kWh" desc="kostar det (typ)" />
        </div>
      }
    </div>
  )
}
