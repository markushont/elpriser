import "react-datepicker/dist/react-datepicker.css";

import React, { useEffect, useState } from "react";

import DatePicker from "react-datepicker";
import LineChart from "./GradientLineChart";

function parseData(data) {
  return {
    labels: data['consumption'].map(d => d['from_timestamp']),
    data: data['consumption'].map(d => d['consumption'])
  }
}

export default function ConsumptionChart(props) {
  const DATE_ENCODING = 'sv-SE';
  const yesterdayDate = ( d => new Date(d.setDate(d.getDate()-1)) )(new Date());
  
  const [data, setData] = useState({
    labels: [],
    data: []
  });
  const [date, setDate] = useState(yesterdayDate);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${process.env.REACT_APP_API_BASE_URL || ""}/consumption/${props.user}?date=${date.toLocaleDateString(DATE_ENCODING)}`)
      .then((response) => response.json())
      .then((jsonData) => setData(parseData(jsonData)))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [date, props.user])

  return (
    <div className="ConsumptionChart">
      <div className='header'>
        <p>Valt datum är</p>
        <DatePicker popperPlacement='auto' minDate={new Date('2022-01-01')} maxDate={yesterdayDate} selected={date} onChange={date => setDate(date)} dateFormat='yyyy-MM-dd' />
      </div>
      <div className='chart'>
        {loading && <div>Ett ögonlock...</div>}
        {!loading &&
          <LineChart dataType="kWh" labels={data.labels} data={data.data} title='Konsumption' />
        }
      </div>
    </div>
  )
}