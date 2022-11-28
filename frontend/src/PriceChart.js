import './PriceChart.css';
import "react-datepicker/dist/react-datepicker.css";

import React, { useEffect, useState } from 'react';

import DatePicker from "react-datepicker";
import LineChart from './components/GradientLineChart';

function parseData(data) {
  return {
    today: {
      labels: data['today'].map(d => d['startsAt']),
      data: [
        {
          dataType: "kr",
          data: data['today'].map(d => d['total'])
        }
      ]
    },
    tomorrow: {
      labels: data['tomorrow'].map(d => d['startsAt']),
      data: [
        {
          data: data['tomorrow'].map(d => d['total']),
          dataType: "kr"
        }
      ]
    }
  }
}

export default function PriceChart(props) {
  const DATE_ENCODING = 'sv-SE';

  const [data, setData] = useState({
    today: {
      labels: [],
      data: [{data: [], dataType: "kr"}]
    },
    tomorrow: {
      labels: [],
      data: [{data: [], dataType: "kr"}]
    }
  });
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date());
  const currentTime = new Date();

  useEffect(() => {
    if (!loading)
      setLoading(true);
    fetch(`${process.env.REACT_APP_API_BASE_URL || ''}/prices/${props.user}?date=${date.toLocaleDateString(DATE_ENCODING)}`)
      .then((response) => response.json())
      .then((jsonData) => setData(parseData(jsonData)))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false))
  }, [date, props.user]);

  const shouldLoadTomorrowData = currentTime.getDate() === date.getDate();
  const hasTodayData = data.today.data[0].data.length !== 0;
  const hasTomorrowData = data.tomorrow.data[0].data.length !== 0;

  const yAxisPadding = 1.1;
  const globalMaxY = shouldLoadTomorrowData
    ? yAxisPadding * Math.max(...data.today.data[0].data, ...data.tomorrow.data[0].data)
    : yAxisPadding * Math.max(...data.today.data[0].data);

  const axisConfig = {
    y: {
      max: globalMaxY,
      min: 0
    }
  }

  return (
    <div className='PriceChart'>
      <div className='header'>
        <p>Valt datum är</p>
        <DatePicker popperPlacement='auto' minDate={new Date('2022-01-01')} maxDate={currentTime} selected={date} onChange={date => setDate(date)} dateFormat='yyyy-MM-dd' />
      </div>
      <div className='chart'>
        {loading && <div>Ett ögonlock...</div>}
        {hasTodayData &&
          <LineChart axisConfig={axisConfig} labels={data.today.labels} data={data.today.data} currentTime={currentTime} title='Elpriser'/>
        }
        {hasTomorrowData && shouldLoadTomorrowData
          ? <div>
              <p>Och <span style={{fontWeight: 'bold'}}>imorgon</span> blir det så här:</p>
              <LineChart axisConfig={axisConfig} labels={data.tomorrow.labels} data={data.tomorrow.data} title='Elpriser'/>
            </div>
          : !loading && shouldLoadTomorrowData &&
            <div>
              <h2><span style={{color: 'grey'}}>Morgondagens elpriser kommer ca kl 13:00!</span></h2>
            </div>
        }
      </div>
    </div>
  )
}