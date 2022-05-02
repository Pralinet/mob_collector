import React, { useState} from "react";

import RoomMonitor from './RoomMonitor/RoomMonitor';
import RightMenu from './RightMenu/RightMenu';
import ShopMenu from "./ShopMenu/ShopMenu";
import FarmMonitor from "./FarmMonitor/FarmMonitor";
import OverlayMenu from "./OverlayMenu/OverlayMenu";

import { DataProvider } from './Contexts/DataContext';
import { FrameProvider } from './Contexts/FrameContext';

import './App.css';
import "simplebar/dist/simplebar.min.css";
import MenuContainer from "./Menu/MenuContainer";



function App() {
  
  const [dimensions, setDimensions] = React.useState({ 
    height: window.innerHeight,
    width: window.innerWidth
  })


  React.useEffect(() => {
    function handleResize() {
      setDimensions({
        height: window.innerHeight,
        width: window.innerWidth
      })
  }
    window.addEventListener('resize', handleResize)
  },[])
  
  return (
    <div className="App">
      <DataProvider>
        <FrameProvider>
          <RoomMonitor dimensions={dimensions} />
          <OverlayMenu></OverlayMenu>
          <MenuContainer/>
          <FarmMonitor />
        </FrameProvider>
      </DataProvider>
    </div>
  );
}

export default App;
