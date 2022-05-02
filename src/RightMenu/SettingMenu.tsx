import React, { useState, useMemo, useCallback } from "react";
import SimpleBar from "simplebar-react";
import { useDataContext } from "../Contexts/DataContext";

import './RightMenu.css';

const SettingMenu = () => {
    const { 
        resetData, manualSave
        } = useDataContext();

    const HandleReset = () => {
        var result = window.confirm('本当にリセットしますか？');
    
        if( result ) {
            resetData();
        }
    }

    return (
        <SimpleBar className="right-menu-content">
            <div className="right-menu-title"><span>設定</span></div>
            <div className="button" onClick={() => HandleReset()}>データをリセットする</div>
            <div className="button" onClick={() => manualSave()}>手動保存</div>
        </SimpleBar>
    );

}

export default SettingMenu;