import React from "react";
import "./AnswerDisplay.css";

interface Source {
  content: string;
  document_id: string;
  chunk_index: number;
}

interface AnswerDisplayProps {
  question: string;
  answer: string;
  sources?: Source[];
}

export const AnswerDisplay: React.FC<AnswerDisplayProps> = ({
  question,
  answer,
  sources,
}) => {
  return (
    <div className="answer-display">
      <div className="question-section">
        <h3 className="section-title">Question</h3>
        <p className="question-text">{question}</p>
      </div>

      <div className="answer-section">
        <h3 className="section-title">Answer</h3>
        <p className="answer-text">{answer}</p>
      </div>

      {sources && sources.length > 0 && (
        <div className="sources-section">
          <h3 className="section-title">Sources</h3>
          <div className="sources-list">
            {sources.map((source, index) => (
              <div key={index} className="source-item">
                <div className="source-header">
                  <span className="source-number">Source {index + 1}</span>
                  <span className="source-meta">
                    Chunk {source.chunk_index}
                  </span>
                </div>
                <p className="source-content">
                  {source.content.substring(0, 200)}...
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
