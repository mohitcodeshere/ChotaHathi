import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function OrderCard({ order, onPress }) {
  const getStatusColor = (status) => {
    const colors = {
      pending: '#FFA500',
      accepted: '#4CAF50',
      in_transit: '#2196F3',
      delivered: '#4CAF50',
      cancelled:  '#F44336',
    };
    return colors[status] || '#999';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(order)}>
      <View style={styles.header}>
        <Text style={styles.loadType}>📦 {order.load_type}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order. status) }]}>
          <Text style={styles.statusText}>{order.status. toUpperCase()}</Text>
        </View>
      </View>
      
      <View style={styles.locationContainer}>
        <Text style={styles.locationLabel}>📍 Pickup: </Text>
        <Text style={styles.locationText}>{order. pickup_location}</Text>
      </View>
      
      <View style={styles.locationContainer}>
        <Text style={styles. locationLabel}>🎯 Drop:  </Text>
        <Text style={styles.locationText}>{order.drop_location}</Text>
      </View>

      {order.load_weight_kg && (
        <Text style={styles.weight}>⚖️ Weight: {order.load_weight_kg} kg</Text>
      )}

      <Text style={styles.date}>🕐 {formatDate(order.createdAt)}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity:  0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems:  'center',
    marginBottom: 12,
  },
  loadType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical:  4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize:  10,
    fontWeight: 'bold',
  },
  locationContainer: {
    marginBottom: 8,
  },
  locationLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  locationText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  weight:  {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  date:  {
    fontSize: 11,
    color: '#999',
    marginTop: 8,
  },
});