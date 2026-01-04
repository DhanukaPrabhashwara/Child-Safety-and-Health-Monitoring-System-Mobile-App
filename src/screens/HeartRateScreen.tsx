import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { ChildTabParamList } from '../navigation/types';
import { COLORS, SPACING, SIZES } from '../constants/theme';

type HeartRateScreenRouteProp = RouteProp<ChildTabParamList, 'Heart'>;

const HeartRateScreen = () => {
    const route = useRoute<HeartRateScreenRouteProp>();
    const { child } = route.params;
    const { healthData } = child;

    const isStressHigh = healthData.stressLevel > 70;
    const isHeartRateHigh = healthData.heartRate > 100;

    // Helper to map stress levels to numbers for the chart
    const getStressValue = (level: string) => {
        switch (level) {
            case 'Critical': return 95;
            case 'High': return 80;
            case 'Moderate': return 50;
            case 'Low': return 20;
            default: return 0;
        }
    };

    const DataChart = ({ title, data, color, suffix, icon, isStringData = false }: any) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                {icon}
                <Text style={styles.cardTitle}>{title}</Text>
            </View>
            <LineChart
                data={{
                    labels: ["1", "2", "3", "4", "5", "6"],
                    datasets: [{ data: isStringData ? data.map((d: string) => getStressValue(d)) : (data || [0, 0, 0, 0, 0, 0]) }]
                }}
                width={Dimensions.get("window").width - SPACING.m * 4}
                height={180}
                yAxisSuffix={suffix}
                chartConfig={{
                    backgroundColor: COLORS.white,
                    backgroundGradientFrom: COLORS.white,
                    backgroundGradientTo: COLORS.white,
                    decimalPlaces: 0,
                    color: (opacity = 1) => color,
                    labelColor: (opacity = 1) => COLORS.textSecondary,
                    style: { borderRadius: 16 },
                    propsForDots: { r: "4", strokeWidth: "2", stroke: color }
                }}
                bezier
                style={{ marginVertical: 8, borderRadius: 16 }}
            />
            <View style={styles.readingContainer}>
                <Text style={styles.readingLabel}>Latest Reading:</Text>
                <Text style={[styles.readingValue, { color }]}>
                    {data[data.length - 1] || (isStringData ? 'Normal' : 0)}{suffix}
                </Text>
            </View>
        </View>
    );

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text style={styles.title}>Heart & Stress</Text>
                <Text style={styles.subtitle}>Vital signs monitoring</Text>
            </View>

            {(isStressHigh || isHeartRateHigh) && (
                <View style={[styles.alertCard, { backgroundColor: isStressHigh ? COLORS.danger : COLORS.warning }]}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={32} color={COLORS.white} />
                    <View style={styles.alertTextContainer}>
                        <Text style={styles.alertTitle}>Vital Alert</Text>
                        <Text style={styles.alertMessage}>
                            {isStressHigh ? `High Stress Detected (${healthData.stressLevel}/100)` : `Elevated Heart Rate (${healthData.heartRate} bpm)`}
                        </Text>
                    </View>
                </View>
            )}

            <DataChart
                title="Heart Rate"
                data={healthData.heartRateHistory}
                color="#FF5252"
                suffix=" bpm"
                isStringData={false}
                icon={<FontAwesome5 name="heartbeat" size={24} color="#FF5252" style={styles.icon} />}
            />

            <DataChart
                title="Stress Level"
                data={healthData.stressHistory}
                color="#9C27B0"
                suffix=""
                isStringData={true}
                icon={<MaterialCommunityIcons name="brain" size={24} color="#9C27B0" style={styles.icon} />}
            />

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Analysis</Text>
                <Text style={styles.analysisText}>
                    {child.name}'s vitals are {isStressHigh || isHeartRateHigh ? 'showing signs of irregularity' : 'stable'}.
                    {isStressHigh && ' Consider engaging in a calming activity.'}
                </Text>
            </View>

            {/* Recent History */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Recent History (Stress)</Text>
                {healthData.stressHistory.map((level, index) => (
                    <View key={index} style={styles.historyRow}>
                        <View style={styles.historyLeft}>
                            <MaterialCommunityIcons name="brain" size={20} color={COLORS.danger} />
                            <Text style={styles.historyTime}>{index === healthData.stressHistory.length - 1 ? 'Now' : `${(healthData.stressHistory.length - 1 - index) * 10} mins ago`}</Text>
                        </View>
                        <Text style={styles.historyValue}>{level}</Text>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 25,
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        padding: SPACING.m,
        paddingBottom: 50,
    },
    header: {
        marginBottom: SPACING.l,
    },
    title: {
        fontSize: SIZES.title,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    subtitle: {
        fontSize: SIZES.body,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    alertCard: {
        borderRadius: SIZES.radius,
        padding: SPACING.m,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.m,
        elevation: 4,
    },
    alertTextContainer: {
        marginLeft: SPACING.m,
        flex: 1,
    },
    alertTitle: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    alertMessage: {
        color: COLORS.white,
        fontSize: 14,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: SPACING.m,
        marginBottom: SPACING.m,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.s,
    },
    icon: {
        marginRight: SPACING.s,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
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
        fontSize: 16,
        color: COLORS.textSecondary,
    },
    readingValue: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    analysisText: {
        fontSize: 14,
        color: COLORS.text,
        lineHeight: 20,
    },
    historyRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.s,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    historyLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    historyTime: {
        marginLeft: SPACING.m,
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    historyValue: {
        fontWeight: 'bold',
        fontSize: 16,
        color: COLORS.text,
    },
});

export default HeartRateScreen;
