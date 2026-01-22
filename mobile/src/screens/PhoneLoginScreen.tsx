import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import * as Location from 'expo-location';

interface PhoneLoginScreenProps {
  navigation: any;
}

export default function PhoneLoginScreen({ navigation }: PhoneLoginScreenProps) {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [countryCode, setCountryCode] = useState<string>('+91');
  const [locationGranted, setLocationGranted] = useState<boolean>(false);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async (): Promise<void> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        setLocationGranted(true);
        console.log('✅ Location permission granted');
      } else {
        Alert.alert(
          'Location Permission Required',
          'ChotaHathi needs your location to show nearby services and accurate delivery addresses.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Grant Permission', onPress: requestLocationPermission }
          ]
        );
      }
    } catch (error) {
      console.error('Location permission error:', error);
    }
  };

  const handleContinue = (): void => {
    if (phoneNumber.length !== 10) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit phone number');
      return;
    }

    if (!locationGranted) {
      Alert.alert(
        'Location Required',
        'Please enable location to continue',
        [{ text: 'Enable', onPress: requestLocationPermission }]
      );
      return;
    }

    navigation.navigate('OTPVerification', { 
      phoneNumber: countryCode + phoneNumber 
    });
  };

  const isValidNumber = phoneNumber.length === 10;

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#1a237e" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>CHOTAHATHI</Text>
        <Text style={styles.logoSubtext}>Your Logistics Partner</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <View style={styles.iconCircle}>
            <Text style={styles.illustration}>🚛</Text>
          </View>
          <View style={styles.iconGrid}>
            <View style={styles.smallIconBox}>
              <Text style={styles.smallIcon}>📦</Text>
            </View>
            <View style={styles.smallIconBox}>
              <Text style={styles.smallIcon}>🏍️</Text>
            </View>
            <View style={styles.smallIconBox}>
              <Text style={styles.smallIcon}>📍</Text>
            </View>
          </View>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>Welcome 👋</Text>
          <Text style={styles.welcomeSubtitle}>
            Enter your phone number to access deliveries and our other services
          </Text>

          {/* Phone Input */}
          <View style={styles.phoneInputContainer}>
            <TouchableOpacity style={styles.countryCodeBox}>
              <Text style={styles.flag}>🇮🇳</Text>
              <Text style={styles.countryCode}>{countryCode}</Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.phoneInput}
              placeholder="Enter phone number"
              placeholderTextColor="#9ca3af"
              keyboardType="phone-pad"
              maxLength={10}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
          </View>

          {/* Continue Button */}
          <TouchableOpacity 
            style={[
              styles.continueButton,
              isValidNumber && locationGranted && styles.continueButtonActive
            ]}
            onPress={handleContinue}
            disabled={!isValidNumber || !locationGranted}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>

          {/* Location Status */}
          {locationGranted ? (
            <View style={styles.statusContainer}>
              <View style={styles.statusBadgeSuccess}>
                <Text style={styles.statusDot}>●</Text>
                <Text style={styles.locationStatusSuccess}>Location enabled</Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.statusContainer}
              onPress={requestLocationPermission}
            >
              <View style={styles.statusBadgeWarning}>
                <Text style={styles.statusDotWarning}>●</Text>
                <Text style={styles.locationStatusWarning}>Tap to enable location</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Terms & Privacy */}
          <Text style={styles.termsText}>
            By continuing, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    backgroundColor: '#1a237e',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  logo: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 2,
  },
  logoSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  illustrationContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e8f4fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  illustration: {
    fontSize: 60,
  },
  iconGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  smallIconBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  smallIcon: {
    fontSize: 24,
  },
  welcomeContainer: {
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 32,
    paddingBottom: 40,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 22,
    marginBottom: 28,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  countryCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 16,
    minWidth: 100,
  },
  flag: {
    fontSize: 22,
    marginRight: 6,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  dropdownArrow: {
    fontSize: 10,
    color: '#9ca3af',
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  continueButton: {
    backgroundColor: '#d1d5db',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  continueButtonActive: {
    backgroundColor: '#2563eb',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  statusContainer: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 16,
  },
  statusBadgeSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusBadgeWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusDot: {
    color: '#22c55e',
    marginRight: 8,
    fontSize: 10,
  },
  statusDotWarning: {
    color: '#f59e0b',
    marginRight: 8,
    fontSize: 10,
  },
  locationStatusSuccess: {
    fontSize: 13,
    color: '#22c55e',
    fontWeight: '600',
  },
  locationStatusWarning: {
    fontSize: 13,
    color: '#f59e0b',
    fontWeight: '600',
  },
  termsText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  termsLink: {
    color: '#2563eb',
    fontWeight: '600',
  },
});