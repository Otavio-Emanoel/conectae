import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { AnimateEntrance } from './ui/AnimateEntrance';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

interface SignUpScreenProps {
  onNavigateToLogin: () => void;
  onBack?: () => void;
  onSubmitSuccess?: () => void;
}

export const SignUpScreen: React.FC<SignUpScreenProps> = ({ onNavigateToLogin, onBack, onSubmitSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardView}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back Button */}
        <AnimateEntrance preset="fade" delay={60} duration={180}>
          <View style={styles.headerNav}>
            <TouchableOpacity 
              onPress={onBack} 
              style={styles.backButton} 
              activeOpacity={0.6}
            >
              <Feather name="arrow-left" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </AnimateEntrance>

        {/* Logo Container */}
        <AnimateEntrance preset="scale" delay={90} duration={260}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/logo.png')} 
              style={styles.logo} 
              resizeMode="contain"
            />
          </View>
        </AnimateEntrance>

        {/* Header Texts */}
        <AnimateEntrance preset="slideUp" delay={120} duration={220}>
          <View style={styles.header}>
            <Text style={styles.title}>Crie sua conta</Text>
            <Text style={styles.subtitle}>Junte-se à comunidade hoje mesmo.</Text>
          </View>
        </AnimateEntrance>

        {/* Form Fields */}
        <View style={styles.form}>
          <AnimateEntrance preset="slideUp" delay={160} duration={220}>
            <Input 
              label="Nome completo"
              placeholder="Ex: João da Silva"
              iconName="user"
              value={name}
              onChangeText={setName}
            />
          </AnimateEntrance>

          <AnimateEntrance preset="slideUp" delay={220} duration={220}>
            <Input 
              label="E-mail"
              placeholder="seu@email.com"
              iconName="mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
          </AnimateEntrance>

          <AnimateEntrance preset="slideUp" delay={280} duration={220}>
            <Input 
              label="Senha"
              placeholder="Mínimo 8 caracteres"
              iconName="lock"
              isPassword
              value={password}
              onChangeText={setPassword}
            />
          </AnimateEntrance>

          <AnimateEntrance preset="slideUp" delay={340} duration={220}>
            <Input 
              label="Confirmar senha"
              placeholder="Repita sua senha"
              iconName="lock"
              isPassword
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </AnimateEntrance>
        </View>

        {/* Action Button */}
        <AnimateEntrance preset="slideUp" delay={400} duration={220}>
          <Button 
            title="Cadastrar" 
            onPress={() => {
              console.log('Signup press with:', name, email, password, confirmPassword);
              if (onSubmitSuccess) onSubmitSuccess();
            }} 
            style={styles.submitBtn}
          />
        </AnimateEntrance>

        {/* Footer Navigation */}
        <AnimateEntrance preset="slideUp" delay={460} duration={220}>
          <TouchableOpacity 
            onPress={onNavigateToLogin} 
            style={styles.footer} 
            activeOpacity={0.6}
          >
            <Text style={styles.footerText}>
              Já tem uma conta? <Text style={styles.footerHighlight}>Entre</Text>
            </Text>
          </TouchableOpacity>
        </AnimateEntrance>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  headerNav: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignSelf: 'center',
    width: 120,
    height: 120,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    elevation: 2,
    overflow: 'hidden',
  },
  logo: {
    width: 110,
    height: 110,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.primary,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  form: {
    width: '100%',
    marginBottom: 20,
  },
  submitBtn: {
    marginTop: 20,
  },
  footer: {
    alignSelf: 'center',
    marginTop: 32,
    paddingVertical: 8,
  },
  footerText: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
  },
  footerHighlight: {
    fontWeight: '700',
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
});
