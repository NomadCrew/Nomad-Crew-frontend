import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingContextProps {
  isFirstTime: boolean;
}

const OnboardingContext = createContext<OnboardingContextProps | null>(null);

export const OnboardingProvider = ({ children }: { children: React.ReactNode }) => {
  const [isFirstTime, setIsFirstTime] = useState(false);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      const firstLaunch = await AsyncStorage.getItem('isFirstLaunch');
      if (!firstLaunch) {
        setIsFirstTime(true);
        await AsyncStorage.setItem('isFirstLaunch', 'true');
      }
    };
    checkFirstLaunch();
  }, []);

  return (
    <OnboardingContext.Provider value={{ isFirstTime }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error('useOnboarding must be used within OnboardingProvider');
  return context;
};
