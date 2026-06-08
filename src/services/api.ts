import axios from 'axios';
import * as FileSystem from 'expo-file-system';

const BASE_URL = 'https://api.acesatai.com';
const API = `${BASE_URL}/api/v1`;

const USER_ID = 'demo_user_1';

const client = axios.create({
  baseURL: API,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface NextQuestionResponse {
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

export interface SubmitAnswerPayload {
  user_id: string;
  question_id: number;
  section: string;
  selected_answer: string;
  difficulty_level: number;
}

export interface SubmitAnswerResponse {
  was_correct: boolean;
  correct_answer: string;
  new_theta: number;
  xp_total: number;
}

export interface UserProfileResponse {
  id: string;
  email: string;
  math_theta: number;
  verbal_theta: number;
  daily_streak: number;
  xp_total: number;
  preferred_language: string;
}

export interface SnapSolveResponse {
  solution: string;
  extracted_text?: string;
}

export const api = {
  /**
   * Fetch the next adaptive question based on IRT theta level.
   */
  async getNextQuestion(section: string, excludedIds: string = '0'): Promise<NextQuestionResponse> {
    const { data } = await client.get('/next-question', {
      params: {
        user_id: USER_ID,
        section,
        excluded_ids: excludedIds,
      },
    });
    return data;
  },

  /**
   * Submit an answer and get IRT-adjusted result.
   */
  async submitAnswer(payload: SubmitAnswerPayload): Promise<SubmitAnswerResponse> {
    const { data } = await client.post('/submit-answer', payload);
    return data;
  },

  /**
   * Send a photo of a math problem for GPT-4o vision analysis.
   */
  async snapSolve(imageUri: string): Promise<SnapSolveResponse> {
    const formData = new FormData();
    formData.append('user_id', USER_ID);

    const filename = imageUri.split('/').pop() || 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('image', {
      uri: imageUri,
      name: filename,
      type,
    } as any);

    const { data } = await axios.post(`${API}/snap-solve`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
    return data;
  },

  /**
   * Send audio recording to Socratic voice coach.
   */
  async voiceCoach(audioUri: string, section: string): Promise<string> {
    const formData = new FormData();
    formData.append('user_id', USER_ID);
    formData.append('section', section);

    const filename = audioUri.split('/').pop() || 'recording.m4a';
    formData.append('audio', {
      uri: audioUri,
      name: filename,
      type: 'audio/m4a',
    } as any);

    const { data } = await axios.post(`${API}/voice-coach`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
      responseType: 'blob',
    });

    // Save the audio response to a local file for playback
    const fileUri = FileSystem.cacheDirectory + 'coach_response.mp3';
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.readAsDataURL(data);
    });
    await FileSystem.writeAsStringAsync(fileUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return fileUri;
  },

  /**
   * Fetch user profile data.
   */
  async getUserProfile(): Promise<UserProfileResponse> {
    const { data } = await client.get('/user-profile', {
      params: { user_id: USER_ID },
    });
    return data;
  },
};
