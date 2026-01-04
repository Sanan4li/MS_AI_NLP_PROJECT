import axios from "axios";

const API_BASE_URL = "http://localhost:3000";

export interface AskQuestionResponse {
  success: boolean;
  question: string;
  answer: string;
  sources: Array<{
    content: string;
    document_id: string;
    chunk_index: number;
  }>;
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
  try {
    const response = await axios.post<AskQuestionResponse>(
      `${API_BASE_URL}/api/qa/ask`,
      { question }
    );
    return response.data;
  } catch (error) {
    console.error("Error asking question:", error);
    throw error;
  }
};

export const getHistory = async (
  limit: number = 10
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
