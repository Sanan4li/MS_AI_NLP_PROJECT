import axios from "axios";

const API_BASE_URL = "http://localhost:3000";
// const API_BASE_URL_FASTAPI = "http://localhost:8000";

export interface AskQuestionResponse {
  success: boolean;
  question: string;
  answer: string;
  sources: Array<string>;
  error?: string;
}

export interface QAHistoryItem {
  id: string;
  question: string;
  answer: string;
  created_at: string;
}

export interface QAHistoryResponse {
  success: boolean;
  history: QAHistoryItem[];
}

export const askQuestion = async (
  question: string
): Promise<AskQuestionResponse> => {
  // const URL = `${API_BASE_URL}/ask`;
  const URL = `${API_BASE_URL}/api/qa/ask`;
  try {
    const response = await axios.post<AskQuestionResponse>(URL, { question });
    return response.data;
  } catch (error) {
    console.error("Error asking question:", error);
    throw error;
  }
};

export const getHistory = async (
  limit: number = 30
): Promise<QAHistoryResponse> => {
  try {
    const response = await axios.get<QAHistoryResponse>(
      `${API_BASE_URL}/api/qa/history?limit=${limit}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching history:", error);
    throw error;
  }
};
