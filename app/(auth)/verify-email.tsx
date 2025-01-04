import { StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Linking } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useAuthStore } from '@/src/store/useAuthStore';
import { supabase } from '@/src/auth/supabaseClient';

export default function VerifyEmailScreen() {
    const { theme } = useTheme();
    const { isVerifying } = useAuthStore();
  
    useEffect(() => {
      // Auth state change listener
      const handleAuthChange = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'USER_UPDATED') {
          const { data: { user } } = await supabase.auth.getUser();
          if (user?.email_confirmed_at) {
            router.replace('/(auth)/login');
          }
        }
      });
  
      // Deep link listener
      const handleDeepLink = ({ url }: { url: string }) => {
        if (url.includes('verify')) {
          router.replace('/(auth)/login');
        }
      };
      Linking.addEventListener('url', handleDeepLink);
  
      // Cleanup both listeners
      return () => {
        handleAuthChange.data.subscription.unsubscribe();
        Linking.removeAllListeners('url');
      };
    }, []);
  
    if (!isVerifying) {
      router.replace('/(auth)/login');
      return null;
    }

  return (
    <ThemedView style={styles(theme).container}>
      <ThemedText style={styles(theme).title}>Verify Your Email</ThemedText>
      <ThemedText style={styles(theme).subtitle}>
        Please check your email for a verification link. You can close this screen and come back after verification.
      </ThemedText>
    </ThemedView>
  );
}

const styles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.layout.screen.padding,
  },
  title: {
    ...theme.typography.heading.h1,
    marginBottom: theme.spacing.stack.md,
  },
  subtitle: {
    ...theme.typography.body.large,
    textAlign: 'center',
    color: theme.colors.content.secondary,
  },
});