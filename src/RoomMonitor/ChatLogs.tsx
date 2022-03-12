import React, { useState, useMemo } from "react";
import { useDataContext } from '../DataContext';


const ChatLogs = () => {
    const { logs } = useDataContext();

    return (
    <div  style={{width: 120, height: 120, position:"absolute", overflowY:"scroll"}}>
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