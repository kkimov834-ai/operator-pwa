import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser } from '../services/auth.services';
import { RuleService } from '../services/rule.service';

const RBACContext = createContext();

export const RBACProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [forbiddenIds, setForbiddenIds] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRBACData = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                const [userRes, ruleRes] = await Promise.all([
                    getCurrentUser(),
                    RuleService.getRules()
                ]);

                const userData = userRes?.data?.data || userRes?.data || userRes;
                const role = userData?.role || userRes?.role;

                if (userData) {
                    setUser(userData);
                }

                const rulesData = ruleRes?.data?.data || ruleRes?.data || ruleRes;
                if (rulesData?.forbidden && role) {
                    const roleKey = Object.keys(rulesData.forbidden || {}).find(
                        k => k.toLowerCase() === role?.toLowerCase()
                    ) || role;
                    const forbidden = rulesData.forbidden?.[roleKey] || [];
                    setForbiddenIds(forbidden.map(Number));
                }
            } catch (error) {
                console.error("RBAC məlumatları yüklənərkən xəta baş verdi:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRBACData();
    }, []);

    return (
        <RBACContext.Provider value={{ user, forbiddenIds, isLoading }}>
            {children}
        </RBACContext.Provider>
    );
};

export const useRBAC = () => {
    const context = useContext(RBACContext);
    if (context === undefined) {
        throw new Error('useRBAC must be used within an RBACProvider');
    }
    return context;
};
