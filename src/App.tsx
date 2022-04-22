import React, { useState} from "react";

import RoomMonitor from './RoomMonitor/RoomMonitor';
import RightMenu from './RightMenu/RightMenu';
import ShopMenu from "./ShopMenu/ShopMenu";
import FarmMonitor from "./FarmMonitor/FarmMonitor";
import OverlayMenu from "./OverlayMenu/OverlayMenu";

import { DataProvider } from './Contexts/DataContext';
import { FrameProvider } from './Contexts/FrameContext';

import './App.css';



function App() {
  
  const [dimensions, setDimensions] = React.useState({ 
    height: window.innerHeight,
    width: window.innerWidth
  })

  const [toggleMenu, setToggleMenu] = React.useState("menu")

  React.useEffect(() => {
    function handleResize() {
      setDimensions({
        height: window.innerHeight,
        width: window.innerWidth
      })
  }
    window.addEventListener('resize', handleResize)
  },[])

  const contents = () => {
    switch(toggleMenu){
      case "menu":
        return (<RightMenu/>);
      case "shop":
        return (<ShopMenu/>);
      default:
        return null;
    }
  }

  const onClickMenu = (select: string) => {
    setToggleMenu(select);
  }

  return (
    <div className="App">
      <DataProvider>
        <FrameProvider>
          <RoomMonitor dimensions={dimensions} />
          <OverlayMenu onClickMenu={onClickMenu} ></OverlayMenu>
          {contents()}
          <FarmMonitor />
        </FrameProvider>
      </DataProvider>
    </div>
  );
}

export default App;
