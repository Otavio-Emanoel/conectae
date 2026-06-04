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

interface LoginScreenProps {
  onNavigateToSignUp: () => void;
  onBack?: () => void;
  onSubmitSuccess?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigateToSignUp, onBack, onSubmitSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
        <AnimateEntrance preset="fade" delay={100} duration={300}>
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
        <AnimateEntrance preset="scale" delay={200} duration={600}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </AnimateEntrance>

        {/* Header Texts */}
        <AnimateEntrance preset="slideUp" delay={300} duration={500}>
          <View style={styles.header}>
            <Text style={styles.title}>Bem-vindo de volta</Text>
            <Text style={styles.subtitle}>Acesse sua conta para continuar</Text>
          </View>
        </AnimateEntrance>

        {/* Form Fields */}
        <View style={styles.form}>
          <AnimateEntrance preset="slideUp" delay={400} duration={500}>
            <Input
              label="E-mail"
              placeholder="Digite seu e-mail"
              iconName="mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
          </AnimateEntrance>

          <AnimateEntrance preset="slideUp" delay={500} duration={500}>
            <Input
              label="Senha"
              placeholder="Digite sua senha"
              iconName="lock"
              isPassword
              value={password}
              onChangeText={setPassword}
            />
          </AnimateEntrance>

          {/* Forgot Password Link */}
          <AnimateEntrance preset="slideUp" delay={550} duration={400}>
            <TouchableOpacity style={styles.forgotPassword} activeOpacity={0.6}>
              <Text style={styles.forgotPasswordText}>Esqueci a senha</Text>
            </TouchableOpacity>
          </AnimateEntrance>
        </View>

        {/* Action Button */}
        <AnimateEntrance preset="slideUp" delay={650} duration={500}>
          <Button
            title="Entrar"
            onPress={() => {
              console.log('Login press with:', email, password);
              if (onSubmitSuccess) onSubmitSuccess();
            }}
            icon={<Feather name="arrow-right" size={18} color={COLORS.white} />}
            style={styles.submitBtn}
          />
        </AnimateEntrance>

        {/* Footer Navigation */}
        <AnimateEntrance preset="slideUp" delay={750} duration={500}>
          <TouchableOpacity
            onPress={onNavigateToSignUp}
            style={styles.footer}
            activeOpacity={0.6}
          >
            <Text style={styles.footerText}>
              Não tem uma conta? <Text style={styles.footerHighlight}>Cadastre-se</Text>
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 4,
    paddingVertical: 4,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
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
  },
});
