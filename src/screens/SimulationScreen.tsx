import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SPACING } from '../constants/theme';
import VoiceRecorderService from '../services/VoiceRecorderService';
import TrustModelService from '../services/TrustModelService';

const SimulationScreen = () => {
    const navigation = useNavigation();
    const [isRecording, setIsRecording] = useState(false);
    const [testStatus, setTestStatus] = useState<'idle' | 'processing' | 'safe' | 'danger'>('idle');
    const [lastScore, setLastScore] = useState<number | null>(null);
    const [debugInfo, setDebugInfo] = useState<string>('Ready to test...');

    const handleStrangerTest = async () => {
        // Since we don't have a physical stranger file to load, we will guide the user
        // to use the Live Test functionality with a stranger's voice.
        Alert.alert(
            "Test Stranger Voice",
            "To test a stranger's voice, please use the 'Live Voice Test' below and have someone else speak, or play a recording of a stranger.",
            [{ text: "OK" }]
        );
    };

    const handleLiveTest = async () => {
        if (isRecording) {
            // Stop
            setIsRecording(false);
            setTestStatus('processing');
            setDebugInfo('Processing audio sample...');
            
            try {
                const uri = await VoiceRecorderService.stop();
                setDebugInfo(`Audio saved to: ${uri}\nRunning Inference...`);
                
                // Real check against trusted voices
                const result = await TrustModelService.checkAudio(uri);
                
                setLastScore(result.score);
                setTestStatus(result.status === 'SAFE' ? 'safe' : 'danger');
                
                // Get detailed debug info
                const debugStats = await TrustModelService.getDebugInfo();
                setDebugInfo(`Analysis Complete.\n\nResult: ${result.status}\nScore: ${result.score.toFixed(4)}\nMatch: ${result.person || 'None'}\n\n${debugStats}`);

            } catch (error) {
                console.error(error);
                setDebugInfo(`Error processing audio: ${error}`);
                setTestStatus('idle');
            }
        } else {
            // Start
            try {
                VoiceRecorderService.start();
                setIsRecording(true);
                setDebugInfo('Recording live audio... Speak now.');
                setTestStatus('idle');
            } catch (err: any) {
                console.error("Simulation recording error:", err);
                Alert.alert("Error", `Could not start recording: ${err.message || err}`);
            }
        }
    };

    const refreshStorageInfo = async () => {
        const info = await TrustModelService.getDebugInfo();
        setDebugInfo(info);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Simulation Studio</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Live Voice Verification</Text>
                    </View>
                    <Text style={styles.cardDesc}>
                        Record a voice (yours or a stranger's) to test the Trust Model in real-time.
                    </Text>

                    <TouchableOpacity 
                        style={[styles.actionBtn, { backgroundColor: isRecording ? COLORS.danger : COLORS.primary }]} 
                        onPress={handleLiveTest}
                        disabled={testStatus === 'processing' && !isRecording}
                    >
                        {isRecording ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <ActivityIndicator color={COLORS.white} style={{ marginRight: 8 }} />
                                <Text style={styles.btnText}>Stop & Analyze</Text>
                            </View>
                        ) : (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name="mic" size={20} color={COLORS.white} style={{ marginRight: 8 }} />
                                <Text style={styles.btnText}>Record & Test</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    {testStatus !== 'idle' && (
                        <View style={[styles.resultBox, testStatus === 'safe' ? styles.safeResult : testStatus === 'danger' ? styles.dangerResult : {}]}>
                            <Text style={styles.resultText}>
                                {testStatus === 'processing' ? 'Processing...' : 
                                 testStatus === 'safe' ? '✅ Trusted Voice Identified' : 
                                 '⚠️ Unknown Voice Detected'}
                            </Text>
                            {lastScore !== null && (
                                <Text style={{marginTop: 5, color: '#666'}}>
                                    Similarity: {(lastScore * 100).toFixed(1)}%
                                </Text>
                            )}
                        </View>
                    )}
                </View>

                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Stranger Simulation</Text>
                    </View>
                    <Text style={styles.cardDesc}>
                        Verify that unknown voices are correctly flagged as dangerous.
                    </Text>
                    <TouchableOpacity 
                        style={[styles.actionBtn, { backgroundColor: '#FFB6C1' }]} 
                        onPress={handleStrangerTest}
                        disabled={testStatus === 'processing'}
                    >
                        <Text style={[styles.btnText, { color: COLORS.danger }]}>Test Stranger Detection</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Debug Verification</Text>
                    <View style={styles.consoleBox}>
                        <Text style={styles.consoleText}>{debugInfo}</Text>
                    </View>
                    <TouchableOpacity onPress={refreshStorageInfo}>
                        <Text style={styles.linkText}>Refresh Storage Info</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F9FC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.m,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    backButton: {
        marginRight: SPACING.m,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    content: {
        padding: SPACING.m,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: SPACING.l,
        marginBottom: SPACING.l,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    cardHeader: {
        marginBottom: SPACING.s,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    cardDesc: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: SPACING.m,
        lineHeight: 20,
    },
    actionBtn: {
        height: 50,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: SPACING.s,
    },
    btnText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    resultBox: {
        marginTop: SPACING.m,
        padding: SPACING.m,
        borderRadius: 8,
        alignItems: 'center',
        backgroundColor: '#F0F0F0',
    },
    safeResult: {
        backgroundColor: '#E8F5E9',
        borderWidth: 1,
        borderColor: COLORS.success,
    },
    dangerResult: {
        backgroundColor: '#FFEBEE',
        borderWidth: 1,
        borderColor: COLORS.danger,
    },
    resultText: {
        fontWeight: 'bold',
        color: COLORS.text,
        fontSize: 16,
    },
    consoleBox: {
        backgroundColor: '#F5F5F5',
        padding: SPACING.m,
        borderRadius: 8,
        marginTop: SPACING.s,
        minHeight: 100,
    },
    consoleText: {
        fontFamily: 'monospace',
        fontSize: 12,
        color: '#555',
    },
    linkText: {
        color: COLORS.primary,
        fontWeight: 'bold',
        marginTop: SPACING.m,
        textAlign: 'right',
    },
});

export default SimulationScreen;
