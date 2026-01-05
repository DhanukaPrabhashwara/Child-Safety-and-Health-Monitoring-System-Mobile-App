import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Image, Dimensions, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { COLORS, SIZES, SPACING } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';
import TrustModelService from '../services/TrustModelService';

type AudioDetailRouteProp = RouteProp<RootStackParamList, 'AudioDetail'>;
type AudioDetailNavigationProp = StackNavigationProp<RootStackParamList, 'AudioDetail'>;
const { width } = Dimensions.get('window');

const AudioDetailScreen = () => {
    const navigation = useNavigation<AudioDetailNavigationProp>();
    const route = useRoute<AudioDetailRouteProp>();
    const { child } = route.params;

    const [enrolledVoices, setEnrolledVoices] = useState<{ id: string; name: string; initials: string; relation: string }[]>([]);

    const isDistress = child.audioStatus === 'distress';
    const isRiskHigh = child.riskScore > 80;

    // Animation for Live Badge
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useFocusEffect(
        React.useCallback(() => {
            loadVoices();
        }, [])
    );

    const loadVoices = async () => {
        const voices = await TrustModelService.getEnrolledVoices();
        const formatted = voices.map(v => ({
            id: v.name,
            name: v.name,
            initials: v.name.charAt(0).toUpperCase(),
            relation: 'Trusted' // Default relation
        }));
        setEnrolledVoices(formatted);
    };

    useEffect(() => {
        if (isDistress) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.2,
                        duration: 800,
                        easing: Easing.ease,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 800,
                        easing: Easing.ease,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            pulseAnim.setValue(1); // Reset
        }
    }, [isDistress]);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Audio Threat Monitor</Text>
                <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate('Settings')}>
                    <Ionicons name="settings-outline" size={24} color={COLORS.text} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                
                {/* Risk Analysis Graph Section */}
                <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>Risk Analysis</Text>
                    <View style={[styles.liveBadge, isDistress && { backgroundColor: COLORS.danger }]}>
                        <Animated.View 
                            style={[
                                styles.liveDot, 
                                isDistress && { 
                                    transform: [{ scale: pulseAnim }] 
                                }
                            ]} 
                        />
                        <Text style={[styles.liveText, isDistress && { color: 'white' }]}>LIVE</Text>
                    </View>
                </View>

                <View style={styles.graphCard}>
                    <Text style={styles.graphTitle}>Real-time Threat Level</Text>
                    <LineChart
                        data={{
                            labels: ["10m", "8m", "6m", "4m", "2m", "Now"],
                            datasets: [
                                {
                                    data: child.riskHistory.length > 0 ? child.riskHistory : [0, 0, 0, 0, 0, 0]
                                }
                            ]
                        }}
                        width={Dimensions.get("window").width - SPACING.m * 4}
                        height={220}
                        yAxisSuffix="%"
                        yAxisInterval={1}
                        chartConfig={{
                            backgroundColor: COLORS.white,
                            backgroundGradientFrom: COLORS.white,
                            backgroundGradientTo: COLORS.white,
                            decimalPlaces: 0,
                            color: (opacity = 1) => isRiskHigh ? `rgba(255, 82, 82, ${opacity})` : `rgba(33, 150, 243, ${opacity})`,
                            labelColor: (opacity = 1) => COLORS.textSecondary,
                            style: {
                                borderRadius: 16
                            },
                            propsForDots: {
                                r: "4",
                                strokeWidth: "2",
                                stroke: isRiskHigh ? COLORS.danger : COLORS.primary
                            }
                        }}
                        bezier
                        style={{
                            marginVertical: 8,
                            borderRadius: 16
                        }}
                    />
                    <View style={styles.readingContainer}>
                        <Text style={styles.readingLabel}>Current Risk Score:</Text>
                        <Text style={[styles.readingValue, { color: isRiskHigh ? COLORS.danger : COLORS.primary }]}>
                            {child.riskScore}%
                        </Text>
                    </View>
                </View>

                {/* Trusted Voices Section */}
                <Text style={styles.sectionTitle}>Trusted Voices</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.avatarsScroll}>
                    {/* Add New Button */}
                    <TouchableOpacity style={styles.addVoiceBtn} onPress={() => navigation.navigate('EnrollVoice' as any, { child })}>
                        <Ionicons name="add" size={30} color={COLORS.primary} />
                    </TouchableOpacity>
                    <Text style={styles.addVoiceLabel}>Enroll Voice</Text>

                    {/* Existing Voices */}
                    {child.trustedVoices.map((voice) => (
                        <View key={voice.id} style={styles.voiceItem}>
                            <View style={styles.voiceAvatar}>
                                <Text style={styles.initials}>{voice.initials}</Text>
                            </View>
                            <Text style={styles.voiceName}>{voice.name}</Text>
                            <Text style={styles.voiceRelation}>{voice.relation}</Text>
                        </View>
                    ))}
                </ScrollView>

                {/* Privacy Logs Section */}
                <Text style={styles.sectionTitle}>Privacy Logs</Text>
                <Text style={styles.privacySub}>No raw audio is recorded. Metadata only.</Text>
                
                <View style={styles.logsCard}>
                    {child.privacyLogs.map((log, index) => (
                        <View key={index} style={styles.logRow}>
                            <Text style={styles.logText}>
                                <Text style={styles.logTime}>[{log.timestamp}]</Text> Label={log.label}, Conf={log.confidence}%
                            </Text>
                            {index < child.privacyLogs.length - 1 && <View style={styles.divider} />}
                        </View>
                    ))}
                </View>

            </ScrollView>
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
    settingsButton: {
        padding: SPACING.s,
    },
    scrollContent: {
        padding: SPACING.l,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.m,
    },
    sectionTitle: {
        fontSize: 18, // Bold headings
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.s,
        marginTop: SPACING.m,
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFEBEE',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.danger,
        marginRight: 4,
    },
    liveText: {
        color: COLORS.danger,
        fontWeight: 'bold',
        fontSize: 10,
    },
    
    // Graph
    graphCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: SPACING.m,
        elevation: 2,
        marginBottom: SPACING.l,
    },
    graphTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.m,
    },
    readingContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: SPACING.s,
        paddingTop: SPACING.s,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    readingLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    readingValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },

    // Trusted Voices
    avatarsScroll: {
        flexDirection: 'row',
        marginBottom: SPACING.l,
    },
    addVoiceBtn: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    addVoiceLabel: {
        position: 'absolute',
        bottom: -20,
        fontSize: 10,
        color: COLORS.primary,
        width: 60,
        textAlign: 'center',
    },
    voiceItem: {
        alignItems: 'center',
        marginLeft: SPACING.l,
    },
    voiceAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#81D4FA', // Light Blue
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    initials: {
        fontSize: 20,
        color: COLORS.white,
        fontWeight: 'bold',
    },
    voiceName: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    voiceRelation: {
        fontSize: 10,
        color: COLORS.textSecondary,
    },

    // Privacy Logs
    privacySub: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginBottom: SPACING.m,
    },
    logsCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: SPACING.m,
    },
    logRow: {
        paddingVertical: 8,
    },
    logText: {
        fontFamily: 'monospace', // Monospace for logs
        fontSize: 12,
        color: '#333',
    },
    logTime: {
        fontWeight: 'bold',
        color: COLORS.textSecondary,
    },
    divider: {
        height: 1,
        backgroundColor: '#EEE',
        marginTop: 8,
    },
});

export default AudioDetailScreen;
