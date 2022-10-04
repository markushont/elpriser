import './App.css';

import React, { useEffect, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";

import ConsumptionChart from './ConsumptionChart';
import Layout from './Layout';
import PriceChart from './PriceChart';

function Nothing() {
  return (
    <div>
      Nothing to see here
    </div>
  )
}

export default function App() {
  const [user] = useState("markus");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Handle redirects from S3 static website
    // https://via.studio/journal/hosting-a-reactjs-app-with-routing-on-aws-s3
    const path = (/#!(\/.*)$/.exec(location.hash) || [])[1];
    if (path) {
      navigate(path);
    }
  })

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<PriceChart user={user} />} />
          <Route path="/forbrukning" element={<ConsumptionChart user={user} />} />

          <Route path="*" element={<Nothing />} />
        </Route>
      </Routes>
    </div>
  )
}
