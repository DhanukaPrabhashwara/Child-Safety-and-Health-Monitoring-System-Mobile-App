import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, Image, Dimensions } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { ChildTabParamList } from '../navigation/types';
import { COLORS, SPACING, SIZES } from '../constants/theme';

type LocationScreenRouteProp = RouteProp<ChildTabParamList, 'Location'>;

const LocationScreen = () => {
    const route = useRoute<LocationScreenRouteProp>();
    const { child } = route.params;
    const { location, locationHistory, safeZones } = child;

    const [modalVisible, setModalVisible] = useState(false);
    const [newLocationName, setNewLocationName] = useState('');
    const [selectedCoords, setSelectedCoords] = useState<{ x: number, y: number } | null>(null);
    const [savedLocations, setSavedLocations] = useState<{ name: string; coords: { x: number; y: number } }[]>([]);

    const isSafe = safeZones.includes(location.status === 'Arrived' ? location.address.split(',')[0] : '');

    const handleMapTap = (event: any) => {
        const { locationX, locationY } = event.nativeEvent;
        setSelectedCoords({ x: locationX, y: locationY });
    };

    const handleSaveLocation = () => {
        if (!newLocationName.trim()) {
            Alert.alert('Error', 'Please enter a location name');
            return;
        }
        if (!selectedCoords) {
            Alert.alert('Error', 'Please tap on the map to select a location');
            return;
        }

        // Mock saving
        setSavedLocations((prev) => [...prev, { name: newLocationName, coords: selectedCoords }]);
        Alert.alert('Success', `Location "${newLocationName}" saved successfully!`);
        setModalVisible(false);
        setNewLocationName('');
        setSelectedCoords(null);
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Location Tracking</Text>
                        <Text style={styles.subtitle}>Real-time Monitor</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => setModalVisible(true)}
                    >
                        <Ionicons name="add" size={24} color={COLORS.white} />
                        <Text style={styles.addButtonText}>Add Place</Text>
                    </TouchableOpacity>
                </View>

                {/* Map Placeholder */}
                <View style={styles.mapContainer}>
                    <View style={styles.mapBackground}>
                        <View style={styles.gridLineVertical} />
                        <View style={styles.gridLineHorizontal} />

                        {/* Fake Locations */}
                        <View style={[styles.mapPin, { top: '30%', left: '40%' }]}>
                            <MaterialIcons name="school" size={24} color={COLORS.primary} />
                            <Text style={styles.mapLabel}>School</Text>
                        </View>

                        <View style={[styles.mapPin, { top: '60%', left: '70%' }]}>
                            <Ionicons name="home" size={24} color={COLORS.success} />
                            <Text style={styles.mapLabel}>Home</Text>
                        </View>

                        {/* Current Child Location */}
                        <View style={[styles.mapPin, { top: '45%', left: '50%' }]}>
                            <View style={styles.pulseContainer}>
                                <View style={styles.pulseRing} />
                                <Image
                                    source={{ uri: child.photoUrl }}
                                    style={styles.mapAvatar}
                                />
                            </View>
                        </View>
                    </View>
                    <View style={styles.mapOverlay}>
                        <Text style={styles.mapOverlayText}>Live Tracking Active</Text>
                    </View>
                </View>

                {/* Status Card */}
                <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: isSafe ? COLORS.success : COLORS.warning }]}>
                    <View style={styles.row}>
                        <Ionicons
                            name={isSafe ? "shield-checkmark" : "warning"}
                            size={32}
                            color={isSafe ? COLORS.success : COLORS.warning}
                        />
                        <View style={{ marginLeft: SPACING.m }}>
                            <Text style={styles.cardTitle}>Status: {location.status || 'Unknown'}</Text>
                            <Text style={styles.cardSubtitle}>
                                {location.address}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Saved Locations List */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Saved Places</Text>
                    {savedLocations.length > 0 ? (
                        savedLocations.map((loc, index) => (
                            <View key={index} style={styles.card}>
                                <View style={styles.row}>
                                    <Ionicons name="location-outline" size={24} color={COLORS.primary} />
                                    <View style={{ marginLeft: SPACING.m }}>
                                        <Text style={styles.cardTitle}>{loc.name}</Text>
                                        <Text style={styles.cardSubtitle}>
                                            Coordinates: {Math.round(loc.coords.x)}, {Math.round(loc.coords.y)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>No saved locations yet.</Text>
                    )}
                </View>

                {/* History List */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Movement History</Text>
                    {locationHistory.map((loc, index) => (
                        <View key={index} style={styles.historyItem}>
                            <View style={styles.timelineContainer}>
                                <View style={styles.timelineDot} />
                                {index !== locationHistory.length - 1 && <View style={styles.timelineLine} />}
                            </View>
                            <View style={styles.historyContent}>
                                <Text style={styles.historyTime}>{loc.timestamp}</Text>
                                <Text style={styles.historyStatus}>{loc.status} - {loc.address}</Text>
                            </View>
                        </View>
                    ))}
                    {locationHistory.length === 0 && (
                        <Text style={styles.emptyText}>No recent movements recorded.</Text>
                    )}
                </View>
            </ScrollView>

            {/* Add Location Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add Safe Location</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>Location Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Grandma's House"
                            value={newLocationName}
                            onChangeText={setNewLocationName}
                        />

                        <Text style={styles.label}>Tap to set location on map:</Text>
                        <TouchableOpacity
                            style={styles.modalMapContainer}
                            activeOpacity={0.9}
                            onPress={handleMapTap}
                        >
                            <View style={styles.gridLineVertical} />
                            <View style={styles.gridLineHorizontal} />

                            {/* Static fake landmarks to make it look like a map */}
                            <FontAwesome5 name="road" size={100} color="rgba(0,0,0,0.05)" style={{ position: 'absolute', top: 50, left: 50, transform: [{ rotate: '45deg' }] }} />
                            <FontAwesome5 name="tree" size={40} color="rgba(76, 175, 80, 0.2)" style={{ position: 'absolute', bottom: 30, right: 60 }} />

                            {selectedCoords && (
                                <View
                                    style={[
                                        styles.selectedPin,
                                        { top: selectedCoords.y - 32, left: selectedCoords.x - 16 }
                                    ]}
                                >
                                    <Ionicons name="location" size={32} color={COLORS.primary} />
                                </View>
                            )}
                        </TouchableOpacity>

                        <View style={styles.modalInstruction}>
                            {!selectedCoords ? (
                                <Text style={styles.instructionText}>Tap anywhere on the box above</Text>
                            ) : (
                                <Text style={[styles.instructionText, { color: COLORS.primary }]}>Location selected!</Text>
                            )}
                        </View>

                        <TouchableOpacity style={styles.saveButton} onPress={handleSaveLocation}>
                            <Text style={styles.saveButtonText}>Save Location</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 25,
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        padding: SPACING.m,
        paddingBottom: 50,
    },
    header: {
        marginBottom: SPACING.m,
        flexDirection: 'row',
        justifyContent: 'space-between', // Align title and button
        alignItems: 'center',
    },
    title: {
        fontSize: SIZES.title,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    subtitle: {
        fontSize: SIZES.body,
        color: COLORS.textSecondary,
    },
    addButton: {
        flexDirection: 'row',
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.m,
        paddingVertical: 8,
        borderRadius: SIZES.radius,
        alignItems: 'center',
    },
    addButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
        marginLeft: 4,
        fontSize: 14,
    },
    mapContainer: {
        height: 250,
        backgroundColor: '#E1E8ED',
        borderRadius: SIZES.radius,
        marginBottom: SPACING.m,
        overflow: 'hidden',
        position: 'relative',
        borderWidth: 1,
        borderColor: '#CED6E0',
    },
    mapBackground: {
        flex: 1,
        position: 'relative',
    },
    gridLineVertical: {
        position: 'absolute',
        left: '50%',
        height: '100%',
        width: 1,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    gridLineHorizontal: {
        position: 'absolute',
        top: '50%',
        width: '100%',
        height: 1,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    mapPin: {
        position: 'absolute',
        alignItems: 'center',
    },
    mapLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    mapAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    pulseContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    pulseRing: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(33, 150, 243, 0.3)',
    },
    mapOverlay: {
        position: 'absolute',
        top: SPACING.s,
        left: SPACING.s,
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: SPACING.s,
        paddingVertical: 4,
        borderRadius: 12,
    },
    mapOverlayText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: SPACING.m,
        marginBottom: SPACING.m,
        elevation: 2,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    cardSubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    section: {
        marginTop: SPACING.m,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.m,
    },
    historyItem: {
        flexDirection: 'row',
        marginBottom: SPACING.m,
    },
    timelineContainer: {
        alignItems: 'center',
        marginRight: SPACING.m,
        width: 20,
    },
    timelineDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: COLORS.primary,
    },
    timelineLine: {
        flex: 1,
        width: 2,
        backgroundColor: COLORS.primary,
        opacity: 0.3,
        marginTop: 4,
    },
    historyContent: {
        flex: 1,
        paddingBottom: SPACING.s,
    },
    historyTime: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginBottom: 2,
    },
    historyStatus: {
        fontSize: 16,
        color: COLORS.text,
    },
    emptyText: {
        color: COLORS.textSecondary,
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: SPACING.m,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: SPACING.l,
        minHeight: '60%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.l,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    label: {
        fontSize: 16,
        color: COLORS.text,
        marginBottom: SPACING.s,
        fontWeight: '600',
    },
    input: {
        backgroundColor: '#F5F5F5',
        padding: SPACING.m,
        borderRadius: SIZES.radius,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginBottom: SPACING.l,
        fontSize: 16,
    },
    modalMapContainer: {
        height: 200,
        backgroundColor: '#E1E8ED',
        borderRadius: SIZES.radius,
        marginBottom: SPACING.s,
        position: 'relative',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#CED6E0',
    },
    selectedPin: {
        position: 'absolute',
        // Pin styling handled by icon
    },
    modalInstruction: {
        marginBottom: SPACING.l,
        alignItems: 'center',
    },
    instructionText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        padding: SPACING.m,
        borderRadius: SIZES.radius,
        alignItems: 'center',
    },
    saveButtonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default LocationScreen;
