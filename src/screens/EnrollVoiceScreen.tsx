import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SPACING } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';
import VoiceRecorderService from '../services/VoiceRecorderService';
import TrustModelService from '../services/TrustModelService';
import { Audio } from 'expo-av';
import CustomAlert, { AlertType, AlertButton } from '../components/CustomAlert';

type EnrollVoiceRouteProp = RouteProp<RootStackParamList, 'EnrollVoice'>;

const STEPS = [
    { id: 1, text: "Say something in a soft/normal voice.", label: "Soft/Normal Voice" },
    { id: 2, text: "Say something in a loud or stern voice.", label: "Loud/Stern Voice" },
    { id: 3, text: "Hold phone at arm's length and speak.", label: "Distant Voice" },
];

const EnrollVoiceScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<EnrollVoiceRouteProp>();
    
    // Handle optional child param
    const child = route.params?.child;

    const [customName, setCustomName] = useState('');
    const [activeStep, setActiveStep] = useState<number | null>(null);
    const [processingStepId, setProcessingStepId] = useState<number | null>(null);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);
    const [permissionResponse, requestPermission] = Audio.usePermissions();
    
    const [alertConfig, setAlertConfig] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'info' as AlertType,
        buttons: [{ text: 'OK' }] as AlertButton[]
    });

    const showAlert = (title: string, message: string, type: AlertType = 'info', buttons: AlertButton[] = [{ text: 'OK' }]) => {
        setAlertConfig({ visible: true, title, message, type, buttons });
    };

    const hideAlert = () => {
        setAlertConfig(prev => ({ ...prev, visible: false }));
    };

    const startRecording = async (stepId: number) => {
        try {
            if (permissionResponse?.status !== 'granted') {
                const result = await requestPermission();
                if (!result.granted) {
                    showAlert('Permission Required', 'Microphone access is needed to enroll voice.', 'warning');
                    return;
                }
            }
            
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            console.log('Starting recording..');
            VoiceRecorderService.start();
            setActiveStep(stepId);
        } catch (err: any) {
            console.error('Failed to start recording', err);
            showAlert('Error', `Could not start microphone: ${err.message || err}`, 'error');
        }
    };

    const stopRecording = async (stepId: number) => {
        console.log('Stopping recording..');
        
        // Validate name if no child provided or enforce name even with child
        if (!customName.trim()) {
            showAlert('Name Required', 'Please enter a name for this voice profile before recording.', 'warning');
            return;
        }

        setActiveStep(null);
        setProcessingStepId(stepId);
        
        try {
            const uri = await VoiceRecorderService.stop();
            if (uri) {
                // Determine name
                const enrolledName = customName.trim() || (child ? `Parent of ${child.name}` : "Unknown");
                
                await TrustModelService.enrollVoiceSample(enrolledName, uri);
                
                setCompletedSteps(prev => [...prev, stepId]);
                showAlert('Saved', `Voice sample recorded successfully.`, 'success');
            }
        } catch (error: any) {
            console.error(error);
            showAlert('Error', `Failed to process voice sample: ${error?.message || error}`, 'error');
        } finally {
            setProcessingStepId(null);
        }
    };

    const handleFinish = async () => {
        if (completedSteps.length < STEPS.length) {
            showAlert('Incomplete', 'Please complete all voice samples first.', 'warning');
            return;
        }
        showAlert('Success', 'Voice enrollment complete! The AI now recognizes you.', 'success', [
            { text: 'OK', onPress: () => navigation.goBack() }
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <CustomAlert 
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onClose={hideAlert}
                buttons={alertConfig.buttons}
            />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Enroll Trusted Voice</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.infoCard}>
                    <Ionicons name="mic-circle" size={50} color={COLORS.primary} style={styles.icon} />
                    <Text style={styles.title}>Voice Recognition Setup</Text>
                    <Text style={styles.desc}>
                        Record 3 samples of your voice. The AI will learn to recognize you as a trusted person.
                    </Text>
                </View>

                <View style={styles.nameInputContainer}>
                    <Text style={styles.label}>{child ? "Name (e.g. 'Mom', 'Dad')" : "Your Name (for Voice Profile)"}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder={child ? "Enter name (e.g. Dad)" : "Enter your name"}
                        placeholderTextColor={COLORS.textSecondary}
                        value={customName}
                        onChangeText={setCustomName}
                    />
                </View>

                {STEPS.map((step) => {
                    const isCompleted = completedSteps.includes(step.id);
                    const isRecording = activeStep === step.id;
                    const isProcessing = processingStepId === step.id;
                    const isDisabled = (activeStep !== null && !isRecording) || isProcessing;

                    return (
                        <View key={step.id} style={styles.stepCard}>
                            <View style={styles.stepHeader}>
                                <Text style={styles.stepTitle}>Sample {step.id}</Text>
                                {isCompleted && <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />}
                            </View>
                            
                            <Text style={styles.stepPrompt}>{step.text}</Text>

                            {!isCompleted ? (
                                <TouchableOpacity 
                                    style={[
                                        styles.recordButton, 
                                        isRecording && styles.recordingActive,
                                        isDisabled && styles.disabledButton
                                    ]}
                                    onPress={() => isRecording ? stopRecording(step.id) : startRecording(step.id)}
                                    disabled={isDisabled}
                                >
                                    {isProcessing ? (
                                        <View style={styles.recordingIndicator}>
                                            <ActivityIndicator color="#FFF" size="small" />
                                            <Text style={styles.recordButtonText}>Processing...</Text>
                                        </View>
                                    ) : isRecording ? (
                                        <View style={styles.recordingIndicator}>
                                            <ActivityIndicator color="#FFF" />
                                            <Text style={styles.recordButtonText}>Stop Recording</Text>
                                        </View>
                                    ) : (
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                            <Ionicons name="mic" size={20} color="#FFF" />
                                            <Text style={styles.recordButtonText}>Tap to Record</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ) : (
                                <View style={styles.recordedBadge}>
                                    <Ionicons name="checkmark" size={16} color={COLORS.success} />
                                    <Text style={{ color: COLORS.success, fontWeight: 'bold', marginLeft: 4 }}>Recorded</Text>
                                </View>
                            )}
                        </View>
                    );
                })}
            </ScrollView>
            <View style={styles.footer}>
                <TouchableOpacity 
                    style={[styles.finishButton, completedSteps.length < STEPS.length && styles.disabledButton]}
                    onPress={handleFinish}
                    disabled={completedSteps.length < STEPS.length}
                >
                    <Text style={styles.finishButtonText}>Finish Enrollment</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.l,
        paddingVertical: SPACING.m,
        backgroundColor: COLORS.white,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    backButton: {
        padding: SPACING.s,
    },
    nameInputContainer: {
        backgroundColor: COLORS.white,
        padding: SPACING.m,
        borderRadius: SIZES.radius,
        marginBottom: SPACING.m,
        elevation: 2,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.s,
    },
    input: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: SIZES.radius,
        padding: SPACING.s,
        fontSize: 16,
    },
    content: {
        padding: SPACING.l,
    },
    infoCard: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    icon: {
        marginBottom: SPACING.s,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.s,
    },
    desc: {
        textAlign: 'center',
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    stepCard: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: SPACING.m,
        marginBottom: SPACING.m,
        elevation: 1,
    },
    stepHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.s,
    },
    stepTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    stepPrompt: {
        fontSize: 14,
        fontStyle: 'italic',
        color: COLORS.textSecondary,
        marginBottom: SPACING.m,
        backgroundColor: '#F5F5F5',
        padding: SPACING.s,
        borderRadius: 4,
    },
    recordButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.s,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        justifyContent: 'center',
    },
    recordingActive: {
        backgroundColor: COLORS.danger,
    },
    recordingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    recordButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 14,
    },
    disabledButton: {
        backgroundColor: '#B0C4DE',
        opacity: 0.7,
    },
    recordedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        padding: 8,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    footer: {
        padding: SPACING.l,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        backgroundColor: COLORS.white,
    },
    finishButton: {
        backgroundColor: COLORS.success,
        paddingVertical: SPACING.m,
        borderRadius: SIZES.radius,
        alignItems: 'center',
    },
    finishButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0, bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default EnrollVoiceScreen;
