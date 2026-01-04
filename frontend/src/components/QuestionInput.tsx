import React, { useState } from "react";
import "./QuestionInput.css";

interface QuestionInputProps {
  onSubmit: (question: string) => void;
  loading: boolean;
}

export const QuestionInput: React.FC<QuestionInputProps> = ({
  onSubmit,
  loading,
}) => {
  const [question, setQuestion] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && !loading) {
      onSubmit(question.trim());
      setQuestion("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="question-input-form">
      <div className="input-wrapper">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about your documents..."
          className="question-input"
          disabled={loading}
        />
        <button
          type="submit"
          className="submit-button"
          disabled={!question.trim() || loading}
        >
          {loading ? "Processing..." : "Ask"}
        </button>
      </div>
    </form>
  );
};
