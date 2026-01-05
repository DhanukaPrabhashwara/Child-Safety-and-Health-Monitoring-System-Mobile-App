import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SPACING } from '../constants/theme';
import TrustModelService from '../services/TrustModelService';
import CustomAlert, { AlertType, AlertButton } from '../components/CustomAlert';

interface EnrolledVoice {
    name: string;
    sampleCount: number;
    audioPaths: string[];
}

const ManageTrustedVoicesScreen = () => {
    const navigation = useNavigation();
    const [voices, setVoices] = useState<EnrolledVoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [playingPath, setPlayingPath] = useState<string | null>(null);
    const [sound, setSound] = useState<Audio.Sound | null>(null);

    const [alertConfig, setAlertConfig] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'info' as AlertType,
        buttons: [{ text: 'OK' }] as AlertButton[]
    });

    const showAlert = (title: string, message: string, type: AlertType = 'info', buttons: AlertButton[] = [{ text: 'OK' }]) => {
        setAlertConfig({ visible: true, title, message, type, buttons });
    };

    const hideAlert = () => {
        setAlertConfig(prev => ({ ...prev, visible: false }));
    };

    const loadVoices = async () => {
        setLoading(true);
        try {
            const list = await TrustModelService.getEnrolledVoices();
            setVoices(list);
        } catch (error) {
            console.error(error);
            showAlert('Error', 'Failed to load voices', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVoices();
        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, []);

    const showDebugInfo = async () => {
        const info = await TrustModelService.getDebugInfo();
        showAlert("Model Debug Info", info, 'info');
    };

    const playAudio = async (path: string) => {
        try {
            if (sound) {
                await sound.unloadAsync();
                setSound(null);
                setPlayingPath(null);
                
                // If clicking same file, just stop
                if (playingPath === path) return;
            }

            const { sound: newSound } = await Audio.Sound.createAsync({ uri: path });
            setSound(newSound);
            setPlayingPath(path);
            
            newSound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded && status.didJustFinish) {
                    setPlayingPath(null);
                }
            });

            await newSound.playAsync();
        } catch (error) {
            console.error("Audio Playback Error:", error);
            showAlert("Error", "Could not play audio file.", 'error');
        }
    };

    const handleDeleteClip = async (name: string, path: string, index: number) => {
        showAlert(
            "Delete Clip",
            "Are you sure you want to delete this voice clip?",
            'warning',
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive", 
                    onPress: async () => {
                        await TrustModelService.deleteVoiceClip(name, path);
                        loadVoices();
                    }
                }
            ]
        );
    };

    const handleDelete = (name: string) => {
        showAlert(
            "Delete Voice",
            `Are you sure you want to delete voice data for "${name}"?`,
            'warning',
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive", 
                    onPress: async () => {
                        await TrustModelService.deleteVoice(name);
                        loadVoices();
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: EnrolledVoice }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                    <Ionicons name="mic" size={24} color={COLORS.primary} />
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.details}>{item.sampleCount} samples recorded</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(item.name)} style={styles.deleteButton}>
                    <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
                </TouchableOpacity>
            </View>

            {/* Audio Clips List */}
            {item.audioPaths && item.audioPaths.length > 0 && (
                <View style={styles.clipsContainer}>
                    <Text style={styles.clipsTitle}>Saved Clips:</Text>
                    {item.audioPaths.map((path, index) => (
                        <TouchableOpacity 
                            key={index} 
                            style={[
                                styles.clipItem, 
                                playingPath === path && styles.clipItemActive
                            ]}
                            onPress={() => playAudio(path)}
                        >
                            <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
                                <Ionicons 
                                    name={playingPath === path ? "pause-circle" : "play-circle"} 
                                    size={20} 
                                    color={playingPath === path ? COLORS.white : COLORS.primary} 
                                />
                                <Text style={[
                                    styles.clipText, 
                                    playingPath === path && styles.clipTextActive
                                ]}>
                                    Clip {index + 1}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => handleDeleteClip(item.name, path, index)} style={{padding: 4}}>
                                <Ionicons name="close-circle" size={20} color={playingPath === path ? COLORS.white : COLORS.textSecondary} />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );

    const handleAddVoice = () => {
        // Navigate to EnrollVoice without a child param, so it acts as "Generic" enrollment
        // @ts-ignore - Assuming navigation types are set up but might need updating
        navigation.navigate('EnrollVoice');
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
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Manage Trusted Voices</Text>
                <TouchableOpacity onPress={handleAddVoice} style={styles.addButton}>
                    <Ionicons name="add" size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {loading ? (
                    <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
                ) : voices.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="mic-off-outline" size={60} color="#CCC" />
                        <Text style={styles.emptyText}>No trusted voices enrolled yet.</Text>
                        <Text style={styles.emptySubText}>
                            Go to "Audio Threat Monitor" → "Enroll Voice" to add someone.
                        </Text>
                        <TouchableOpacity onPress={showDebugInfo} style={{ marginTop: 20 }}>
                             <Text style={{ color: COLORS.textSecondary, fontSize: 12, textDecorationLine: 'underline' }}>Show AI Model Debug Info</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        data={voices}
                        keyExtractor={(item) => item.name}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        ListFooterComponent={
                            <TouchableOpacity onPress={showDebugInfo} style={{ marginTop: 20, alignItems: 'center', paddingBottom: 20 }}>
                                <Text style={{ color: COLORS.textSecondary, fontSize: 12, textDecorationLine: 'underline' }}>Show AI Model Debug Info</Text>
                            </TouchableOpacity>
                        }
                    />
                )}
            </View>
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
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    backButton: {
        padding: SPACING.s,
    },
    addButton: {
        padding: SPACING.s,
    },
    content: {
        flex: 1,
    },
    listContent: {
        padding: SPACING.m,
    },
    card: {
        backgroundColor: COLORS.white,
        padding: SPACING.m,
        borderRadius: SIZES.radius,
        marginBottom: SPACING.m,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E3F2FD',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.m,
    },
    infoContainer: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    details: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    deleteButton: {
        padding: SPACING.s,
    },
    clipsContainer: {
        marginTop: SPACING.m,
        paddingTop: SPACING.s,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    clipsTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.textSecondary,
        marginBottom: SPACING.s,
    },
    clipItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F7FA',
        padding: SPACING.s,
        borderRadius: 8,
        marginBottom: 8,
    },
    clipItemActive: {
        backgroundColor: COLORS.primary,
    },
    clipText: {
        fontSize: 14,
        color: COLORS.text,
        marginLeft: 8,
    },
    clipTextActive: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textSecondary,
        marginTop: SPACING.m,
    },
    emptySubText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        marginTop: SPACING.s,
    },
});

export default ManageTrustedVoicesScreen;
