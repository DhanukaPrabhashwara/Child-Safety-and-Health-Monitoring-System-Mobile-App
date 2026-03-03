import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ImageBackground, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SPACING, SIZES } from '../constants/theme';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../services/SupabaseService';

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;

const RegisterScreen = () => {
    const navigation = useNavigation<RegisterScreenNavigationProp>();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email: email.trim(),
                password,
                options: { data: { full_name: name } }
            });
            if (error) throw error;
            Alert.alert('Account Created!', 'You can now log in with your credentials.', [
                { text: 'Log In', onPress: () => navigation.replace('Login') }
            ]);
        } catch (error: any) {
            Alert.alert('Registration Failed', error.message || 'Could not create account.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ImageBackground source={require('../assets/home_bg.png')} style={styles.container}>
            <StatusBar style="dark" />
            <View style={styles.overlay}>
                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Sign up to start monitoring</Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Full Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your full name"
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="words"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your email"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Create a password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Confirm Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                            />
                        </View>

                        <TouchableOpacity style={[styles.button, loading && { opacity: 0.7 }]} onPress={handleRegister} disabled={loading}>
                            {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.buttonText}>Sign Up</Text>}
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.link}>Log In</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: COLORS.background, 
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.4)', // Slight overlay to ensure text readability on bg
    },
    content: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: SPACING.l,
    },
    header: {
        marginBottom: SPACING.xl,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: SPACING.s,
    },
    subtitle: {
        fontSize: SIZES.body,
        color: COLORS.textSecondary,
    },
    form: {
        width: '100%',
    },
    inputContainer: {
        marginBottom: SPACING.m,
    },
    label: {
        fontSize: 14,
        color: COLORS.text,
        marginBottom: SPACING.s,
        fontWeight: '600',
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: SPACING.m,
        borderRadius: SIZES.radius,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        fontSize: 16,
    },
    button: {
        backgroundColor: COLORS.primary,
        padding: SPACING.m,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        marginTop: SPACING.m,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: SPACING.xl,
        marginBottom: SPACING.m,
    },
    footerText: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    link: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 14,
    },
});

export default RegisterScreen;
