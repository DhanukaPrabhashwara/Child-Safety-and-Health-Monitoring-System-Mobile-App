import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SPACING } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';
import SupabaseService from '../services/SupabaseService';
import { supabase } from '../services/SupabaseService';

type PairWatchRouteProp = RouteProp<RootStackParamList, 'PairWatch'>;

const PairWatchScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<PairWatchRouteProp>();
    const { child } = route.params;

    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Manual Entry State
    const [isManualMode, setIsManualMode] = useState(false);
    const [deviceToken, setDeviceToken] = useState('');
    const [devicePin, setDevicePin] = useState('');

    if (!permission) {
        return <View style={styles.container} />;
    }

    if (!permission.granted) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.center}>
                    <Text style={styles.text}>We need your permission to show the camera</Text>
                    <TouchableOpacity style={styles.button} onPress={requestPermission}>
                        <Text style={styles.buttonText}>Grant Permission</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const performPairing = async (token: string, deviceId: string, pin: string | null) => {
        try {
            // 1. Verify token in device_pairing_tokens
            const { data: tokenData, error: tokenError } = await supabase
                .from('device_pairing_tokens')
                .select('*')
                .or(`token.eq."${token}",device_id.eq."${deviceId}"`)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (tokenError) {
                console.error("Token Error:", tokenError);
                throw new Error("Failed to communicate with pairing server.");
            }
            if (!tokenData) {
                throw new Error("Invalid pairing token or device ID. Please tap 'Regenerate' on the watch and try again.");
            }

            const expiresAt = new Date(tokenData.expires_at).getTime();
            if (Date.now() > expiresAt) {
                throw new Error("Pairing token has expired. Please tap 'Regenerate' on the watch and scan again.");
            }

            if (pin && tokenData.pin && tokenData.pin !== pin) {
                throw new Error("Invalid PIN code.");
            }

            // 2. Validate child ID is a proper UUID before using it
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            const rawChildId = child?.id;
            const childIdToLink = rawChildId && uuidRegex.test(String(rawChildId)) ? String(rawChildId) : null;

            // 3. Update devices table with child_id (null if not a valid UUID yet)
            const { error: updateError } = await supabase
                .from('devices')
                .update({ child_id: childIdToLink })
                .eq('id', tokenData.device_id || deviceId);

            if (updateError) {
                console.error("Update Error:", updateError);
                throw updateError;
            }

            // 4. Delete used token
            await supabase
                .from('device_pairing_tokens')
                .delete()
                .eq('token', tokenData.token);

            Alert.alert("✅ Watch Paired!", "Your watch has been successfully linked.", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);

        } catch (error: any) {
            console.error(error);
            Alert.alert("Pairing Failed", error.message || "An unknown error occurred.", [
                { text: "Try Again", onPress: () => setScanned(false) }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
        setScanned(true);
        setLoading(true);
        console.log("Scanned QR:", data);

        // Expected format: strangerwatchapp://pair?token=$token&device_id=$deviceId&pin=$pin
        try {
            if (!data.startsWith('strangerwatchapp://pair')) {
                throw new Error("Invalid QR Code payload.");
            }

            const urlParams = new URLSearchParams(data.split('?')[1]);
            const token = urlParams.get('token');
            const deviceId = urlParams.get('device_id');
            const pin = urlParams.get('pin');

            if (!token || !deviceId) {
                throw new Error("Missing token or device ID in QR code.");
            }
            
            await performPairing(token, deviceId, pin);

        } catch (error: any) {
            console.error("QR Parse Error:", error);
            Alert.alert("Invalid QR Code", error.message || "Unable to read watch data.", [
                { text: "OK", onPress: () => { setScanned(false); setLoading(false); } }
            ]);
        }
    };

    const handleManualSubmit = () => {
        if (!deviceToken.trim() || !devicePin.trim()) {
            Alert.alert("Error", "Please enter both the Device ID and PIN.");
            return;
        }
        setLoading(true);
        // Using deviceToken as both token and deviceId for manual fallback simplicty, or however the backend expects it.
        // Assuming user enters Device ID in token field for manual. Modifying params to fit.
        performPairing(deviceToken.trim(), deviceToken.trim(), devicePin.trim());
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Pair Watch</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.content}>
                <Text style={styles.instructions}>
                    {isManualMode 
                        ? `Enter the Device ID and PIN shown on ${child.name}'s watch.`
                        : `Point your camera at the QR code displayed on ${child.name}'s watch.`}
                </Text>

                {isManualMode ? (
                    <View style={styles.manualForm}>
                        <TextInput
                            style={styles.input}
                            placeholder="Device ID or Token"
                            value={deviceToken}
                            onChangeText={setDeviceToken}
                            autoCapitalize="none"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="PIN (Optional)"
                            value={devicePin}
                            onChangeText={setDevicePin}
                            keyboardType="numeric"
                        />
                        <TouchableOpacity style={styles.submitButton} onPress={handleManualSubmit}>
                            <Text style={styles.submitButtonText}>Link Watch</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.cameraContainer}>
                        <CameraView 
                            style={StyleSheet.absoluteFillObject}
                            facing="back"
                            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                            barcodeScannerSettings={{
                                barcodeTypes: ["qr"],
                            }}
                        >
                            <View style={styles.overlay}>
                                <View style={styles.scanArea} />
                            </View>
                        </CameraView>
                    </View>
                )}

                {loading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loadingText}>Pairing...</Text>
                    </View>
                )}
                
                {scanned && !loading && !isManualMode && (
                    <TouchableOpacity style={styles.rescanButton} onPress={() => setScanned(false)}>
                        <Text style={styles.rescanText}>Tap to Scan Again</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity 
                    style={styles.toggleModeButton} 
                    onPress={() => setIsManualMode(!isManualMode)}
                >
                    <Text style={styles.toggleModeText}>
                        {isManualMode ? "Use QR Scanner Instead" : "Enter PIN Manually"}
                    </Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.l,
    },
    text: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: SPACING.m,
        color: COLORS.textSecondary,
    },
    button: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.l,
        paddingVertical: SPACING.m,
        borderRadius: SIZES.radius,
    },
    buttonText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.m,
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
        alignItems: 'center',
        paddingTop: SPACING.xl,
    },
    instructions: {
        fontSize: 16,
        color: COLORS.text,
        textAlign: 'center',
        marginHorizontal: SPACING.xl,
        marginBottom: SPACING.xl,
    },
    cameraContainer: {
        width: 300,
        height: 300,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanArea: {
        width: 200,
        height: 200,
        borderWidth: 2,
        borderColor: COLORS.white,
        backgroundColor: 'transparent',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    loadingText: {
        marginTop: SPACING.s,
        fontSize: 16,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    rescanButton: {
        marginTop: SPACING.xl,
        padding: SPACING.m,
        backgroundColor: COLORS.cardBg,
        borderRadius: SIZES.radius,
        elevation: 2,
    },
    rescanText: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 16,
    },
    manualForm: {
        width: '100%',
        paddingHorizontal: SPACING.xl,
    },
    input: {
        backgroundColor: COLORS.white,
        padding: SPACING.m,
        borderRadius: SIZES.radius,
        marginBottom: SPACING.m,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        fontSize: 16,
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        padding: SPACING.m,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        marginTop: SPACING.s,
    },
    submitButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
    toggleModeButton: {
        marginTop: SPACING.xl,
        padding: SPACING.m,
    },
    toggleModeText: {
        color: COLORS.textSecondary,
        fontSize: 16,
        textDecorationLine: 'underline',
    }
});

export default PairWatchScreen;
