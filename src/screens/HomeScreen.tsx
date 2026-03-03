import React, { useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, ImageBackground, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import { useChildContext } from '../context/ChildContext';
import ChildCard from '../components/ChildCard';
import { COLORS, SPACING, SIZES } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const { children, loading } = useChildContext();

    const handleAddChild = () => {
        navigation.navigate('AddChild');
    };

    const handleChildPress = (child: any) => {
        navigation.navigate('ChildDashboard', { child });
    };

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Logout", onPress: () => navigation.replace('Login') }
            ]
        );
    };

    const alerts = children.reduce((acc: string[], child) => {
        if (child.healthData.hydrationLevel < 40) acc.push(`${child.name} is dehydrated.`);
        if (child.healthData.stressLevel > 70) acc.push(`${child.name} has high stress levels.`);
        if (child.location.status === 'Unknown') acc.push(`Unable to locate ${child.name}.`);
        return acc;
    }, []);

    return (
        <ImageBackground
            source={require('../assets/home_bg_dark.png')}
            style={styles.container}
        // Removed opacity/tint hack as the image itself is dark
        >
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>Children</Text>
                        <Text style={styles.headerSubtitle}>Monitor their safety & health</Text>
                    </View>
                    <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                        <Ionicons name="log-out-outline" size={28} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                         <ActivityIndicator size="large" color={COLORS.primary} />
                    </View>
                ) : (
                    <>
                        {alerts.length > 0 && (
                            <View style={styles.alertContainer}>
                                <View style={styles.alertHeader}>
                                    <Ionicons name="notifications" size={20} color={COLORS.white} />
                                    <Text style={styles.alertHeaderText}>Attention Needed ({alerts.length})</Text>
                                </View>
                                {alerts.map((alert, index) => (
                                    <Text key={index} style={styles.alertText}>• {alert}</Text>
                                ))}
                            </View>
                        )}

                        <FlatList
                            data={children}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <ChildCard child={item} onPress={() => handleChildPress(item)} />
                            )}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyText}>No children added yet.</Text>
                                    <Text style={styles.emptySubtext}>Tap the + button to add one.</Text>
                                </View>
                            }
                        />
                    </>
                )}

                <TouchableOpacity style={styles.fab} onPress={handleAddChild} activeOpacity={0.8}>
                    <Ionicons name="add" size={30} color={COLORS.white} />
                </TouchableOpacity>

            </SafeAreaView>

        </ImageBackground >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: COLORS.background, // Removed for ImageBackground
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)', // Dark overlay
    },
    safeArea: {
        flex: 1,
    },
    header: {
        padding: SPACING.m,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.8)', // Semi-transparent for bg
        marginTop: StatusBar.currentHeight || 0,
        borderRadius: SIZES.radius,
        marginHorizontal: SPACING.s,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    headerSubtitle: {
        fontSize: SIZES.body,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    logoutButton: {
        padding: SPACING.s,
    },
    listContent: {
        padding: SPACING.m,
        paddingBottom: 100, // Space for FAB
    },
    fab: {
        position: 'absolute',
        bottom: SPACING.xl,
        right: SPACING.xl,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 10,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
        padding: 20,
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: SIZES.radius,
    },
    emptyText: {
        fontSize: SIZES.subtitle,
        color: COLORS.text,
        fontWeight: '600',
    },
    emptySubtext: {
        fontSize: SIZES.body,
        color: COLORS.textSecondary,
        marginTop: 8,
    },
    alertContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        margin: SPACING.m,
        marginBottom: 0,
        borderRadius: SIZES.radius,
        padding: SPACING.m,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.danger,
    },
    alertHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        backgroundColor: COLORS.danger,
        padding: 6,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    alertHeaderText: {
        color: COLORS.white,
        fontWeight: 'bold',
        marginLeft: 6,
        fontSize: 12,
    },
    alertText: {
        fontSize: 14,
        color: COLORS.text,
        marginBottom: 4,
        marginLeft: 8,
    },
});

export default HomeScreen;
