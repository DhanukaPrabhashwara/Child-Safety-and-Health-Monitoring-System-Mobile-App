import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { COLORS, SIZES, SPACING } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';

type CallWatchRouteProp = RouteProp<RootStackParamList, 'CallWatch'>;

const CallWatchScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<CallWatchRouteProp>();
    const { child } = route.params;
    
    const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        // Simulate connection delay
        const timer = setTimeout(() => {
            setCallStatus('connected');
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (callStatus === 'connected') {
            const interval = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [callStatus]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleEndCall = () => {
        setCallStatus('ended');
        setTimeout(() => {
            navigation.goBack();
        }, 1000);
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.avatarContainer}>
                    <View style={styles.avatarPlaceholder}>
                        <Ionicons name="person" size={80} color="#FFF" />
                    </View>
                </View>
                
                <Text style={styles.name}>{child.name}</Text>
                
                <Text style={styles.status}>
                    {callStatus === 'connecting' && 'Connecting...'}
                    {callStatus === 'connected' && formatTime(duration)}
                    {callStatus === 'ended' && 'Call Ended'}
                </Text>

                <View style={styles.controls}>
                    <TouchableOpacity style={[styles.controlButton, styles.muteButton]}>
                        <Ionicons name="mic-off" size={32} color="#FFF" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={[styles.controlButton, styles.endButton]} onPress={handleEndCall}>
                        <MaterialIcons name="call-end" size={40} color="#FFF" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={[styles.controlButton, styles.speakerButton]}>
                        <Ionicons name="volume-high" size={32} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#202124',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 80,
    },
    avatarContainer: {
        marginBottom: SPACING.l,
    },
    avatarPlaceholder: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#5F6368',
        justifyContent: 'center',
        alignItems: 'center',
    },
    name: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: SPACING.s,
    },
    status: {
        fontSize: 18,
        color: '#BDC1C6',
        marginBottom: 80,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 40,
    },
    controlButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    muteButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    speakerButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    endButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FF3B30',
    },
});

export default CallWatchScreen;
