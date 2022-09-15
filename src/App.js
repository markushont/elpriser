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

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState((() => {
    const current = new Date();
    return current.toLocaleDateString(date_encoding);
  })())

  useEffect(() => {
    const current = new Date();
    setDate(current.toLocaleDateString(date_encoding));
  });

  useEffect(() => {
    fetch(`/api/prices/markus?date=${date}`)
      .then((response) => response.json())
      .then((jsonData) => setData(parseData(jsonData)))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false))
  }, [date]);

  return (
    <div style={{width: '70vw', height: ''}} className="App">
      {loading && <div>A moment please...</div>}
      {data &&
        <LineChart labels={data.labels} data={data.data} title='Elpriser'/>
      }
    </div>
  )
}
