import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, TextInput, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Trophy, ChevronRight } from 'lucide-react-native';
import { useUserStore, UserRole } from '@/stores/user-store';
import { colors } from '@/constants/colors';
import { router } from 'expo-router';

export default function OnboardingScreen() {
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    sport: '',
    position: '',
    experience: '',
    teamAffiliation: '',
  });

  const { user, updateProfile, completeOnboarding } = useUserStore();

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStep(2);
  };

  const handleComplete = async () => {
    if (!user) return;

    // Ensure name is not empty
    const finalName = formData.name.trim() || user.email.split('@')[0];

    const updates = {
      name: finalName,
      bio: formData.bio.trim(),
      location: formData.location.trim(),
      sport: formData.sport.trim(),
      position: formData.position.trim(),
      experience: formData.experience.trim(),
      teamAffiliation: formData.teamAffiliation.trim(),
      role: selectedRole || user.role,
    };

    await updateProfile(updates);
    completeOnboarding();
    router.replace('/(tabs)');
  };

  // If user already has a role, skip role selection
  React.useEffect(() => {
    if (user?.role) {
      setSelectedRole(user.role);
      setStep(2);
      // Pre-fill form with existing data
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        location: user.location || '',
        sport: user.sport || '',
        position: user.position || '',
        experience: user.experience || '',
        teamAffiliation: user.teamAffiliation || '',
      });
    }
  }, [user]);

  if (step === 1) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome to Collegia</Text>
            <Text style={styles.subtitle}>Connect, showcase, and get recruited</Text>
          </View>

          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={styles.roleCard}
              onPress={() => handleRoleSelect('athlete')}
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
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.formContainer}>
        <View style={styles.formHeader}>
          <Text style={styles.formTitle}>Complete Your Profile</Text>
          <Text style={styles.formSubtitle}>
            {selectedRole === 'athlete' ? 'Tell coaches about yourself' : 'Tell athletes about your program'}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Enter your full name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.bio}
              onChangeText={(text) => setFormData({ ...formData, bio: text })}
              placeholder="Tell us about yourself"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              value={formData.location}
              onChangeText={(text) => setFormData({ ...formData, location: text })}
              placeholder="City, State"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sport</Text>
            <TextInput
              style={styles.input}
              value={formData.sport}
              onChangeText={(text) => setFormData({ ...formData, sport: text })}
              placeholder="Basketball, Football, Soccer, etc."
            />
          </View>

          {selectedRole === 'athlete' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Position</Text>
              <TextInput
                style={styles.input}
                value={formData.position}
                onChangeText={(text) => setFormData({ ...formData, position: text })}
                placeholder="Point Guard, Quarterback, etc."
              />
            </View>
          )}

          {selectedRole === 'coach' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Experience</Text>
                <TextInput
                  style={styles.input}
                  value={formData.experience}
                  onChangeText={(text) => setFormData({ ...formData, experience: text })}
                  placeholder="Years of coaching experience"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Team/Organization</Text>
                <TextInput
                  style={styles.input}
                  value={formData.teamAffiliation}
                  onChangeText={(text) => setFormData({ ...formData, teamAffiliation: text })}
                  placeholder="University, High School, Club, etc."
                />
              </View>
            </>
          )}
        </View>

        <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
          <Text style={styles.completeButtonText}>Complete Profile</Text>
        </TouchableOpacity>
      </ScrollView>
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
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
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
  formContainer: {
    flex: 1,
    padding: 24,
  },
  formHeader: {
    marginBottom: 32,
    marginTop: 20,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: colors.surface,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  completeButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 40,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});