import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Linking, Platform, SafeAreaView, Dimensions } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

import { ChildTabParamList } from '../navigation/types';
import { COLORS, SPACING, SIZES } from '../constants/theme';

type ChildProfileScreenRouteProp = RouteProp<ChildTabParamList, 'Dashboard'>;
type ChildProfileScreenNavigationProp = BottomTabNavigationProp<ChildTabParamList, 'Dashboard'>;

const { width } = Dimensions.get('window');

const ChildProfileScreen = () => {
    const route = useRoute<ChildProfileScreenRouteProp>();
    const navigation = useNavigation<ChildProfileScreenNavigationProp>();
    const { child } = route.params;

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

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView bounces={false}>
                <View style={styles.header}>
                    {/* Back Button Removed for Tab View */}
                </View>
                <View style={styles.profileHeader}>
                    <Image source={{ uri: child.photoUrl }} style={styles.avatar} />
                    <Text style={styles.name}>{child.name}</Text>
                    <Text style={styles.infoText}>{child.age} Years • {child.gender} • {child.bloodGroup}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Current Location</Text>
                    <TouchableOpacity style={styles.locationCard} onPress={openMap}>
                        <View style={styles.mapPreview}>
                            {/* Decorative Map Placeholder */}
                            <Ionicons name="map" size={50} color={COLORS.primary} style={{ opacity: 0.2 }} />
                            <View style={styles.locationPin}>
                                <Ionicons name="location" size={30} color={COLORS.danger} />
                            </View>
                        </View>
                        <View style={styles.locationInfo}>
                            <Text style={styles.address}>{child.location.address}</Text>
                            <Text style={styles.coordinates}>{child.location.latitude.toFixed(4)}, {child.location.longitude.toFixed(4)}</Text>
                            <Text style={styles.tapToView}>Tap to view on Maps</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Health & Activity</Text>
                    <TouchableOpacity
                        style={styles.healthButton}
                        onPress={() => navigation.navigate('Health', { child })}
                        activeOpacity={0.8}
                    >
                        <View style={styles.healthMetadata}>
                            <MaterialIcons name="health-and-safety" size={32} color={COLORS.white} />
                            <View style={{ marginLeft: SPACING.m }}>
                                <Text style={styles.healthButtonTitle}>View Health Data</Text>
                                <Text style={styles.healthButtonSubtitle}>Heart rate, SpO2, and more</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color={COLORS.white} />
                    </TouchableOpacity>
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
        height: 150,
        backgroundColor: COLORS.primary,
        justifyContent: 'flex-start',
        paddingTop: SPACING.xl,
        paddingLeft: SPACING.m,
    },
    backButton: {
        padding: SPACING.s,
    },
    profileHeader: {
        alignItems: 'center',
        marginTop: -50,
        marginBottom: SPACING.l,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: COLORS.white,
        backgroundColor: COLORS.background,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
        marginTop: SPACING.s,
    },
    infoText: {
        fontSize: SIZES.body,
        color: COLORS.textSecondary,
        marginTop: SPACING.xs,
    },
    section: {
        padding: SPACING.m,
    },
    sectionTitle: {
        fontSize: SIZES.title,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.s,
        marginLeft: SPACING.s,
    },
    locationCard: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    mapPreview: {
        height: 120,
        backgroundColor: '#E0F7FA', // Light blue map-like color
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    locationPin: {
        position: 'absolute',
        top: 40,
    },
    locationInfo: {
        padding: SPACING.m,
    },
    address: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
    },
    coordinates: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    tapToView: {
        marginTop: SPACING.s,
        color: COLORS.primary,
        fontWeight: '600',
        fontSize: 12,
    },
    healthButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.success, // Friendly green for health
        padding: SPACING.m,
        borderRadius: SIZES.radius,
        elevation: 3,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    healthMetadata: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    healthButtonTitle: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    healthButtonSubtitle: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 12,
    },
});

export default ChildProfileScreen;
