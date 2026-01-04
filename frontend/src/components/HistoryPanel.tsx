import React from "react";
import "./HistoryPanel.css";

interface HistoryItem {
  id: string;
  question: string;
  answer: string;
  created_at: string;
}

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelectItem: (item: HistoryItem) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  onSelectItem,
}) => {
  if (history.length === 0) {
    return (
      <div className="history-panel">
        <h3 className="history-title">Recent Questions</h3>
        <p className="history-empty">
          No history yet. Ask your first question!
        </p>
      </div>
    );
  }

  return (
    <div className="history-panel">
      <h3 className="history-title">Recent Questions</h3>
      <div className="history-list">
        {history.map((item) => (
          <div
            key={item.id}
            className="history-item"
            onClick={() => onSelectItem(item)}
          >
            <p className="history-question">{item.question}</p>
            <span className="history-date">
              {new Date(item.created_at).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
