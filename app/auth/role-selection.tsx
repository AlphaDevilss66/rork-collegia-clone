import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { User, Trophy, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/colors';
import { useUserStore, UserRole } from '@/stores/user-store';
import { useLocalSearchParams, router } from 'expo-router';

export default function RoleSelectionScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const params = useLocalSearchParams();
  const email = typeof params.email === 'string' ? params.email : '';
  const password = typeof params.password === 'string' ? params.password : '';
  const { signUp } = useUserStore();

  const handleRoleSelect = async (role: UserRole) => {
    if (!email || !password) {
      Alert.alert('Error', 'Missing registration information');
      return;
    }

    setIsLoading(true);

    try {
      const success = await signUp(email, password, role);
      
      if (success) {
        router.replace('/onboarding');
      } else {
        Alert.alert('Error', 'An account with this email already exists');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Role</Text>
          <Text style={styles.subtitle}>How do you want to use Collegia?</Text>
        </View>

        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => handleRoleSelect('athlete')}
            disabled={isLoading}
          >
            <LinearGradient
              colors={colors.primaryGradient}
              style={styles.roleGradient}
            >
              <User size={48} color="white" />
              <Text style={styles.roleTitle}>I'm an Athlete</Text>
              <Text style={styles.roleDescription}>
                Showcase your skills and get discovered by coaches
              </Text>
              <ChevronRight size={24} color="white" style={styles.roleArrow} />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => handleRoleSelect('coach')}
            disabled={isLoading}
          >
            <LinearGradient
              colors={colors.secondaryGradient}
              style={styles.roleGradient}
            >
              <Trophy size={48} color="white" />
              <Text style={styles.roleTitle}>I'm a Coach</Text>
              <Text style={styles.roleDescription}>
                Discover and recruit talented athletes
              </Text>
              <ChevronRight size={24} color="white" style={styles.roleArrow} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {isLoading && (
          <Text style={styles.loadingText}>Creating your account...</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  roleContainer: {
    gap: 20,
  },
  roleCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  roleGradient: {
    padding: 24,
    alignItems: 'center',
    minHeight: 180,
    justifyContent: 'center',
    position: 'relative',
  },
  roleTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
  },
  roleDescription: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
  },
  roleArrow: {
    position: 'absolute',
    top: 24,
    right: 24,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 24,
  },
});