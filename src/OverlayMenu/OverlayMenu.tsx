import React, { useState, useMemo } from "react";
import { useDataContext } from '../Contexts/DataContext'
import ChatLogs from "./ChatLogs";

import './OverlayMenu.css';

type OverlayProps = {
  onClickMenu: (select: string)=> void;
}


const OverlayMenu = (props : OverlayProps) => {
    const { 
      userData:{player:{money, exp }}
    } = useDataContext();

    const handleClickMenu = (select: string) => {
      //console.log(select)
      props.onClickMenu(select);
    }

    return useMemo(() =>(
      <div className="overlay-menu">
        <div className="overlay-menu-button-wrapper">
          <div className="overlay-menu-button" onClick={() => handleClickMenu("menu")}>
            <span className="overlay-menu-button-image overlay-menu-button-menu"></span>
            <span className="overlay-menu-button-text">menu</span>
          </div>
          <div className="overlay-menu-button" onClick={() => handleClickMenu("shop")}>
            <span className="overlay-menu-button-image overlay-menu-button-shop"></span>
            <span className="overlay-menu-button-text">shop</span>
          </div>
        </div>
        <ChatLogs/>
            <div className="lv-display">
              <div className="lv"><span>{exp.lv}</span></div>
              <div className="lv-meter-wrapper">
                  <div className="exp-meter">
                    <div className="exp-meter-content" style={{width: (exp.exp/exp.nextExp*128)}}></div>
                    <span className="exp-meter-text">{Math.floor(exp.exp)} / {exp.nextExp}</span>
                  </div>
                <div>
                  <span className="lv-display-money-item"></span>
                  <span className="lv-display-money-text">{money}</span>
                </div>
              </div>
            </div>
      </div>
    ), [money, exp]);

}

export default OverlayMenu;