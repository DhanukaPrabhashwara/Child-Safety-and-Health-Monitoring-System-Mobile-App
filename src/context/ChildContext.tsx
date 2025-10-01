import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Child, MOCK_CHILDREN } from '../data/mockData';

interface ChildContextType {
    children: Child[];
    addChild: (child: Child) => void;
}

const ChildContext = createContext<ChildContextType | undefined>(undefined);

export const ChildProvider = ({ children }: { children: ReactNode }) => {
    const [childrenList, setChildrenList] = useState<Child[]>(MOCK_CHILDREN);

    const addChild = (child: Child) => {
        setChildrenList((prev) => [child, ...prev]);
    };

    return (
        <ChildContext.Provider value={{ children: childrenList, addChild }}>
            {children}
        </ChildContext.Provider>
    );
};

export const useChildContext = () => {
    const context = useContext(ChildContext);
    if (!context) {
        throw new Error('useChildContext must be used within a ChildProvider');
    }
    return context;
};
