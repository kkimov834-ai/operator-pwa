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
                // Bizdə auth.services-də getCurrentUser /user/me qaytarır
                // RuleService isə yeni yaratdığımızdır
                const [userRes, ruleRes] = await Promise.all([
                    getCurrentUser(),
                    RuleService.getRules()
                ]);

                if (userRes?.status === "success" && userRes?.data) {
                    const userData = userRes.data;
                    setUser(userData);

                    if (ruleRes?.status === "success" && ruleRes?.data) {
                        const rulesData = ruleRes.data;
                        const role = userData.role;
                        const forbidden = rulesData.forbidden?.[role] || [];
                        setForbiddenIds(forbidden);
                    }
                } else if (userRes?.identifier) {
                    // Bəzi hallarda status success olmaya bilər amma data gələr
                    setUser(userRes);
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
