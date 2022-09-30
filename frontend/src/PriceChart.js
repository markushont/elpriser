import './PriceChart.css';
import "react-datepicker/dist/react-datepicker.css";

import React, { useEffect, useState } from 'react';

import DatePicker from "react-datepicker";
import LineChart from './GradientLineChart';

function parseData(data) {
  return {
    currency: 'kr',
    today: {
      labels: data['today'].map(d => d['startsAt']),
      data: data['today'].map(d => d['total'])
    },
    tomorrow: {
      labels: data['tomorrow'].map(d => d['startsAt']),
      data: data['tomorrow'].map(d => d['total'])
    }
  }
}

export default function PriceChart(props) {
  const DATE_ENCODING = 'sv-SE';

  const [data, setData] = useState({
    currency: 'kr',
    today: {
      labels: [],
      data: []
    },
    tomorrow: {
      labels: [],
      data: []
    }
  });
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date());
  const currentTime = new Date();

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE_URL || ''}/prices/${props.user}?date=${date.toLocaleDateString(DATE_ENCODING)}`)
      .then((response) => response.json())
      .then((jsonData) => setData(parseData(jsonData)))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false))
  }, [date, props.user]);

  const yAxisPadding = 1.1;
  const globalMaxY = yAxisPadding * Math.max(...data.today.data, ...data.tomorrow.data);

  const hasTodayData = data.today.data.length !== 0;
  const hasTomorrowData = data.tomorrow.data.length !== 0;
  const shouldLoadTomorrowData = currentTime.getDate() === date.getDate();

  const axisConfig = {
    y: {
      max: globalMaxY
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
          <LineChart axisConfig={axisConfig} labels={data.today.labels} dataType={data.currency} data={data.today.data} currentTime={currentTime} title='Elpriser'/>
        }
        {hasTomorrowData && shouldLoadTomorrowData
          ? <div>
              <p>Och <span style={{fontWeight: 'bold'}}>imorgon</span> blir det så här:</p>
              <LineChart axisConfig={axisConfig} labels={data.tomorrow.labels} dataType={data.currency} data={data.tomorrow.data} title='Elpriser'/>
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