import "react-datepicker/dist/react-datepicker.css";

import React, { useEffect, useState } from "react";

import DatePicker from "react-datepicker";
import HeatLineChart from "./components/HeatLineChart";
import SingleValueunitAndDescription from "./components/SingleValueUnitAndDescription";

function parseConsumptionData(consumptionData) {
  return {
    labels: consumptionData['consumption'].map(d => d['from_timestamp']),
    yDataType: "Förbrukning (kWh)",
    yData: consumptionData['consumption'].map(d => d['consumption']),
    zDataType: "Pris (kr/kWh)",
    zData: consumptionData['consumption'].map(d => d['unit_price'] + d['unit_price_vat']),
    cost: consumptionData['consumption'].map(d => d['consumption'] * (d['unit_price'] + d['unit_price_vat']))
  }
}

export default function ConsumptionChart(props) {
  const DATE_ENCODING = 'sv-SE';
  const yesterdayDate = ( d => new Date(d.setDate(d.getDate()-1)) )(new Date());
  
  const [chartData, setChartData] = useState({
    labels: [],
    yDataType: "",
    yData: [],
    zDataType: "",
    zData: [],
    cost: []
  });
  const [date, setDate] = useState(yesterdayDate);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loading)
      setLoading(true);

    fetch(`${process.env.REACT_APP_API_BASE_URL || ""}/consumption/${props.user}?date=${date.toLocaleDateString(DATE_ENCODING)}`)
      .then((response) => response.json())
      .then((jsonData) => setChartData(parseConsumptionData(jsonData)))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [date, props.user])

  const maxPrice = (Math.round(100 * Math.max(...chartData.zData)) / 100).toFixed(2);
  const minPrice = (Math.round(100 * Math.min(...chartData.zData)) / 100).toFixed(2);
  const totCost = chartData.cost.length ? (Math.round(100 * chartData.cost.reduce((agg, val) => agg += val)) / 100).toFixed(2) : 0;
  
  return (
    <div className="ConsumptionChart">
      <div className='header'>
        <p>Valt datum är</p>
        <DatePicker popperPlacement='auto' minDate={new Date('2022-01-01')} maxDate={yesterdayDate} selected={date} onChange={date => setDate(date)} dateFormat='yyyy-MM-dd' />
      </div>
      <div className='chart'>
        {loading && <div>Ett ögonlock...</div>}
        {!loading &&
          <>
            <HeatLineChart data={chartData} />
            <div style={{width: "95%", margin: "20px auto",}}>
              <div style={{margin: "0 20px", height: "20px", background: "linear-gradient(.25turn,rgb(0,255,0),transparent)", backgroundColor: "rgb(255,0,0)"}} />
              <div style={{display: "flex", lineHeight: 0, justifyContent: "space-between"}}>
                <p>{minPrice} kr</p>
                <p>{maxPrice} kr</p>
              </div>
            </div>
            <div style={{width: "182px", margin: "0 auto"}}>
              <SingleValueunitAndDescription val={totCost} unit="kr" desc="kostade dagen"/>
            </div>
          </>
        }
      </div>
    </div>
  )
}