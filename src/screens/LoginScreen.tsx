import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ImageBackground, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SPACING, SIZES } from '../constants/theme';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../services/SupabaseService';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
    const navigation = useNavigation<LoginScreenNavigationProp>();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter your email and password.');
            return;
        }
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
            if (error) throw error;
            if (data.session) {
                navigation.replace('Home');
            }
        } catch (error: any) {
            Alert.alert('Login Failed', error.message || 'Invalid email or password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ImageBackground source={require('../assets/login_bg.png')} style={styles.container}>
            <StatusBar style="dark" />
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Sign in to continue monitoring</Text>
                </View>

                <View style={styles.form}>
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
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity style={[styles.button, loading && { opacity: 0.7 }]} onPress={handleLogin} disabled={loading}>
                        {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.buttonText}>Log In</Text>}
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={styles.link}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: COLORS.background, // Removed for background image
        justifyContent: 'center',
    },
    content: {
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
        backgroundColor: 'rgba(255, 255, 255, 0.9)', // Slightly transparent
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

export default LoginScreen;
