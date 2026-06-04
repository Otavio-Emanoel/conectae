import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LoginScreen } from './src/components/LoginScreen';
import { SignUpScreen } from './src/components/SignUpScreen';
import { COLORS } from './src/constants/colors';
import { AnimateEntrance } from './src/components/ui/AnimateEntrance';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'login' | 'signup'>('login');

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor={COLORS.background} />
      
      {currentScreen === 'login' ? (
        <AnimateEntrance 
          key="login-screen-wrapper" 
          preset="slideSide" 
          duration={500} 
          style={styles.screenWrapper}
        >
          <LoginScreen 
            onNavigateToSignUp={() => setCurrentScreen('signup')} 
            onBack={() => console.log('Back pressed on login')}
          />
        </AnimateEntrance>
      ) : (
        <AnimateEntrance 
          key="signup-screen-wrapper" 
          preset="slideSide" 
          duration={500} 
          style={styles.screenWrapper}
        >
          <SignUpScreen 
            onNavigateToLogin={() => setCurrentScreen('login')}
            onBack={() => setCurrentScreen('login')}
          />
        </AnimateEntrance>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screenWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
