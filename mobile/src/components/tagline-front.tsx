import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TaglineProps {
  city: string;
}

export default function Tagline({ city }: TaglineProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <View style={styles.overlay}>
        <Text style={styles.title}>Delivery hai? 🚛</Text>
        <Text style={styles.subtitle}>#ChotaHathiKarDega</Text>
        <Text style={styles.location}>📍 {city}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
  },
  overlay: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '600',
    opacity: 0.95,
  },
  location: {
    fontSize: 16,
    color: '#fff',
    marginTop: 12,
    opacity: 0.9,
  },
});
