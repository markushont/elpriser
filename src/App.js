import './App.css';

import React, { useEffect, useState } from 'react';

import LineChart from './GradientLineChart';

function parseData(data) {
  return {
    labels: data['today'].map(d => d['startsAt']),
    data: {
      label: 'kr',
      data: data['today'].map(d => d['total'])
    }
  }
}

export default function App() {
  const date_encoding = 'sv-SE';

  const [data, setData] = useState(null);
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
    fetch(`${process.env.REACT_APP_API_BASE_URL}/prices/${user}?date=${date}`)
      .then((response) => response.json())
      .then((jsonData) => setData(parseData(jsonData)))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false))
  }, [date, user]);

  return (
    <div className='App'>
      <div className='header'>
        <h1><span role='img'>🎉🎊🎈</span> Här är elpriserna!! <span role='img'>🎈🎊🎉</span></h1>
        <p>Dagens datum är</p>
        <p style={{fontWeight: 'bold'}}>{date}</p>
      </div>
      <div className='chart'>
        {loading && <div>Ett ögonlock...</div>}
        {data &&
          <LineChart labels={data.labels} data={data.data} currentTime={time} title='Elpriser'/>
        }
      </div>
    </div>
  )
}
