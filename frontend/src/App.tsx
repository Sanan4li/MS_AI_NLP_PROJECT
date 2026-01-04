import { useEffect, useState } from "react";
import "./App.css";
import { AnswerDisplay } from "./components/AnswerDisplay";
import { HistoryPanel } from "./components/HistoryPanel";
import { QuestionInput } from "./components/QuestionInput";
import {
  askQuestion,
  type AskQuestionResponse,
  getHistory,
  type QAHistoryItem,
} from "./services/api";

interface CurrentAnswer {
  question: string;
  answer: string;
  sources?: Array<{
    content: string;
    document_id: string;
    chunk_index: number;
  }>;
}

function App() {
  const [loading, setLoading] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState<CurrentAnswer | null>(
    null
  );
  const [history, setHistory] = useState<QAHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await getHistory(10);
      if (response.success) {
        setHistory(response.history);
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  const handleQuestionSubmit = async (question: string) => {
    setLoading(true);
    setError(null);

    try {
      const response: AskQuestionResponse = await askQuestion(question);

      if (response.success) {
        setCurrentAnswer({
          question: response.question,
          answer: response.answer,
          sources: response.sources,
        });
        // Refresh history
        await fetchHistory();
      } else {
        setError(response.error || "Failed to get answer");
      }
    } catch (err) {
      console.error("Error:", err);
      setError(
        "Failed to connect to the server. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryItemClick = (item: QAHistoryItem) => {
    setCurrentAnswer({
      question: item.question,
      answer: item.answer,
    });
  };

  return (
    <div className="app">
      <div className="app-container">
        <header className="app-header">
          <h1 className="app-title">Document Q&A System</h1>
          <p className="app-subtitle">
            Ask questions about your documents powered by AI
          </p>
        </header>

        <div className="app-content">
          <div className="main-section">
            <QuestionInput onSubmit={handleQuestionSubmit} loading={loading} />

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            {loading && (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p className="loading-text">Thinking...</p>
              </div>
            )}

            {!loading && currentAnswer && (
              <AnswerDisplay
                question={currentAnswer.question}
                answer={currentAnswer.answer}
                sources={currentAnswer.sources}
              />
            )}
          </div>

          <aside className="sidebar">
            <HistoryPanel
              history={history}
              onSelectItem={handleHistoryItemClick}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}

export default App;
