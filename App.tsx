import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SplashScreen } from './src/components/SplashScreen';
import { WelcomeScreen } from './src/components/WelcomeScreen';
import { LoginScreen } from './src/components/LoginScreen';
import { SignUpScreen } from './src/components/SignUpScreen';
import { COLORS } from './src/constants/colors';
import { AnimateEntrance } from './src/components/ui/AnimateEntrance';

type ScreenState = 'splash' | 'welcome' | 'login' | 'signup';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('splash');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return (
          <AnimateEntrance 
            key="splash-screen-wrapper" 
            preset="fade" 
            duration={500} 
            style={styles.screenWrapper}
          >
            <SplashScreen onFinish={() => setCurrentScreen('welcome')} />
          </AnimateEntrance>
        );
      case 'welcome':
        return (
          <AnimateEntrance 
            key="welcome-screen-wrapper" 
            preset="fade" 
            duration={500} 
            style={styles.screenWrapper}
          >
            <WelcomeScreen 
              onLogin={() => setCurrentScreen('login')}
              onSignUp={() => setCurrentScreen('signup')}
            />
          </AnimateEntrance>
        );
      case 'login':
        return (
          <AnimateEntrance 
            key="login-screen-wrapper" 
            preset="slideSide" 
            duration={500} 
            style={styles.screenWrapper}
          >
            <LoginScreen 
              onNavigateToSignUp={() => setCurrentScreen('signup')} 
              onBack={() => setCurrentScreen('welcome')}
            />
          </AnimateEntrance>
        );
      case 'signup':
        return (
          <AnimateEntrance 
            key="signup-screen-wrapper" 
            preset="slideSide" 
            duration={500} 
            style={styles.screenWrapper}
          >
            <SignUpScreen 
              onNavigateToLogin={() => setCurrentScreen('login')}
              onBack={() => setCurrentScreen('welcome')}
            />
          </AnimateEntrance>
        );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor={COLORS.background} />
      {renderScreen()}
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
