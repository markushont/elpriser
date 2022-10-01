import './App.css';

import React, { useState } from 'react';

import ConsumptionChart from './ConsumptionChart';
import PriceChart from './PriceChart';
import ToggleButtonGroup from './ToggleButtonGroup';

const page_names = {
  DAILY: "Dagspris",
  CONSUMPTION: "Konsumtion"
}

export default function App() {
  const [user] = useState('markus');
  const [activePage, setActivePage] = useState(page_names.DAILY)

  const pages = [page_names.DAILY, page_names.CONSUMPTION];

  return (
    <div className='App'>
      <div className='header'>
        <h1><span role='img' aria-label="Love">🎉🎊🎈</span> Här är elpriserna!! <span role='img' aria-label="Love">🎈🎊🎉</span></h1>
      </div>
      <div className="toggle-buttons">
        <ToggleButtonGroup types={pages} active={activePage} onClickCallback={setActivePage} />
      </div>
      {activePage === page_names.DAILY &&
        <div className='chartbox'>
          <PriceChart user={user} />
        </div>
      }
      {activePage === page_names.CONSUMPTION &&
        <div className='chartbox'>
          <ConsumptionChart user={user} />
        </div>
      }
    </div>
  )
}
