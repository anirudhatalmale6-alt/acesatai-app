import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';

type Section = 'Math' | 'Verbal';

export default function HomeScreen() {
  const router = useRouter();
  const [section, setSection] = useState<Section>('Math');
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await api.getUserProfile();
      setStreak(profile.daily_streak || 0);
      setXp(profile.xp_total || 0);
    } catch {
      // Profile not yet available
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>ACESAT</Text>
        <Text style={styles.tagline}>AI-Powered SAT Prep</Text>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="flame" size={28} color="#f59e0b" />
          <Text style={styles.statValue}>{streak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="star" size={28} color="#10b981" />
          <Text style={styles.statValue}>{xp}</Text>
          <Text style={styles.statLabel}>Total XP</Text>
        </View>
      </View>

      {/* Section Selector */}
      <Text style={styles.sectionTitle}>Choose Section</Text>
      <View style={styles.sectionRow}>
        <TouchableOpacity
          style={[styles.sectionBtn, section === 'Math' && styles.sectionBtnActive]}
          onPress={() => setSection('Math')}
        >
          <Ionicons name="calculator" size={24} color={section === 'Math' ? '#fff' : '#64748b'} />
          <Text style={[styles.sectionBtnText, section === 'Math' && styles.sectionBtnTextActive]}>
            Math
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sectionBtn, section === 'Verbal' && styles.sectionBtnActive]}
          onPress={() => setSection('Verbal')}
        >
          <Ionicons name="book" size={24} color={section === 'Verbal' ? '#fff' : '#64748b'} />
          <Text style={[styles.sectionBtnText, section === 'Verbal' && styles.sectionBtnTextActive]}>
            Verbal
          </Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={() => router.push({ pathname: '/quiz', params: { section } })}
      >
        <Ionicons name="play-circle" size={24} color="#fff" />
        <Text style={styles.primaryBtnText}>Start Adaptive Quiz</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryBtn}
        onPress={() => router.push('/snap-solve')}
      >
        <Ionicons name="camera" size={24} color="#2563eb" />
        <Text style={styles.secondaryBtnText}>Snap & Solve</Text>
      </TouchableOpacity>

      {/* Profile Link */}
      <TouchableOpacity style={styles.profileLink} onPress={() => router.push('/profile')}>
        <Ionicons name="person-circle" size={20} color="#64748b" />
        <Text style={styles.profileLinkText}>View Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e1a',
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 40,
  },
  statCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    minWidth: 130,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 12,
  },
  sectionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  sectionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  sectionBtnActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  sectionBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  sectionBtnTextActive: {
    color: '#ffffff',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#2563eb',
    paddingVertical: 18,
    borderRadius: 14,
    marginBottom: 14,
  },
  primaryBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#111827',
    paddingVertical: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  secondaryBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2563eb',
  },
  profileLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 24,
  },
  profileLinkText: {
    fontSize: 14,
    color: '#64748b',
  },
});
