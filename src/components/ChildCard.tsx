import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Child } from '../data/mockData';
import { COLORS, SIZES, SPACING } from '../constants/theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface ChildCardProps {
    child: Child;
    onPress: () => void;
}

const ChildCard: React.FC<ChildCardProps> = ({ child, onPress }) => {
    const isHydrationLow = child.healthData.hydrationLevel < 40;
    const isStressHigh = child.healthData.stressLevel > 70;
    const isLocationUnknown = child.location.status === 'Unknown';
    const isUnknownVoice = child.audioStatus === 'unknown';
    const isDistress = child.audioStatus === 'distress';
    const hasCloudSync = child.trustedVoices?.some(v => v.name === 'Watch (Cloud)');

    const hasAlert = isHydrationLow || isStressHigh || isLocationUnknown || isUnknownVoice || isDistress;

    // Determine Shield Icon
    let shieldColor = COLORS.success;
    let shieldIcon = 'shield-check';
    
    if (isUnknownVoice) {
        shieldColor = '#FFB74D'; // Orange
        shieldIcon = 'shield-alert';
    } else if (isDistress) {
        shieldColor = COLORS.danger;
        shieldIcon = 'shield-alert-outline'; // Or pulsating effect
    }

    return (
        <TouchableOpacity
            style={[styles.card, hasAlert && styles.alertBorder]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <Image source={{ uri: child.photoUrl }} style={styles.image} />
            
            {/* Privacy Shield Icon (Top Right) */}
            <View style={styles.shieldContainer}>
                <MaterialCommunityIcons name={shieldIcon as any} size={24} color={shieldColor} />
            </View>

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
                        <View style={[styles.badge, { backgroundColor: '#FBC02D' }]}> 
                            <Ionicons name="alert-circle" size={12} color={COLORS.white} />
                            <Text style={styles.badgeText}>High Stress</Text>
                        </View>
                    )}
                    {isUnknownVoice && (
                        <View style={[styles.badge, { backgroundColor: '#FF9800' }]}>
                            <MaterialCommunityIcons name="microphone-off" size={12} color={COLORS.white} />
                            <Text style={styles.badgeText}>Unknown Voice</Text>
                        </View>
                    )}
                    {isDistress && (
                        <View style={[styles.badge, { backgroundColor: COLORS.danger }]}>
                            <MaterialCommunityIcons name="waveform" size={12} color={COLORS.white} />
                            <Text style={styles.badgeText}>Distress Detected</Text>
                        </View>
                    )}
                    {hasCloudSync && !isDistress && !isUnknownVoice && (
                        <View style={[styles.badge, { backgroundColor: COLORS.success }]}>
                            <Ionicons name="cloud-done" size={12} color={COLORS.white} />
                            <Text style={styles.badgeText}>Watch Synced</Text>
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
        borderRadius: 16, // Requested borderRadius: 16
        padding: SPACING.m,
        marginBottom: SPACING.m,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 4 }, // elevation 3 approx
        shadowOpacity: 0.1, // Requested shadowOpacity: 0.1
        shadowRadius: 8,
        elevation: 3, // Requested elevation: 3
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: SPACING.m,
        backgroundColor: COLORS.background,
    },
    shieldContainer: {
        position: 'absolute',
        top: SPACING.m,
        right: SPACING.m,
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingRight: 30, // Make room for shield
    },
    name: {
        fontSize: 18, // Bold headings
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.xs,
        fontFamily: 'System', // San Francisco/Roboto default
    },
    details: {
        fontSize: 14,
        color: COLORS.textSecondary, // Grey subtext
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
        backgroundColor: '#FFF5F5', // Very Light Red tint for alerts
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
        marginTop: 8,
        flexWrap: 'wrap',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.danger,
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginRight: 6,
        marginBottom: 4,
    },
    badgeText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: 'bold',
        marginLeft: 4,
    },
});

export default ChildCard;
