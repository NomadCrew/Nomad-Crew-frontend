import React, { useMemo } from 'react';
import { Image, View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/src/theme/ThemeProvider';
import type { User } from '@/src/types/auth';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const AVATAR_SIZES: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 56,
};

interface AvatarProps {
  user?: Pick<User, 'firstName' | 'lastName' | 'profilePicture'>;
  size?: AvatarSize;
  style?: any;
}

export const Avatar: React.FC<AvatarProps> = ({ 
  user, 
  size = 'md',
  style 
}) => {
  const { theme } = useTheme();
  const dimension = AVATAR_SIZES[size];

  const initials = useMemo(() => {
    if (!user?.firstName && !user?.lastName) return '?';
    return `${(user.firstName?.[0] || '').toUpperCase()}${(user.lastName?.[0] || '').toUpperCase()}`;
  }, [user?.firstName, user?.lastName]);

  const styles = StyleSheet.create({
    container: {
      width: dimension,
      height: dimension,
      borderRadius: dimension / 2,
      backgroundColor: theme.colors.surface.variant,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    image: {
      width: dimension,
      height: dimension,
    },
    initialsText: {
      color: theme.colors.content.primary,
      fontSize: dimension * 0.4,
      fontWeight: '600',
    },
  });

  if (user?.profilePicture) {
    return (
      <View style={[styles.container, style]}>
        <Image
          source={{ uri: user.profilePicture }}
          style={styles.image}
        //   defaultSource={require('@/assets/images/default-avatar.png')}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <ThemedText style={styles.initialsText}>{initials}</ThemedText>
    </View>
  );
};

export default Avatar;