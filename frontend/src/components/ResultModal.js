import React from 'react';
import './ResultModal.css';

function ResultModal({ result, onClose }) {
  const { prediction, explanation } = result;
  const isPlaced = prediction.predicted_status === 'Placed';
  const confidencePct = (prediction.confidence * 100).toFixed(0);

  const allFactors = [...explanation.top_factors].sort(
    (a, b) => Math.abs(b.impact) - Math.abs(a.impact)
  );

  const relevantFactors = allFactors
    .filter((f) => (isPlaced ? f.impact >= 0 : f.impact < 0))
    .slice(0, 5);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>

        <h2 className={isPlaced ? 'status-placed' : 'status-notplaced'}>
          {isPlaced ? 'Placed' : 'Not Placed'}
        </h2>
        <p className="status-subtitle">
          {isPlaced
            ? 'Your profile looks strong for placement.'
            : 'Keep working hard to improve your profile.'}
        </p>

        <div className="modal-body">
          <div className="circle-wrap">
            <div
              className="prob-circle"
              style={{
                background: `conic-gradient(${isPlaced ? '#16a34a' : '#dc2626'} ${prediction.confidence * 360}deg, #2a2a3a 0deg)`
              }}
            >
              <div className="prob-circle-inner">
                <span className="prob-number">{confidencePct}%</span>
                <span className="prob-label">confidence</span>
              </div>
            </div>
          </div>

          <div className="factors-panel">
            <h3>{isPlaced ? 'Your strong areas' : 'Areas to improve'}</h3>
            <p className="panel-hint">
              {isPlaced
                ? 'These factors pushed your prediction toward placement:'
                : 'Focus on improving these key areas:'}
            </p>
            <ul className="factor-list-simple">
              {relevantFactors.map((f) => (
                <li key={f.feature}>{f.feature}</li>
              ))}
            </ul>
          </div>
        </div>

        <details className="all-factors">
          <summary>See all factor impacts (SHAP)</summary>
          <p className="panel-hint">
            How each factor increased (+) or decreased (-) your placement chances:
          </p>
          <div className="factors">
            {allFactors.map((f) => (
              <div key={f.feature} className="factor-row">
                <span className="factor-name">{f.feature}</span>
                <div className="factor-bar-bg">
                  <div
                    className={`factor-bar ${f.impact >= 0 ? 'positive' : 'negative'}`}
                    style={{ width: `${Math.min(Math.abs(f.impact) * 40, 100)}%` }}
                  />
                </div>
                <span className={`factor-value ${f.impact >= 0 ? 'positive-text' : 'negative-text'}`}>
                  {f.impact >= 0 ? '+' : ''}{f.impact}
                </span>
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}

export default ResultModal;