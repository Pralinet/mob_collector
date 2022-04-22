import React, { useState, useMemo } from "react";
import { useDataContext } from '../Contexts/DataContext';

import './OverlayMenu.css';

const ChatLogs = () => {
    const { logs } = useDataContext();

    return (
    <div className="log-display" >
        <div>
        {
            logs.slice(-10).map((log, index) => {
                return <div>{log}</div>
            })
        }
        </div>
    </div>
    );
}

export default ChatLogs;