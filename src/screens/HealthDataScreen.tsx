import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { ChildTabParamList } from '../navigation/types';
import { COLORS, SPACING, SIZES } from '../constants/theme';

type HealthDataScreenRouteProp = RouteProp<ChildTabParamList, 'Health'>;

const HealthDataScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<HealthDataScreenRouteProp>();
    const { child } = route.params;
    const { healthData } = child;

    const HealthCard = ({ title, value, unit, icon, color }: any) => (
        <View style={[styles.card, { borderLeftColor: color, borderLeftWidth: 4 }]}>
            <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                {icon}
            </View>
            <View style={styles.dataContainer}>
                <Text style={styles.cardTitle}>{title}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                    <Text style={[styles.cardValue, { color }]}>{value}</Text>
                    <Text style={styles.cardUnit}>{unit}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                {/* Back Button Removed */}
                <Text style={styles.headerTitle}>Health Data</Text>
            </View>

            <View style={styles.subHeader}>
                <Text style={styles.childName}>For {child.name}</Text>
                <Text style={styles.lastUpdated}>Last updated: {healthData.lastUpdated}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <HealthCard
                    title="Heart Rate"
                    value={healthData.heartRate}
                    unit="bpm"
                    color="#FF5252"
                    icon={<FontAwesome5 name="heartbeat" size={24} color="#FF5252" />}
                />

                <HealthCard
                    title="Blood Oxygen"
                    value={healthData.spO2}
                    unit="%"
                    color="#2196F3"
                    icon={<MaterialCommunityIcons name="water-percent" size={28} color="#2196F3" />}
                />

                <HealthCard
                    title="Temperature"
                    value={healthData.temperature}
                    unit="°C"
                    color="#FF9800"
                    icon={<FontAwesome5 name="temperature-high" size={24} color="#FF9800" />}
                />

                <HealthCard
                    title="Blood Pressure"
                    value={healthData.bloodPressure}
                    unit="mmHg"
                    color="#9C27B0"
                    icon={<Ionicons name="fitness" size={24} color="#9C27B0" />}
                />

                <HealthCard
                    title="Hydration Level"
                    value={healthData.hydrationLevel}
                    unit="%"
                    color={healthData.hydrationLevel < 40 ? COLORS.danger : COLORS.primary}
                    icon={<Ionicons name="water" size={24} color={healthData.hydrationLevel < 40 ? COLORS.danger : COLORS.primary} />}
                />

                <View style={styles.historyCard}>
                    <Text style={styles.historyTitle}>Recent Activity</Text>
                    <View style={styles.historyItem}>
                        <Ionicons name="walk" size={20} color={COLORS.success} />
                        <Text style={styles.historyText}>Steps today: 4,520</Text>
                    </View>
                    <View style={styles.historyItem}>
                        <Ionicons name="moon" size={20} color={COLORS.primary} />
                        <Text style={styles.historyText}>Sleep: 8h 12m</Text>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 25,
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.m,
        backgroundColor: COLORS.white,
    },
    backButton: {
        marginRight: SPACING.m,
    },
    headerTitle: {
        fontSize: SIZES.title,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    subHeader: {
        padding: SPACING.m,
        backgroundColor: COLORS.background,
    },
    childName: {
        fontSize: 18,
        color: COLORS.textSecondary,
    },
    lastUpdated: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 4,
        fontStyle: 'italic',
    },
    content: {
        padding: SPACING.m,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: SPACING.m,
        marginBottom: SPACING.m,
        borderRadius: SIZES.radius,
        elevation: 2,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.m,
    },
    dataContainer: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    cardValue: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    cardUnit: {
        fontSize: 16,
        color: COLORS.textSecondary,
        marginLeft: 4,
    },
    historyCard: {
        backgroundColor: COLORS.white,
        padding: SPACING.m,
        borderRadius: SIZES.radius,
        marginTop: SPACING.s,
    },
    historyTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: SPACING.m,
        color: COLORS.text,
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.s,
    },
    historyText: {
        marginLeft: SPACING.s,
        fontSize: 14,
        color: COLORS.text,
    },
});

export default HealthDataScreen;
