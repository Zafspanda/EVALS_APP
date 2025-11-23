// SessionContext Component - Timeline of previous turns in conversation
import React, { useState } from 'react';
import type { PreviousTurn } from '../../types/api';
import './SessionContext.scss';

interface SessionContextProps {
  previousTurns: PreviousTurn[];
}

export const SessionContext: React.FC<SessionContextProps> = ({ previousTurns }) => {
  const [expandedTurns, setExpandedTurns] = useState<Set<number>>(new Set());

  const toggleTurn = (turnNumber: number) => {
    const newExpanded = new Set(expandedTurns);
    if (newExpanded.has(turnNumber)) {
      newExpanded.delete(turnNumber);
    } else {
      newExpanded.add(turnNumber);
    }
    setExpandedTurns(newExpanded);
  };

  if (!previousTurns || previousTurns.length === 0) {
    return null;
  }

  return (
    <div className="session-context">
      <h3 className="session-context__title">📜 Previous Context</h3>
      <div className="session-context__timeline">
        {previousTurns.map((turn) => {
          const isExpanded = expandedTurns.has(turn.turn_number);

          return (
            <div
              key={turn.turn_number}
              className="session-context__turn"
            >
              <div
                className="session-context__turn-header"
                onClick={() => toggleTurn(turn.turn_number)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleTurn(turn.turn_number);
                  }
                }}
              >
                <span className="session-context__turn-indicator">●</span>
                <span className="session-context__turn-number">
                  Turn {turn.turn_number}
                </span>
                <span className="session-context__toggle">
                  {isExpanded ? '▼' : '▶'}
                </span>
              </div>

              {isExpanded && (
                <div className="session-context__turn-content">
                  <div className="session-context__message">
                    <strong>👤 User:</strong>
                    <p>{turn.user_message}</p>
                  </div>
                  <div className="session-context__message">
                    <strong>🤖 AI:</strong>
                    <p>{turn.ai_response}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SessionContext;
