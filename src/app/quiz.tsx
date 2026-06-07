import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';

interface Question {
  question_id: number;
  section: string;
  domain: string;
  micro_skill: string;
  difficulty_level: number;
  passage: string | null;
  question_text: string;
  options: { A: string; B: string; C: string; D: string };
  socratic_hints: string[];
}

interface SubmitResult {
  was_correct: boolean;
  correct_answer: string;
  new_theta: number;
  xp_total: number;
}

export default function QuizScreen() {
  const { section } = useLocalSearchParams<{ section: string }>();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [excludedIds, setExcludedIds] = useState<number[]>([]);
  const [hintIndex, setHintIndex] = useState(0);

  useEffect(() => {
    fetchNext();
  }, []);

  const fetchNext = async () => {
    setLoading(true);
    setSelectedAnswer(null);
    setResult(null);
    setHintIndex(0);
    try {
      const data = await api.getNextQuestion(section || 'Math', excludedIds.join(',') || '0');
      setQuestion(data);
      setExcludedIds((prev) => [...prev, data.question_id]);
    } catch {
      // Handle error silently
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!selectedAnswer || !question) return;
    try {
      const res = await api.submitAnswer({
        user_id: 'demo_user_1',
        question_id: question.question_id,
        section: section || 'Math',
        selected_answer: selectedAnswer,
        difficulty_level: question.difficulty_level,
      });
      setResult(res);
    } catch {
      // Handle error silently
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading question...</Text>
      </View>
    );
  }

  if (!question) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No questions available.</Text>
      </View>
    );
  }

  const optionKeys = ['A', 'B', 'C', 'D'] as const;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Difficulty Badge */}
      <View style={styles.metaRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Level {question.difficulty_level}</Text>
        </View>
        <Text style={styles.domainText}>{question.domain}</Text>
      </View>

      {/* Passage */}
      {question.passage && (
        <View style={styles.passageBox}>
          <Text style={styles.passageText}>{question.passage}</Text>
        </View>
      )}

      {/* Question */}
      <Text style={styles.questionText}>{question.question_text}</Text>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {optionKeys.map((key) => {
          const isSelected = selectedAnswer === key;
          const isCorrect = result && result.correct_answer.toUpperCase() === key;
          const isWrong = result && isSelected && !result.was_correct;

          let optionStyle = styles.option;
          if (result && isCorrect) optionStyle = { ...styles.option, ...styles.optionCorrect };
          else if (isWrong) optionStyle = { ...styles.option, ...styles.optionWrong };
          else if (isSelected) optionStyle = { ...styles.option, ...styles.optionSelected };

          return (
            <TouchableOpacity
              key={key}
              style={optionStyle}
              onPress={() => !result && setSelectedAnswer(key)}
              disabled={!!result}
            >
              <Text style={styles.optionLetter}>{key}</Text>
              <Text style={styles.optionText}>{question.options[key]}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Result Feedback */}
      {result && (
        <View style={[styles.resultBox, result.was_correct ? styles.resultCorrect : styles.resultWrong]}>
          <Ionicons
            name={result.was_correct ? 'checkmark-circle' : 'close-circle'}
            size={24}
            color={result.was_correct ? '#10b981' : '#ef4444'}
          />
          <Text style={[styles.resultText, { color: result.was_correct ? '#10b981' : '#ef4444' }]}>
            {result.was_correct ? 'Correct!' : `Incorrect. Answer: ${result.correct_answer}`}
          </Text>
          <Text style={styles.thetaText}>Skill Level: {result.new_theta}</Text>
        </View>
      )}

      {/* Socratic Hints */}
      {result && !result.was_correct && question.socratic_hints && question.socratic_hints.length > 0 && (
        <View style={styles.hintBox}>
          <Text style={styles.hintTitle}>Socratic Hint</Text>
          <Text style={styles.hintText}>
            {question.socratic_hints[hintIndex] || question.socratic_hints[0]}
          </Text>
          {hintIndex < question.socratic_hints.length - 1 && (
            <TouchableOpacity onPress={() => setHintIndex((i) => i + 1)} style={styles.hintBtn}>
              <Text style={styles.hintBtnText}>Next Hint</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Action Buttons */}
      {!result ? (
        <TouchableOpacity
          style={[styles.submitBtn, !selectedAnswer && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!selectedAnswer}
        >
          <Text style={styles.submitBtnText}>Submit Answer</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.nextBtn} onPress={fetchNext}>
          <Text style={styles.nextBtnText}>Next Question</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e1a',
  },
  content: {
    padding: 24,
    paddingBottom: 60,
  },
  centered: {
    flex: 1,
    backgroundColor: '#0a0e1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#64748b',
    marginTop: 12,
    fontSize: 14,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  badge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '700',
  },
  domainText: {
    color: '#64748b',
    fontSize: 13,
  },
  passageBox: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  passageText: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 22,
  },
  questionText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 14,
  },
  optionSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#1e3a5f',
  },
  optionCorrect: {
    borderColor: '#10b981',
    backgroundColor: '#064e3b',
  },
  optionWrong: {
    borderColor: '#ef4444',
    backgroundColor: '#450a0a',
  },
  optionLetter: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '800',
    width: 24,
  },
  optionText: {
    color: '#e2e8f0',
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },
  resultBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  resultCorrect: {
    backgroundColor: '#064e3b',
  },
  resultWrong: {
    backgroundColor: '#450a0a',
  },
  resultText: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  thetaText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  hintBox: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  hintTitle: {
    color: '#f59e0b',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  hintText: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 22,
  },
  hintBtn: {
    marginTop: 12,
  },
  hintBtnText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 14,
  },
  submitBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.4,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10b981',
    paddingVertical: 18,
    borderRadius: 14,
  },
  nextBtnText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
});
