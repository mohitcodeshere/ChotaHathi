import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

export default function ServiceCard({ icon, title, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor:  '#FFFFFF',
    borderRadius: 20, // Increased from 16
    padding: 24,
    margin: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity:  0.12,
    shadowRadius: 12,
    elevation: 6,
    minHeight: 160,
  },
  iconContainer: {
    marginBottom: 16,
  },
  icon:  {
    fontSize: 56, // Larger icons
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000', // Changed from #333 to pure black
    textAlign: 'center',
  },
});