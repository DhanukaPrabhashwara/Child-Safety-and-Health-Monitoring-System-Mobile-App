import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../constants/theme';

export type AlertType = 'success' | 'warning' | 'error' | 'info';

export interface AlertButton {
    text: string;
    style?: 'cancel' | 'default' | 'destructive';
    onPress?: () => void;
}

export interface CustomAlertProps {
    visible: boolean;
    title: string;
    message: string;
    type?: AlertType;
    onClose: () => void;
    buttons?: AlertButton[];
}

const { width } = Dimensions.get('window');

const CustomAlert: React.FC<CustomAlertProps> = ({ 
    visible, 
    title, 
    message, 
    type = 'info', 
    onClose,
    buttons = [{ text: 'OK', onPress: () => {} }]
}) => {
    const getIcon = () => {
        switch (type) {
            case 'success': return { name: 'checkmark-circle', color: COLORS.success };
            case 'warning': return { name: 'warning', color: '#FFB74D' }; // Orange
            case 'error': return { name: 'alert-circle', color: COLORS.danger };
            default: return { name: 'information-circle', color: COLORS.primary };
        }
    };

    const iconData = getIcon();

    const handleButtonPress = (onPress?: () => void) => {
        if (onPress) onPress();
        onClose();
    };

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.alertContainer}>
                    <View style={[styles.iconContainer, { backgroundColor: iconData.color + '20' }]}>
                        <Ionicons name={iconData.name as any} size={40} color={iconData.color} />
                    </View>
                    
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>

                    <View style={styles.buttonContainer}>
                        {buttons.map((btn, index) => (
                            <TouchableOpacity 
                                key={index}
                                style={[
                                    styles.button, 
                                    btn.style === 'cancel' ? styles.cancelButton : 
                                    btn.style === 'destructive' ? styles.destructiveButton :
                                    styles.defaultButton,
                                    buttons.length > 1 && { flex: 1, marginHorizontal: 5 }
                                ]}
                                onPress={() => handleButtonPress(btn.onPress)}
                            >
                                <Text style={[
                                    styles.buttonText, 
                                    btn.style === 'cancel' ? styles.cancelButtonText : styles.defaultButtonText
                                ]}>
                                    {btn.text}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.l,
    },
    alertContainer: {
        width: width * 0.85,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: SPACING.l,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    iconContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.m,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.s,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: SPACING.l,
        lineHeight: 22,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 100,
    },
    defaultButton: {
        backgroundColor: COLORS.primary,
    },
    destructiveButton: {
        backgroundColor: COLORS.danger,
    },
    cancelButton: {
        backgroundColor: '#F5F5F5',
    },
    defaultButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    cancelButtonText: {
        color: COLORS.textSecondary,
        fontWeight: 'bold',
        fontSize: 16,
    },
    buttonText: {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default CustomAlert;
