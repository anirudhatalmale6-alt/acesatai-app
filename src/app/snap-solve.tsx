import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Image } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';

export default function SnapSolveScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null>(null);
  const [solution, setSolution] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return <View style={styles.centered}><ActivityIndicator color="#2563eb" /></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Ionicons name="camera-outline" size={64} color="#64748b" />
        <Text style={styles.permText}>Camera access is required for Snap & Solve</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePhoto = async () => {
    if (!cameraRef.current) return;
    const result = await cameraRef.current.takePictureAsync({ quality: 0.8, base64: false });
    if (result) {
      setPhoto(result.uri);
      await solveProblem(result.uri);
    }
  };

  const solveProblem = async (uri: string) => {
    setLoading(true);
    setSolution(null);
    try {
      const res = await api.snapSolve(uri);
      setSolution(res.solution || res.extracted_text || JSON.stringify(res));
    } catch {
      setSolution('Failed to process image. Please try again.');
    }
    setLoading(false);
  };

  const reset = () => {
    setPhoto(null);
    setSolution(null);
  };

  if (photo) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Image source={{ uri: photo }} style={styles.preview} />

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>AI is analyzing your problem...</Text>
          </View>
        ) : solution ? (
          <View style={styles.solutionBox}>
            <View style={styles.solutionHeader}>
              <Ionicons name="sparkles" size={20} color="#10b981" />
              <Text style={styles.solutionTitle}>AI Solution</Text>
            </View>
            <Text style={styles.solutionText}>{solution}</Text>
          </View>
        ) : null}

        <TouchableOpacity style={styles.retakeBtn} onPress={reset}>
          <Ionicons name="camera-reverse" size={20} color="#2563eb" />
          <Text style={styles.retakeBtnText}>Take Another Photo</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <View style={styles.cameraContainer}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        <View style={styles.cameraOverlay}>
          <View style={styles.cameraGuide}>
            <Text style={styles.guideText}>Point at a math problem</Text>
          </View>
        </View>
      </CameraView>

      <View style={styles.cameraControls}>
        <TouchableOpacity style={styles.captureBtn} onPress={takePhoto}>
          <View style={styles.captureBtnInner} />
        </TouchableOpacity>
      </View>
    </View>
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
    padding: 32,
  },
  permText: {
    color: '#94a3b8',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  permBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  permBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraGuide: {
    width: '80%',
    height: '50%',
    borderWidth: 2,
    borderColor: 'rgba(37, 99, 235, 0.6)',
    borderRadius: 16,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 16,
  },
  guideText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  cameraControls: {
    backgroundColor: '#0a0e1a',
    paddingVertical: 32,
    alignItems: 'center',
  },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureBtnInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563eb',
  },
  preview: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginBottom: 20,
  },
  loadingBox: {
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 12,
    fontSize: 14,
  },
  solutionBox: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#10b981',
    marginBottom: 20,
  },
  solutionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  solutionTitle: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: '700',
  },
  solutionText: {
    color: '#e2e8f0',
    fontSize: 15,
    lineHeight: 24,
  },
  retakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#111827',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  retakeBtnText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
  },
});
