import React, { useState, useMemo } from "react";
import FoodMenu from "./FoodMenu";
import ItemMenu from "./ItemMenu";
import GoodsMenu from "./GoodsMenu"
import classNames from "classnames";

import './RightMenu.css';
import SettingMenu from "./SettingMenu";

const RightMenu = () => {
    const [menu, setMenu] = useState("item");

    const contents = () => {
      switch(menu){
        case "food":
          return (<FoodMenu/>);
        case "item":
          return (<ItemMenu/>);
        case "setting":
          return (<SettingMenu/>);
        default:
          return (<GoodsMenu/>);
      }
    }

    return useMemo(() => (
      <div className="right-menu">
        <div className="right-menu-select">
            <div className={classNames("right-menu-select-frame", menu==="item"?"selected":"" )} onClick={() => setMenu("item")}>
                <span className="right-menu-select-item right-menu-select-item-item"></span>
            </div>
            <div className={classNames("right-menu-select-frame", menu==="food"?"selected":"" )} onClick={() => setMenu("food")}>
                <span className="right-menu-select-item right-menu-select-item-food"></span>
            </div>
            <div className={classNames("right-menu-select-frame", menu==="goods"?"selected":"" )} onClick={() => setMenu("goods")}>
                <span className="right-menu-select-item right-menu-select-item-goods"></span>
            </div>
            <div className={classNames("right-menu-select-frame", menu==="setting"?"selected":"" )} onClick={() => setMenu("setting")}>
                <span className="right-menu-select-item right-menu-select-item-setting"></span>
            </div>
        </div>
        <div className="right-menu-wrapper">
          { contents() }  
        </div>
      </div>
    ), [menu]);
}

export default RightMenu;