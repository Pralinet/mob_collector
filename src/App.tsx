import React from 'react';

import RoomMonitor from './RoomMonitor';
import FarmMonitor from './FarmMonitor';
import GoodsList from './GoodsList';

import { DataProvider } from './DataContext';

import './App.css';

function App() {
  

  return (
    <div className="App">
      <DataProvider>
        <div style={{width: 1080}}>
          <RoomMonitor/>
          <FarmMonitor />
          <GoodsList />
        </div>
      </DataProvider>
    </div>
  );
}

export default App;
