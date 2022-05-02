import React, { useState, useMemo } from "react";
import { useFrameContext } from '../Contexts/FrameContext';
import RightMenu from "../RightMenu/RightMenu";
import ShopMenu from "../ShopMenu/ShopMenu";

const MenuContainer = () => {
    const { toggleMenu } = useFrameContext();

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

    return (contents());
};

export default MenuContainer;