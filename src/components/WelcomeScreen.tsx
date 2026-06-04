import React from 'react';
import { StyleSheet, Text, View, Image, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { Button } from './ui/Button';
import { AnimateEntrance } from './ui/AnimateEntrance';

interface WelcomeScreenProps {
  onLogin: () => void;
  onSignUp: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onLogin, onSignUp }) => {
  return (
    <View style={styles.container}>
      {/* Brand & Logo Content */}
      <View style={styles.brandContainer}>
        <AnimateEntrance preset="scale" delay={150} duration={600} style={styles.centerEntrance}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </AnimateEntrance>

        <AnimateEntrance preset="slideUp" delay={300} duration={500} style={styles.centerEntrance}>
          <Text style={styles.title}>CONECTAE</Text>
        </AnimateEntrance>

        <AnimateEntrance preset="slideUp" delay={400} duration={500} style={styles.centerEntrance}>
          <Text style={styles.tagline}>
            Conectando pessoas e oportunidades de forma simples, fluida e dinâmica.
          </Text>
        </AnimateEntrance>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <AnimateEntrance preset="slideUp" delay={550} duration={500}>
          <Button
            title="Entrar"
            onPress={onLogin}
            icon={<Feather name="log-in" size={18} color={COLORS.white} />}
            style={styles.button}
          />
        </AnimateEntrance>

        <AnimateEntrance preset="slideUp" delay={650} duration={500}>
          <Button
            title="Cadastrar"
            variant="secondary"
            onPress={onSignUp}
            icon={<Feather name="user-plus" size={18} color={COLORS.primary} />}
            style={styles.button}
          />
        </AnimateEntrance>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: Platform.OS === 'ios' ? 50 : 40,
  },
  brandContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  centerEntrance: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  logoContainer: {
    width: 160,
    height: 160,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    alignSelf: 'center',
  },
  logo: {
    width: 150,
    height: 150,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: COLORS.primary,
    textAlign: 'center',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 16,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
    fontWeight: '600',
    paddingHorizontal: 16,
  },
  actionsContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    width: '100%',
  },
});
