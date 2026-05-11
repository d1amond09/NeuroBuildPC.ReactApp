import { createContext, useState, useEffect } from 'react';

export const BuilderContext = createContext();

export function BuilderProvider({ children }) {
    const [activeBuildId, setActiveBuildId] = useState(() => {
        return localStorage.getItem('neurobuild_active_id') || null;
    });

    const userId = "00000000-0000-0000-0000-000000000001";

    useEffect(() => {
        if (activeBuildId) {
            localStorage.setItem('neurobuild_active_id', activeBuildId);
        } else {
            localStorage.removeItem('neurobuild_active_id');
        }
    }, [activeBuildId]);

    return (
        <BuilderContext.Provider value={{ activeBuildId, setActiveBuildId, userId }}>
            {children}
        </BuilderContext.Provider>
    );
}