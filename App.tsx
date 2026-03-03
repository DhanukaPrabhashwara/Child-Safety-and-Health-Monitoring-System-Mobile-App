import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ChildProvider } from './src/context/ChildContext';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import AddChildScreen from './src/screens/AddChildScreen';
import ChildTabs from './src/navigation/ChildTabs';
import EnrollVoiceScreen from './src/screens/EnrollVoiceScreen';
import AudioDetailScreen from './src/screens/AudioDetailScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ManageTrustedVoicesScreen from './src/screens/ManageTrustedVoicesScreen';
import CallWatchScreen from './src/screens/CallWatchScreen';
import SimulationScreen from './src/screens/SimulationScreen';
import PairWatchScreen from './src/screens/PairWatchScreen';

import ProfileScreen from './src/screens/ProfileScreen';

import { RootStackParamList } from './src/navigation/types';

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <ChildProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
              headerShown: false,
              cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
              cardStyle: { backgroundColor: '#F5F7FA' },
            }}
          >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="AddChild" component={AddChildScreen} />
            <Stack.Screen name="ChildDashboard" component={ChildTabs} />
            
            {/* New Screens */}
            <Stack.Screen name="EnrollVoice" component={EnrollVoiceScreen} />
            <Stack.Screen name="AudioDetail" component={AudioDetailScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="ManageTrustedVoices" component={ManageTrustedVoicesScreen} />
            <Stack.Screen name="CallWatch" component={CallWatchScreen} />
            <Stack.Screen name="Simulation" component={SimulationScreen} />
            <Stack.Screen name="PairWatch" component={PairWatchScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </ChildProvider>
    </SafeAreaProvider>
  );
}
