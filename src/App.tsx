import React, { useState} from "react";

import RoomMonitor from './RoomMonitor/RoomMonitor';
import FarmMonitor from './RightMenu/FarmMonitor';
import GoodsList from './GoodsList';

import { DataProvider } from './DataContext';

import './App.css';
import FoodMenu from "./RightMenu/FoodMenu";
import ItemMenu from "./RightMenu/ItemMenu";

function App() {
  
  const RightMenu = () => {
    const [menu, setMenu] = useState("farm");

    const contents = () => {
      switch(menu){
        case "farm":
          return (<FarmMonitor/>);
        case "food":
          return (<FoodMenu/>);
        case "item":
          return (<ItemMenu/>);
        default:
          return null;
      }
    }

    return (
      <div style={{display:"inline-block", verticalAlign: "top"}}>
        <div>
          <span onClick={() => setMenu("farm")}>farm</span>
          <span onClick={() => setMenu("food")}>food</span>
          <span onClick={() => setMenu("item")}>item</span>
        </div>
        <div>
          { contents() }  
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <DataProvider>
        <div style={{width: 1080}}>
          <RoomMonitor/>
          <RightMenu/>
          <GoodsList />
        </div>
      </DataProvider>
    </div>
  );
}

export default App;
