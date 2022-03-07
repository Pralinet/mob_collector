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
        <RoomMonitor />
        <FarmMonitor />
        <GoodsList />
      </DataProvider>
    </div>
  );
}

export default App;
