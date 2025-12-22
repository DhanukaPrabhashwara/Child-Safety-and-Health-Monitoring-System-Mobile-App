import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { useChildContext } from '../context/ChildContext';
import FormInput from '../components/FormInput';
import { COLORS, SPACING, SIZES } from '../constants/theme';
import { Child } from '../data/mockData';

const AddChildScreen = () => {
    const navigation = useNavigation();
    const { addChild } = useChildContext();

    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [bloodGroup, setBloodGroup] = useState('');

    const handleAdd = () => {
        if (!name || !age || !gender) {
            Alert.alert('Missing Fields', 'Please fill in all required fields.');
            return;
        }

        const newChild: Child = {
            id: Date.now().toString(),
            name,
            age: parseInt(age),
            gender,
            bloodGroup: bloodGroup || 'Unknown',
            photoUrl: `https://ui-avatars.com/api/?name=${name}&background=random&color=fff&size=256`,
            location: {
                latitude: 37.7749, // Hardcoded SF
                longitude: -122.4194,
                address: 'New Added Location, CA',
            },
            locationHistory: [],
            safeZones: [],
            healthData: {
                // status field removed - not part of HealthData type
                heartRate: 80,
                spO2: 98,
                bloodPressure: '110/70',
                temperature: 36.6,
                lastUpdated: 'Just now',
                hydrationLevel: 50,
                stressLevel: 20,
                hydrationHistory: [],
                heartRateHistory: [],
                stressHistory: []
            },
            // Default Audio Threat Data
            audioStatus: 'safe',
            audioEvents: [],
            riskScore: 0,
            riskHistory: [0, 0, 0, 0, 0, 0],
            trustedVoices: [],
            privacyLogs: [],
        };

        addChild(newChild);
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add New Child</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <FormInput
                    label="Full Name"
                    placeholder="e.g. John Doe"
                    value={name}
                    onChangeText={setName}
                />
                <FormInput
                    label="Age"
                    placeholder="e.g. 8"
                    keyboardType="numeric"
                    value={age}
                    onChangeText={setAge}
                />
                <FormInput
                    label="Gender"
                    placeholder="e.g. Male/Female"
                    value={gender}
                    onChangeText={setGender}
                />
                <FormInput
                    label="Blood Group"
                    placeholder="e.g. O+"
                    value={bloodGroup}
                    onChangeText={setBloodGroup}
                />

                {/* <View style={styles.locationPreview}>
                    <Ionicons name="location" size={20} color={COLORS.primary} />
                    <Text style={styles.locationText}>Location will be auto-detected (Simulated)</Text>
                </View> */}

                <TouchableOpacity style={styles.submitButton} onPress={handleAdd} activeOpacity={0.8}>
                    <Text style={styles.submitButtonText}>Add Child</Text>
                </TouchableOpacity>
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
        padding: SPACING.xs,
        marginRight: SPACING.s,
    },
    headerTitle: {
        fontSize: SIZES.title,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    content: {
        padding: SPACING.m,
    },
    locationPreview: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E3F2FD',
        padding: SPACING.m,
        borderRadius: SIZES.radius,
        marginBottom: SPACING.xl,
        marginTop: SPACING.s,
    },
    locationText: {
        marginLeft: SPACING.s,
        color: COLORS.primary,
        fontSize: SIZES.body,
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        padding: SPACING.m,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default AddChildScreen;
