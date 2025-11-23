// ToolCallCard Component - Displays individual tool call
import React, { useState } from 'react';
import type { ToolCall } from '../../types/api';
import './ToolCallCard.scss';

interface ToolCallCardProps {
  toolCall: ToolCall;
}

export const ToolCallCard: React.FC<ToolCallCardProps> = ({ toolCall }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="tool-call-card">
      <div
        className="tool-call-card__header"
        onClick={toggleExpand}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleExpand();
          }
        }}
      >
        <div className="tool-call-card__title">
          <span className="tool-call-card__icon">🔧</span>
          <span className="tool-call-card__name">{toolCall.function_name}</span>
        </div>
        <span className="tool-call-card__toggle">
          {isExpanded ? '▼' : '▶'}
        </span>
      </div>

      {isExpanded && (
        <div className="tool-call-card__content">
          <div className="tool-call-card__section">
            <strong className="tool-call-card__label">Arguments:</strong>
            <pre className="tool-call-card__code">
              {JSON.stringify(toolCall.arguments, null, 2)}
            </pre>
          </div>

          {toolCall.result && (
            <div className="tool-call-card__section">
              <strong className="tool-call-card__label">Result:</strong>
              <pre className="tool-call-card__code">
                {typeof toolCall.result === 'string'
                  ? toolCall.result
                  : JSON.stringify(toolCall.result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ToolCallCard;
