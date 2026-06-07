import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';

interface UserProfile {
  id: string;
  email: string;
  math_theta: number;
  verbal_theta: number;
  daily_streak: number;
  xp_total: number;
  preferred_language: string;
}

const LANGUAGES = ['English', 'Spanish', 'French', 'Hindi', 'Arabic'];

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLang, setSelectedLang] = useState('English');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await api.getUserProfile();
      setProfile(data);
      setSelectedLang(data.preferred_language || 'English');
    } catch {
      // Profile unavailable
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const mathTheta = profile?.math_theta ?? 2.5;
  const verbalTheta = profile?.verbal_theta ?? 2.5;

  return (
    <View style={styles.container}>
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color="#2563eb" />
        </View>
        <Text style={styles.userId}>{profile?.email || 'Student'}</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Ionicons name="flame" size={24} color="#f59e0b" />
          <Text style={styles.statValue}>{profile?.daily_streak ?? 0}</Text>
          <Text style={styles.statLabel}>Streak</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="star" size={24} color="#10b981" />
          <Text style={styles.statValue}>{profile?.xp_total ?? 0}</Text>
          <Text style={styles.statLabel}>XP</Text>
        </View>
      </View>

      {/* Theta Scores */}
      <Text style={styles.sectionHeader}>Skill Levels (IRT Theta)</Text>
      <View style={styles.thetaRow}>
        <View style={styles.thetaCard}>
          <Ionicons name="calculator" size={20} color="#2563eb" />
          <Text style={styles.thetaLabel}>Math</Text>
          <Text style={styles.thetaValue}>{mathTheta.toFixed(2)}</Text>
          <View style={styles.thetaBar}>
            <View style={[styles.thetaFill, { width: `${(mathTheta / 5) * 100}%` }]} />
          </View>
        </View>
        <View style={styles.thetaCard}>
          <Ionicons name="book" size={20} color="#10b981" />
          <Text style={styles.thetaLabel}>Verbal</Text>
          <Text style={styles.thetaValue}>{verbalTheta.toFixed(2)}</Text>
          <View style={styles.thetaBar}>
            <View style={[styles.thetaFill, { width: `${(verbalTheta / 5) * 100}%`, backgroundColor: '#10b981' }]} />
          </View>
        </View>
      </View>

      {/* Language Selector */}
      <Text style={styles.sectionHeader}>Preferred Language</Text>
      <View style={styles.langRow}>
        {LANGUAGES.map((lang) => (
          <TouchableOpacity
            key={lang}
            style={[styles.langBtn, selectedLang === lang && styles.langBtnActive]}
            onPress={() => setSelectedLang(lang)}
          >
            <Text style={[styles.langBtnText, selectedLang === lang && styles.langBtnTextActive]}>
              {lang}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e1a',
    padding: 24,
  },
  centered: {
    flex: 1,
    backgroundColor: '#0a0e1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2563eb',
    marginBottom: 12,
  },
  userId: {
    color: '#94a3b8',
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 32,
  },
  statItem: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    minWidth: 120,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  sectionHeader: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  thetaRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  thetaCard: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  thetaLabel: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 8,
  },
  thetaValue: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 10,
  },
  thetaBar: {
    height: 6,
    backgroundColor: '#1e293b',
    borderRadius: 3,
    overflow: 'hidden',
  },
  thetaFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 3,
  },
  langRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  langBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  langBtnActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  langBtnText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
  langBtnTextActive: {
    color: '#ffffff',
  },
});
