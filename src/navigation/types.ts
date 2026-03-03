import { Child } from '../data/mockData';

export type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    Home: undefined;
    AddChild: undefined;
    ChildDashboard: { child: Child };
    AudioDetail: { child: Child };
    EnrollVoice: { child?: Child };
    Settings: undefined;
    ManageTrustedVoices: undefined;
    CallWatch: { child: Child };
    Simulation: undefined;
    PairWatch: { child: Child };
    Profile: undefined;
};

export type ChildTabParamList = {
    Dashboard: { child: Child };
    Health: { child: Child };
    Hydration: { child: Child };
    Heart: { child: Child };
    Location: { child: Child };
};
