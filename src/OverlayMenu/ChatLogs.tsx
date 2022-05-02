import React, { useState, useMemo } from "react";
import SimpleBar from "simplebar-react";
import { useDataContext } from '../Contexts/DataContext';

import './OverlayMenu.css';

const ChatLogs = () => {
    const { logs } = useDataContext();

    return (
    <div className="log-display" >
        <SimpleBar className="log-display-scroll">
            <div>
                {
                    logs.slice(-10).map((log, index) => {
                        return <div>{log}</div>
                    })
                }
            </div>
        </SimpleBar>
    </div>
    );
}

export default ChatLogs;