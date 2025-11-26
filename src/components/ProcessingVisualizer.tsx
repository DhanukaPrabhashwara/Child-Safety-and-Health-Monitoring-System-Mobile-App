import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Modal, Animated, Easing, Dimensions } from 'react-native';
import { COLORS, SIZES, SPACING } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface ProcessingVisualizerProps {
    visible: boolean;
    onAnimationComplete?: () => void;
}

const ProcessingVisualizer: React.FC<ProcessingVisualizerProps> = ({ visible, onAnimationComplete }) => {
    const [step, setStep] = useState(0); // 0: Wave, 1: Spectrogram, 2: Model, 3: Done
    
    // Animations
    const waveAnim = useRef(new Animated.Value(0)).current;
    const gridAnim = useRef(new Animated.Value(0)).current;
    const modelAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            startSequence();
        } else {
            reset();
        }
    }, [visible]);

    const reset = () => {
        setStep(0);
        waveAnim.setValue(0);
        gridAnim.setValue(0);
        modelAnim.setValue(0);
        fadeAnim.setValue(0);
    };

    const startSequence = () => {
        setStep(0);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();

        // Step 1: Waveform (1.5s)
        Animated.loop(
            Animated.sequence([
                Animated.timing(waveAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
                Animated.timing(waveAnim, { toValue: 0, duration: 500, useNativeDriver: true })
            ])
        ).start();

        setTimeout(() => {
            // Step 2: Spectrogram (1.5s)
            setStep(1);
            Animated.timing(gridAnim, {
                toValue: 1,
                duration: 1000,
                easing: Easing.out(Easing.exp),
                useNativeDriver: true,
            }).start();

            setTimeout(() => {
                // Step 3: Model Inference (1.5s)
                setStep(2);
                Animated.timing(modelAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }).start();

                setTimeout(() => {
                    // Step 4: Complete
                    setStep(3);
                    if (onAnimationComplete) {
                        setTimeout(onAnimationComplete, 800);
                    }
                }, 1500);
            }, 1500);
        }, 1500);
    };

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.container}>
                <View style={styles.card}>
                    <Text style={styles.title}>Processing Audio</Text>
                    
                    <View style={styles.visualContainer}>
                        {step === 0 && (
                            <View style={styles.stageContainer}>
                                <Ionicons name="git-network-outline" size={50} color={COLORS.primary} />
                                <Text style={styles.label}>Analyzing Waveform...</Text>
                                <View style={styles.waveRow}>
                                    {[...Array(5)].map((_, i) => (
                                        <Animated.View 
                                            key={i} 
                                            style={[
                                                styles.waveBar, 
                                                { 
                                                    transform: [{ scaleY: waveAnim.interpolate({
                                                        inputRange: [0, 1],
                                                        outputRange: [0.5, 1.5 + (i % 2)]
                                                    }) }] 
                                                }
                                            ]} 
                                        />
                                    ))}
                                </View>
                            </View>
                        )}

                        {step === 1 && (
                            <View style={styles.stageContainer}>
                                <Ionicons name="grid-outline" size={50} color={COLORS.secondary} />
                                <Text style={styles.label}>Generating Spectrogram</Text>
                                <Text style={styles.subLabel}>(124, 129) Log-Mel</Text>
                                <Animated.View style={[styles.gridBox, { opacity: gridAnim, transform: [{ scale: gridAnim }] }]}>
                                    {/* Abstract Grid Representation */}
                                    <View style={styles.gridRow}><View style={styles.cell} /><View style={styles.cellDark} /><View style={styles.cell} /></View>
                                    <View style={styles.gridRow}><View style={styles.cellDark} /><View style={styles.cell} /><View style={styles.cellDark} /></View>
                                    <View style={styles.gridRow}><View style={styles.cell} /><View style={styles.cellDark} /><View style={styles.cell} /></View>
                                </Animated.View>
                            </View>
                        )}

                        {step === 2 && (
                            <View style={styles.stageContainer}>
                                <Ionicons name="hardware-chip-outline" size={50} color={COLORS.primary} />
                                <Text style={styles.label}>Running TFLite Model</Text>
                                <Text style={styles.subLabel}>Extracting 128-d Vector</Text>
                                <Animated.View style={[styles.progressBar, { width: modelAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['0%', '100%']
                                }) }]} />
                            </View>
                        )}

                        {step === 3 && (
                            <View style={styles.stageContainer}>
                                <Ionicons name="checkmark-circle" size={60} color={COLORS.success} />
                                <Text style={styles.label}>Complete!</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        width: width * 0.85,
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: SPACING.l,
        alignItems: 'center',
        elevation: 5,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.l,
    },
    visualContainer: {
        height: 150,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    stageContainer: {
        alignItems: 'center',
        width: '100%',
    },
    label: {
        marginTop: SPACING.m,
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
    },
    subLabel: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    waveRow: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 40,
        marginTop: SPACING.m,
        gap: 6,
    },
    waveBar: {
        width: 6,
        height: 20,
        backgroundColor: COLORS.primary,
        borderRadius: 3,
    },
    gridBox: {
        marginTop: SPACING.m,
        width: 60,
        height: 60,
        backgroundColor: '#F0F0F0',
        padding: 4,
        flexWrap: 'wrap',
        gap: 2,
    },
    gridRow: {
        flexDirection: 'row',
        gap: 2,
    },
    cell: {
        width: 16,
        height: 16,
        backgroundColor: COLORS.secondary,
        opacity: 0.3,
    },
    cellDark: {
        width: 16,
        height: 16,
        backgroundColor: COLORS.secondary,
        opacity: 0.8,
    },
    progressBar: {
        height: 8,
        backgroundColor: COLORS.primary,
        borderRadius: 4,
        marginTop: SPACING.m,
    }
});

export default ProcessingVisualizer;
