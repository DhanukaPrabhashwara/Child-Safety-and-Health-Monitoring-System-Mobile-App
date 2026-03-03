import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Child, MOCK_CHILDREN } from '../data/mockData';
import { supabase } from '../services/SupabaseService';

interface ChildContextType {
    children: Child[];
    addChild: (child: Child) => void;
    refreshChildren: () => Promise<void>;
    loading: boolean;
}

const ChildContext = createContext<ChildContextType | undefined>(undefined);

export const ChildProvider = ({ children }: { children: ReactNode }) => {
    // Start with MOCK_CHILDREN as a fallback during development if no auth exists
    const [childrenList, setChildrenList] = useState<any[]>(MOCK_CHILDREN);
    const [loading, setLoading] = useState(true);

    const fetchChildren = async () => {
        setLoading(true);
        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const user = sessionData?.session?.user;

            if (user) {
                // Fetch real children from Supabase
                const { data, error } = await supabase
                    .from('children')
                    .select('*')
                    .eq('parent_id', user.id);
                
                if (!error && data && data.length > 0) {
                    // Map Supabase 'children' schema to local 'Child' interface
                    // We merge mock data structure temporarily until full DB schema covers everything (like location tracking)
                    const mappedChildren = data.map((dbChild: any) => {
                        const template = MOCK_CHILDREN[0]; // use as template for missing fields
                        return {
                            ...template,
                            id: dbChild.id,
                            name: dbChild.name,
                            age: dbChild.age,
                            gender: dbChild.gender || template.gender,
                            bloodGroup: dbChild.blood_type || template.bloodGroup,
                            photoUrl: dbChild.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(dbChild.name)}&background=random&color=fff&size=256`,
                        };
                    });
                    setChildrenList(mappedChildren);
                } else {
                     setChildrenList([]); // No children linked yet
                }
            } else {
                 // Fallback to mock data for local testing without login
                 setChildrenList(MOCK_CHILDREN);
            }
        } catch (error) {
            console.error("Error fetching children:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChildren();
        
        // Listen for Auth changes to reload data
        const { data: authListener } = supabase.auth.onAuthStateChange(() => {
            fetchChildren();
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const addChild = (child: Child) => {
        setChildrenList((prev) => [child, ...prev]);
        // Note: Real DB insertion should happen in AddChildScreen, which should then call `refreshChildren()`
    };

    return (
        <ChildContext.Provider value={{ children: childrenList, addChild, refreshChildren: fetchChildren, loading }}>
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
