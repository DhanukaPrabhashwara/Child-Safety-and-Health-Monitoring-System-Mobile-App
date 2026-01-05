import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Linking, Platform, SafeAreaView, Dimensions } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

import { ChildTabParamList } from '../navigation/types';
import { COLORS, SPACING, SIZES } from '../constants/theme';
import { Child } from '../data/mockData';
import CustomAlert, { AlertType } from '../components/CustomAlert';

type ChildProfileScreenRouteProp = RouteProp<ChildTabParamList, 'Dashboard'>;
type ChildProfileScreenNavigationProp = BottomTabNavigationProp<ChildTabParamList, 'Dashboard'>;

const { width } = Dimensions.get('window');

const ChildProfileScreen = () => {
    const route = useRoute<ChildProfileScreenRouteProp>();
    const navigation = useNavigation<ChildProfileScreenNavigationProp>();
    const { child } = route.params;

    const [fabExpanded, setFabExpanded] = useState(false);

    const [alertConfig, setAlertConfig] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'info' as AlertType,
        buttons: [{ text: 'OK' }] as any[]
    });

    const showAlert = (title: string, message: string, type: AlertType = 'info', buttons = [{ text: 'OK' }]) => {
        setAlertConfig({ visible: true, title, message, type, buttons });
    };

    const hideAlert = () => {
        setAlertConfig(prev => ({ ...prev, visible: false }));
    };

    const isDistress = child.audioStatus === 'distress';
    const isUnknown = child.audioStatus === 'unknown';
    const threatColor = isDistress ? '#FFEBEE' : isUnknown ? '#FFF3E0' : '#FFFFFF';
    const threatBorder = isDistress ? COLORS.danger : isUnknown ? '#FFB74D' : 'transparent';

    const openMap = () => {
        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const latLng = `${child.location.latitude},${child.location.longitude}`;
        const label = child.name;
        const url = Platform.select({
            ios: `${scheme}${label}@${latLng}`,
            android: `${scheme}${latLng}(${label})`
        });

        if (url) {
            Linking.openURL(url);
        }
    };

    const handleCallWatch = () => {
        navigation.navigate('CallWatch' as any, { child });
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
            <ScrollView bounces={false} contentContainerStyle={styles.scrollContent}>
                
                {/* Header: Name, Avatar, Call Button */}
                <View style={styles.header}>
                    <View style={styles.headerRow}>
                        <View style={styles.profileInfo}>
                            <Image source={{ uri: child.photoUrl }} style={styles.avatar} />
                            <View>
                                <Text style={styles.name}>{child.name}</Text>
                                <Text style={styles.subtext}>{child.age} Years • {child.gender}</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.callButton} onPress={handleCallWatch}>
                            <Ionicons name="call" size={20} color={COLORS.white} style={{ marginRight: 6 }} />
                            <Text style={styles.callButtonText}>Call Watch</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Widget 1: Audio Threat Monitor */}
                <TouchableOpacity 
                    style={[styles.threatCard, { backgroundColor: threatColor, borderColor: threatBorder, borderWidth: 1 }]}
                    onPress={() => navigation.navigate('AudioDetail' as any, { child })}
                    activeOpacity={0.9}
                >
                    <View style={styles.cardHeader}>
                        <View style={styles.row}>
                            <View style={[styles.shieldIcon, { backgroundColor: isDistress ? COLORS.danger : isUnknown ? '#FF9800' : COLORS.success }]}>
                                <MaterialCommunityIcons name="shield-check" size={16} color={COLORS.white} />
                            </View>
                            <Text style={[styles.cardTitle, isDistress && { color: COLORS.danger }]}>Audio Threat Monitor</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                    </View>

                    {/* Timeline Visualization */}
                    <View style={styles.timelineContainer}>
                        <View style={styles.timelineLine} />
                        {child.audioEvents.slice(0, 3).map((event, index) => (
                            <View key={index} style={styles.timelineItem}>
                                <View style={[styles.timelineDot, { backgroundColor: event.type === 'danger' ? COLORS.danger : event.type === 'warning' ? '#FF9800' : COLORS.success }]} />
                                <Text style={styles.timelineTime}>{event.time}</Text>
                                <Text style={styles.timelineLabel}>{event.label}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Context Indicator */}
                    <View style={styles.contextBadge}>
                        <Ionicons name="home" size={12} color={COLORS.primary} />
                        <Text style={styles.contextText}> Home Zone: Sensitivity Low</Text>
                    </View>
                </TouchableOpacity>

                {/* Widgets 2 & 3: Side-by-Side */}
                <View style={styles.rowWidgets}>
                    {/* Heart Rate */}
                    <TouchableOpacity style={styles.halfCard} onPress={() => navigation.navigate('Heart', { child })}>
                        <View style={styles.rowBetween}>
                            <Text style={styles.cardTitle}>Heart Rate</Text>
                            <Ionicons name="heart" size={20} color={COLORS.danger} style={{ marginTop: -4 }} /> 
                        </View>
                        <View style={styles.hydrationContent}>
                            {/* Mini Graph Representation aligned like Hydration icon */}
                            <Image 
                                source={{ uri: 'https://img.icons8.com/color/96/graph.png' }} 
                                style={styles.graphIcon}
                                resizeMode="contain"
                            />
                            <Text style={styles.metricValue}>{child.healthData.heartRate} <Text style={styles.unit}>BPM</Text></Text>
                        </View>
                        <Text style={styles.statusText}>Normal</Text>
                    </TouchableOpacity>

                    {/* Hydration */}
                    <TouchableOpacity style={styles.halfCard} onPress={() => navigation.navigate('Hydration', { child })}>
                        <View style={styles.rowBetween}>
                            <Text style={styles.cardTitle}>Hydration</Text>
                            <Ionicons name="water" size={20} color={COLORS.primary} />
                        </View>
                        <View style={styles.hydrationContent}>
                            <Ionicons name="water" size={40} color={COLORS.primary} />
                            <Text style={styles.metricValue}>{child.healthData.hydrationLevel}%</Text>
                        </View>
                        <Text style={styles.statusText}>Good Level</Text>
                    </TouchableOpacity>
                </View>

                {/* Location Widget */}
                <View style={styles.fullCard}>
                    <Text style={styles.cardTitle}>Current Location</Text>
                    <TouchableOpacity style={styles.mapContainer} onPress={openMap}>
                        <View style={styles.mapPlaceholder}>
                            <Ionicons name="map" size={48} color={COLORS.primary} opacity={0.3} />
                            <View style={styles.pinContainer}>
                                <Ionicons name="location" size={32} color={COLORS.danger} />
                            </View>
                        </View>
                        <View style={styles.locationFooter}>
                            <Text style={styles.address}>{child.location.address || 'Unknown Location'}</Text>
                            <Text style={styles.coords}>{child.location.latitude.toFixed(4)}, {child.location.longitude.toFixed(4)}</Text>
                        </View>
                    </TouchableOpacity>
                </View>

            </ScrollView>

            {/* Expandable FAB */}
            {fabExpanded && (
                <View style={styles.fabActions}>
                    <TouchableOpacity style={styles.fabActionItem} onPress={() => navigation.navigate('EnrollVoice' as any, { child })}>
                        <Text style={styles.fabActionText}>Add Trusted Voice</Text>
                        <View style={styles.fabActionBtn}>
                            <Ionicons name="mic" size={20} color={COLORS.white} />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.fabActionItem} onPress={() => showAlert('Add Zone', 'Map feature coming soon.', 'info')}>
                        <Text style={styles.fabActionText}>Add Safe Zone</Text>
                        <View style={styles.fabActionBtn}>
                            <Ionicons name="map" size={20} color={COLORS.white} />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.fabActionItem} onPress={() => showAlert('Log Health', 'Manual entry form.', 'info')}>
                        <Text style={styles.fabActionText}>Log Health Data</Text>
                        <View style={styles.fabActionBtn}>
                            <Ionicons name="heart" size={20} color={COLORS.white} />
                        </View>
                    </TouchableOpacity>
                </View>
            )}

            <TouchableOpacity 
                style={[styles.fab, fabExpanded && styles.fabExpanded]} 
                onPress={() => setFabExpanded(!fabExpanded)}
                activeOpacity={0.9}
            >
                <Ionicons name={fabExpanded ? "close" : "add"} size={32} color={COLORS.white} />
            </TouchableOpacity>

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        padding: SPACING.m,
        paddingBottom: 100,
    },
    header: {
        marginBottom: SPACING.l,
        paddingTop: SPACING.s,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: SPACING.m,
        borderRadius: 24, // Top rounded container look
        elevation: 2,
    },
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: SPACING.m,
        backgroundColor: '#EEE',
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    subtext: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    callButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.m,
        paddingVertical: 10,
        borderRadius: 20,
    },
    callButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 14,
    },
    
    // Widgets
    threatCard: {
        borderRadius: 16,
        padding: SPACING.m,
        marginBottom: SPACING.m,
        elevation: 3,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.l,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    shieldIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    timelineContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        position: 'relative',
        marginBottom: SPACING.l,
        paddingHorizontal: SPACING.s,
    },
    timelineLine: {
        position: 'absolute',
        top: 6,
        left: 20,
        right: 20,
        height: 2,
        backgroundColor: '#E0E0E0',
        zIndex: -1,
    },
    timelineItem: {
        alignItems: 'center',
        width: '30%',
    },
    timelineDot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    timelineTime: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 2,
    },
    timelineLabel: {
        fontSize: 10,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    contextBadge: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    contextText: {
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: '600',
    },

    // Side by Side
    rowWidgets: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.m,
    },
    halfCard: {
        width: '48%',
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: SPACING.m,
        elevation: 3,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.m,
    },
    metricValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    unit: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: 'normal',
    },
    graphIcon: {
        width: 40,
        height: 40,
        opacity: 0.8,
    },
    hydrationContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: SPACING.s,
        gap: 10,
    },
    statusText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 4,
    },

    // Location
    fullCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: SPACING.m,
        marginBottom: SPACING.m,
        elevation: 3,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    mapContainer: {
        marginTop: SPACING.m,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#F5F7FA',
        borderWidth: 1,
        borderColor: '#EEE',
    },
    mapPlaceholder: {
        height: 120,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E1F5FE',
    },
    pinContainer: {
        position: 'absolute',
        top: 30,
    },
    locationFooter: {
        padding: SPACING.m,
        backgroundColor: COLORS.white,
    },
    address: {
        fontWeight: 'bold',
        color: COLORS.text,
        fontSize: 14,
    },
    coords: {
        color: COLORS.textSecondary,
        fontSize: 12,
        marginTop: 2,
    },

    // FAB
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    fabExpanded: {
        backgroundColor: COLORS.text, // Darker when open
    },
    fabActions: {
        position: 'absolute',
        bottom: 100,
        right: 30,
        alignItems: 'flex-end',
    },
    fabActionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    fabActionText: {
        backgroundColor: COLORS.white,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginRight: 12,
        fontWeight: '600',
        elevation: 2,
    },
    fabActionBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
    },
});

export default ChildProfileScreen;
