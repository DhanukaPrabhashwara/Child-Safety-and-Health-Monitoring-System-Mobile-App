import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SPACING } from '../constants/theme';
import TrustModelService from '../services/TrustModelService';
import { Alert } from 'react-native';

import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';

const SettingsScreen = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const [notifications, setNotifications] = React.useState(true);
    const [biometrics, setBiometrics] = React.useState(false);

    const handleClearEnrollment = async () => {
        Alert.alert(
            'Clear Voice Data',
            'Are you sure you want to delete all enrolled voice samples? This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Delete', 
                    style: 'destructive',
                    onPress: async () => {
                        await TrustModelService.clearEnrollment();
                        Alert.alert('Cleared', 'All voice data has been removed.');
                    }
                }
            ]
        );
    };

    const SettingItem = ({ icon, title, color = COLORS.text, onPress, hasSwitch, switchValue, onSwitchChange }: any) => (
        <TouchableOpacity style={styles.item} onPress={onPress} disabled={hasSwitch}>
            <View style={styles.itemLeft}>
                <Ionicons name={icon} size={24} color={color} style={styles.itemIcon} />
                <Text style={[styles.itemTitle, { color }]}>{title}</Text>
            </View>
            {hasSwitch ? (
                <Switch 
                    value={switchValue} 
                    onValueChange={onSwitchChange}
                    trackColor={{ false: '#767577', true: COLORS.primary }}
                />
            ) : (
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content}>
                <Text style={styles.sectionHeader}>Account</Text>
                <View style={styles.section}>
                    <SettingItem icon="person-outline" title="Profile" onPress={() => navigation.navigate('Profile')} />
                    <SettingItem icon="notifications-outline" title="Notifications" hasSwitch switchValue={notifications} onSwitchChange={setNotifications} />
                    <SettingItem icon="finger-print-outline" title="Biometric Login" hasSwitch switchValue={biometrics} onSwitchChange={setBiometrics} />
                </View>

                <Text style={styles.sectionHeader}>Security & AI</Text>
                <View style={styles.section}>
                    <SettingItem 
                        icon="flask-outline" 
                        title="Simulation Studio" 
                        onPress={() => navigation.navigate('Simulation')} 
                    />
                    <SettingItem 
                        icon="shield-checkmark-outline" 
                        title="Manage Trusted Voices" 
                        onPress={() => navigation.navigate('ManageTrustedVoices')} 
                    />
                    <SettingItem 
                        icon="trash-outline" 
                        title="Clear Voice Data" 
                        color={COLORS.danger} 
                        onPress={handleClearEnrollment} 
                    />
                </View>

                <Text style={styles.sectionHeader}>About</Text>
                <View style={styles.section}>
                    <SettingItem icon="information-circle-outline" title="About App" onPress={() => {}} />
                    <SettingItem icon="document-text-outline" title="Privacy Policy" onPress={() => {}} />
                    <SettingItem icon="help-circle-outline" title="Help & Support" onPress={() => {}} />
                </View>
                
                <TouchableOpacity style={styles.logoutButton}>
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>
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
    content: {
        flex: 1,
        padding: SPACING.l,
    },
    sectionHeader: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.textSecondary,
        marginBottom: SPACING.s,
        marginTop: SPACING.m,
        marginLeft: SPACING.s,
    },
    section: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: SPACING.s,
        marginBottom: SPACING.m,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.m,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemIcon: {
        marginRight: SPACING.m,
    },
    itemTitle: {
        fontSize: 16,
        color: COLORS.text,
    },
    logoutButton: {
        marginTop: SPACING.xl,
        marginBottom: SPACING.xl,
        backgroundColor: '#FFE5E5',
        padding: SPACING.m,
        borderRadius: SIZES.radius,
        alignItems: 'center',
    },
    logoutText: {
        color: COLORS.danger,
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default SettingsScreen;
