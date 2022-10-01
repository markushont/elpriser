import './App.css';

import React, { useState } from 'react';
import { Route, Routes } from "react-router-dom";

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
