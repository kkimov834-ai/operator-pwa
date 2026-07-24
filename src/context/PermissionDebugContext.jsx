import React, { createContext, useContext, useState } from 'react';

const PermissionDebugContext = createContext();

export const PermissionDebugProvider = ({ children }) => {
    const [showDebugIds, setShowDebugIds] = useState(() => {
        const saved = localStorage.getItem('showPermissionDebugIds');
        return saved === 'true';
    });

    const toggleDebugIds = () => {
        setShowDebugIds(prev => {
            const newValue = !prev;
            localStorage.setItem('showPermissionDebugIds', String(newValue));
            return newValue;
        });
    };
           
    return (
        <PermissionDebugContext.Provider value={{ showDebugIds, toggleDebugIds }}>
            {children}
        </PermissionDebugContext.Provider>
    );
};

export const usePermissionDebug = () => {
    const context = useContext(PermissionDebugContext);
    if (context === undefined) {
        throw new Error('usePermissionDebug must be used within a PermissionDebugProvider');
    }
    return context;
};
