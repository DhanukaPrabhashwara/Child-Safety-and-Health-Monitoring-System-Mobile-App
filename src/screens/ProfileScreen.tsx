import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SPACING } from '../constants/theme';
import { supabase } from '../services/SupabaseService';

export default function ProfileScreen() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [parentEmail, setParentEmail] = useState<string | null>(null);
    const [children, setChildren] = useState<any[]>([]);

    useEffect(() => {
        loadProfileData();
    }, []);

    const loadProfileData = async () => {
        setLoading(true);
        try {
            // Get current session user
            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
            
            if (sessionError) {
                console.error("Session Error:", sessionError);
                return;
            }

            const user = sessionData?.session?.user;
            
            // Allow testing fallback if no real auth yet (auth mocked in LoginScreen)
            // But we try to fetch from Supabase if a user exists
            if (user) {
                setParentEmail(user.email ?? "Unknown Email");

                // Fetch children linked to this parent
                const { data: childrenData, error: childrenError } = await supabase
                    .from('children')
                    .select('*, devices(*)')
                    .eq('parent_id', user.id);

                if (!childrenError && childrenData) {
                    setChildren(childrenData);
                }
            } else {
                setParentEmail("admin@local.test (Local Mode)");
                // In local test mode without a Supabase auth token, we could either show empty or fetch all for demo
                const { data: allChildren } = await supabase.from('children').select('*, devices(*)').limit(10);
                if (allChildren) {
                    setChildren(allChildren);
                }
            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Account Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.content}>
                    
                    {/* Parent Info */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="person-circle" size={40} color={COLORS.primary} />
                            <View style={styles.cardHeaderText}>
                                <Text style={styles.cardTitle}>Parent Account</Text>
                                <Text style={styles.cardSubtitle}>{parentEmail}</Text>
                            </View>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>Registered Children</Text>

                    {children.length === 0 ? (
                        <Text style={styles.emptyText}>No children registered to this account yet.</Text>
                    ) : (
                        children.map((child: any) => (
                            <View key={child.id} style={styles.childCard}>
                                <View style={styles.childHeaderRow}>
                                    <Ionicons name="happy-outline" size={24} color={COLORS.text} style={{ marginRight: 8 }} />
                                    <Text style={styles.childName}>{child.name}</Text>
                                </View>
                                
                                <View style={styles.divider} />
                                
                                <Text style={styles.sectionSubtitle}>Connected Devices</Text>
                                {child.devices && child.devices.length > 0 ? (
                                    child.devices.map((device: any) => (
                                        <View key={device.id} style={styles.deviceRow}>
                                            <Ionicons name="watch-outline" size={16} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
                                            <Text style={styles.deviceText}>ID: {device.id}</Text>
                                            <Text style={styles.deviceStatus}>
                                                {device.battery_level ? `${device.battery_level}% 🔋` : ''}
                                            </Text>
                                        </View>
                                    ))
                                ) : (
                                    <Text style={styles.deviceText}>No watches linked yet.</Text>
                                )}
                            </View>
                        ))
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    center: {
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center'
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
    content: {
        padding: SPACING.l,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: SPACING.l,
        marginBottom: SPACING.xl,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardHeaderText: {
        marginLeft: SPACING.m,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    cardSubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.m,
    },
    emptyText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: SPACING.l,
    },
    childCard: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: SPACING.m,
        marginBottom: SPACING.m,
        elevation: 1,
    },
    childHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    childName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: SPACING.m,
    },
    sectionSubtitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        marginBottom: SPACING.s,
    },
    deviceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
        padding: SPACING.s,
        borderRadius: 8,
        marginBottom: 6,
    },
    deviceText: {
        flex: 1,
        fontSize: 14,
        color: COLORS.text,
        fontFamily: 'monospace',
    },
    deviceStatus: {
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: 'bold',
    }
});
