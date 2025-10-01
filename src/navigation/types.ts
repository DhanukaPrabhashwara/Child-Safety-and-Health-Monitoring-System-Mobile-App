import { Child } from '../data/mockData';

export type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    Home: undefined;
    AddChild: undefined;
    ChildDashboard: { child: Child };
};

export type ChildTabParamList = {
    Dashboard: { child: Child };
    Health: { child: Child };
    Hydration: { child: Child };
    Heart: { child: Child };
    Location: { child: Child };
};
