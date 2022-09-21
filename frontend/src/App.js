import './App.css';

import React, { useEffect, useState } from 'react';

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

export default function App() {
  const date_encoding = 'sv-SE';

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
  const [date, setDate] = useState((() => {
    const current = new Date();
    return current.toLocaleDateString(date_encoding);
  })());
  const [time, setTime] = useState(new Date());
  const [user, setUser] = useState('markus');

  useEffect(() => {
    const current = new Date();
    setDate(current.toLocaleDateString(date_encoding));
  });

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE_URL || ''}/prices/${user}?date=${date}`)
      .then((response) => response.json())
      .then((jsonData) => setData(parseData(jsonData)))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false))
  }, [date, user]);

  const yAxisPadding = 1.1;
  const globalMaxY = yAxisPadding * Math.max(...data.today.data, ...data.tomorrow.data);

  const hasTodayData = data.today.data.length !== 0;
  const hasTomorrowData = data.tomorrow.data.length !== 0;

  const axisConfig = {
    y: {
      max: globalMaxY
    }
  }

  return (
    <div className='App'>
      <div className='header'>
        <h1><span role='img'>🎉🎊🎈</span> Här är elpriserna!! <span role='img'>🎈🎊🎉</span></h1>
        <p>Dagens datum är <span style={{fontWeight: 'bold'}}>{date}</span></p>
      </div>
      <div className='chart'>
        {loading && <div>Ett ögonlock...</div>}
        {hasTodayData &&
          <LineChart axisConfig={axisConfig} labels={data.today.labels} dataType={data.currency} data={data.today.data} currentTime={time} title='Elpriser'/>
        }
        {hasTomorrowData
          ? <div>
              <p>Och <span style={{fontWeight: 'bold'}}>imorgon</span> blir det så här:</p>
              <LineChart axisConfig={axisConfig} labels={data.tomorrow.labels} dataType={data.currency} data={data.tomorrow.data} title='Elpriser'/>
            </div>
          : !loading &&
            <div>
              <h2><span style={{color: 'grey'}}>Morgondagens elpriser kommer ca kl 13:00!</span></h2>
            </div>
        }
      </div>
    </div>
  )
}
