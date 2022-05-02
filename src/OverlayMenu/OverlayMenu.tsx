import classNames from "classnames";
import React, { useState, useMemo } from "react";
import { useDataContext } from '../Contexts/DataContext'
import { useFrameContext } from "../Contexts/FrameContext";
import ChatLogs from "./ChatLogs";

import './OverlayMenu.css';


const OverlayMenu = () => {
    const { 
      userData:{player:{money, exp }}
    } = useDataContext();

    const {
      toggleMenu, setToggleMenu
    } = useFrameContext();

    const handleClickMenu = (select: string) => {
      setToggleMenu(select);
    }

    return useMemo(() =>(
      <div className="overlay-menu">
        <div className="overlay-menu-button-wrapper">
          <div className={classNames("overlay-menu-button", toggleMenu==="menu"?"selected":"clickable")} onClick={() => handleClickMenu("menu")}>
            <span className="overlay-menu-button-image overlay-menu-button-menu"></span>
            <span className="overlay-menu-button-text">menu</span>
          </div>
          <div className={classNames("overlay-menu-button", toggleMenu==="shop"?"selected":"clickable")} onClick={() => handleClickMenu("shop")}>
            <span className="overlay-menu-button-image overlay-menu-button-shop"></span>
            <span className="overlay-menu-button-text">shop</span>
          </div>
        </div>
        <ChatLogs/>
            <div className="lv-display">
              <div className="lv">
                <span className="lv-title"></span>
                <p>{exp.lv}</p>
              </div>
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
    ), [money, exp, toggleMenu]);

}

export default OverlayMenu;