import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { ChildTabParamList } from '../navigation/types';
import { COLORS, SPACING, SIZES } from '../constants/theme';

type HydrationScreenRouteProp = RouteProp<ChildTabParamList, 'Hydration'>;

const HydrationScreen = () => {
    const route = useRoute<HydrationScreenRouteProp>();
    const { child } = route.params;
    const { healthData } = child;

    const isHydrationLow = healthData.hydrationLevel < 40;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text style={styles.title}>Hydration Levels</Text>
                <Text style={styles.subtitle}>Daily water intake monitoring</Text>
            </View>

            {/* Alert Section */}
            {isHydrationLow && (
                <View style={styles.alertCard}>
                    <Ionicons name="warning" size={32} color={COLORS.white} />
                    <View style={styles.alertTextContainer}>
                        <Text style={styles.alertTitle}>Hydration Alert!</Text>
                        <Text style={styles.alertMessage}>
                            {child.name}'s hydration is critically low ({healthData.hydrationLevel}%). Please ensure they drink water.
                        </Text>
                    </View>
                    <TouchableOpacity onPress={() => console.log('Alert clicked')}>
                        <Ionicons name="chevron-forward" size={24} color={COLORS.white} />
                    </TouchableOpacity>
                </View>
            )}

            {/* Current Status Card */}
            <View style={styles.card}>
                <View style={styles.statusHeader}>
                    <MaterialCommunityIcons name="cup-water" size={40} color={COLORS.primary} />
                    <View style={styles.statusText}>
                        <Text style={styles.currentLabel}>Current Level</Text>
                        <Text style={styles.currentValue}>{healthData.hydrationLevel}%</Text>
                    </View>
                </View>
                <View style={styles.progressBarBg}>
                    <View
                        style={[
                            styles.progressBarFill,
                            {
                                width: `${healthData.hydrationLevel}%`,
                                backgroundColor: isHydrationLow ? COLORS.danger : COLORS.primary
                            }
                        ]}
                    />
                </View>
                <Text style={styles.statusFooter}>
                    {isHydrationLow ? 'Needs Attention' : 'Optimal Level'}
                </Text>
            </View>

            {/* Chart Section */}
            <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Last 7 Hours Activity</Text>
                <LineChart
                    data={{
                        labels: ["1", "2", "3", "4", "5", "6", "7"],
                        datasets: [
                            {
                                data: healthData.hydrationHistory || [0, 0, 0, 0, 0, 0, 0]
                            }
                        ]
                    }}
                    width={Dimensions.get("window").width - SPACING.m * 4}
                    height={220}
                    yAxisSuffix="%"
                    chartConfig={{
                        backgroundColor: COLORS.white,
                        backgroundGradientFrom: COLORS.white,
                        backgroundGradientTo: COLORS.white,
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        style: {
                            borderRadius: 16
                        },
                        propsForDots: {
                            r: "6",
                            strokeWidth: "2",
                            stroke: COLORS.primary
                        }
                    }}
                    bezier
                    style={{
                        marginVertical: 8,
                        borderRadius: 16
                    }}
                />
            </View>

            {/* Recommendations */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Recommendations</Text>
                <View style={styles.recommendationItem}>
                    <Ionicons name="water-outline" size={24} color={COLORS.primary} />
                    <Text style={styles.recommendationText}>Encourage drinking 1 glass of water now.</Text>
                </View>
                <View style={styles.recommendationItem}>
                    <Ionicons name="time-outline" size={24} color={COLORS.primary} />
                    <Text style={styles.recommendationText}>Next scheduled reminder in 30 mins.</Text>
                </View>
            </View>

            {/* Hydration Logs */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Hydration Logs</Text>
                {healthData.hydrationHistory.map((level, index) => (
                    <View key={index} style={styles.logRow}>
                        <View style={styles.logLeft}>
                            <Ionicons name="water" size={20} color={COLORS.primary} />
                            <Text style={styles.logTime}>Day {index + 1}</Text>
                        </View>
                        <Text style={styles.logValue}>{level}%</Text>
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
        backgroundColor: COLORS.danger,
        borderRadius: SIZES.radius,
        padding: SPACING.m,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.m,
        elevation: 4,
        shadowColor: COLORS.danger,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    alertTextContainer: {
        marginLeft: SPACING.m,
        flex: 1,
    },
    alertTitle: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
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
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    chartCard: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: SPACING.m,
        marginBottom: SPACING.m,
        elevation: 2,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        alignItems: 'center',
    },
    statusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.m,
    },
    statusText: {
        marginLeft: SPACING.m,
    },
    currentLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    currentValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    progressBarBg: {
        height: 10,
        backgroundColor: '#E0E0E0',
        borderRadius: 5,
        overflow: 'hidden',
        marginBottom: SPACING.s,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 5,
    },
    statusFooter: {
        textAlign: 'right',
        fontSize: 12,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.s,
        alignSelf: 'flex-start',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.m,
    },
    recommendationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.s,
    },
    recommendationText: {
        marginLeft: SPACING.s,
        fontSize: 14,
        color: COLORS.text,
        flex: 1,
    },
    logRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.s,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    logLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logTime: {
        marginLeft: SPACING.m,
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    logValue: {
        fontWeight: 'bold',
        fontSize: 16,
        color: COLORS.text,
    },
});

export default HydrationScreen;
