import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Child } from '../data/mockData';
import { COLORS, SIZES, SPACING } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface ChildCardProps {
    child: Child;
    onPress: () => void;
}

const ChildCard: React.FC<ChildCardProps> = ({ child, onPress }) => {
    const isHydrationLow = child.healthData.hydrationLevel < 40;
    const isStressHigh = child.healthData.stressLevel > 70;
    const isLocationUnknown = child.location.status === 'Unknown';

    const hasAlert = isHydrationLow || isStressHigh || isLocationUnknown;

    return (
        <TouchableOpacity
            style={[styles.card, hasAlert && styles.alertBorder]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <Image source={{ uri: child.photoUrl }} style={styles.image} />
            <View style={styles.infoContainer}>
                <View style={styles.nameRow}>
                    <Text style={styles.name}>{child.name}</Text>
                    {hasAlert && <Ionicons name="warning" size={20} color={COLORS.danger} style={{ marginLeft: 6 }} />}
                </View>
                <Text style={styles.details}>{child.age} years old • {child.gender}</Text>

                <View style={styles.statusRow}>
                    <View style={styles.locationContainer}>
                        <Ionicons name="location-outline" size={14} color={isLocationUnknown ? COLORS.danger : COLORS.textSecondary} />
                        <Text style={[styles.locationText, isLocationUnknown && { color: COLORS.danger }]}>
                            {child.location.address}
                        </Text>
                    </View>
                </View>

                {/* Status Badges */}
                <View style={styles.badgeRow}>
                    {isHydrationLow && (
                        <View style={styles.badge}>
                            <Ionicons name="water" size={12} color={COLORS.white} />
                            <Text style={styles.badgeText}>Dehydration Risk</Text>
                        </View>
                    )}
                    {isStressHigh && (
                        <View style={[styles.badge, { backgroundColor: COLORS.warning }]}>
                            <Ionicons name="alert-circle" size={12} color={COLORS.white} />
                            <Text style={styles.badgeText}>High Stress</Text>
                        </View>
                    )}
                </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.cardBg,
        borderRadius: SIZES.radius,
        padding: SPACING.m,
        marginBottom: SPACING.m,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: SPACING.m,
        backgroundColor: COLORS.background, // Fallback
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    name: {
        fontSize: SIZES.subtitle,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    details: {
        fontSize: SIZES.body,
        color: COLORS.textSecondary,
        marginBottom: SPACING.xs,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginLeft: 4,
    },
    alertBorder: {
        borderColor: COLORS.danger,
        borderWidth: 1,
        backgroundColor: '#FFEBEE', // Light Red
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusRow: {
        marginTop: 4,
    },
    badgeRow: {
        flexDirection: 'row',
        marginTop: 6,
        flexWrap: 'wrap',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.danger,
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginRight: 6,
        marginBottom: 2,
    },
    badgeText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: 'bold',
        marginLeft: 2,
    },
});

export default ChildCard;
