import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';

interface HeroSectionProps {
  city: string;
}

export default function HeroSection({ city }: HeroSectionProps): React.JSX.Element {
  return (
    <ImageBackground 
      source={{ uri: 'https://5.imimg.com/data5/DC/CN/MY-28768779/tata-ace-zip-mega-mint-xenon-yodha-scv.jpg' }}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Delivery hai? 🚚</Text>
          <Text style={styles.subtitle}>#ChotaHathiKarDega</Text>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 240,
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  overlay: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#020202ff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '400',
    color: '#FFFFFF',
    opacity: 0.95,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
