import React, { useState } from 'react';
import './App.css';
import ResultModal from './components/ResultModal';

const formFields = [
  { name: 'cgpa', label: 'CGPA', type: 'number', step: '0.01', placeholder: 'e.g. 8.5', hint: 'Out of 10' },
  { name: 'internships', label: 'Internships', type: 'number', step: '1', placeholder: 'e.g. 2', hint: 'Number of internships' },
  { name: 'projects', label: 'Projects', type: 'number', step: '1', placeholder: 'e.g. 3', hint: 'Number of academic/personal projects' },
  { name: 'certifications', label: 'Certifications / Workshops', type: 'number', step: '1', placeholder: 'e.g. 2', hint: 'Total certifications' },
  { name: 'aptitude', label: 'Aptitude Test Score', type: 'number', step: '0.1', placeholder: 'e.g. 85.5', hint: 'Percentage or score out of 100' },
  { name: 'softskills', label: 'Soft Skills Rating', type: 'number', step: '0.1', placeholder: 'e.g. 4.2', hint: 'Rating out of 5' },
  { name: 'extracurricular', label: 'Extracurricular Activities', type: 'number', step: '1', placeholder: '0 (No) or 1 (Yes)', hint: '0 = No, 1 = Yes' },
  { name: 'training', label: 'Placement Training', type: 'number', step: '1', placeholder: '0 (No) or 1 (Yes)', hint: '0 = No, 1 = Yes' },
  { name: 'ssc', label: 'SSC Marks (%)', type: 'number', step: '0.1', placeholder: 'e.g. 88.5', hint: '10th grade percentage' },
  { name: 'hsc', label: 'HSC Marks (%)', type: 'number', step: '0.1', placeholder: 'e.g. 82.0', hint: '12th grade percentage' }
];

function App() {
  const [formData, setFormData] = useState({
    cgpa: '', internships: '', projects: '', certifications: '',
    aptitude: '', softskills: '', extracurricular: '', training: '', ssc: '', hsc: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleReset = () => {
    setFormData({
      cgpa: '', internships: '', projects: '', certifications: '',
      aptitude: '', softskills: '', extracurricular: '', training: '', ssc: '', hsc: ''
    });
    setResultData(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const params = new URLSearchParams(formData).toString();
      
      const [predictRes, explainRes] = await Promise.all([
        fetch(`http://localhost:8000/predict?${params}`),
        fetch(`http://localhost:8000/explain?${params}`)
      ]);

      if (!predictRes.ok || !explainRes.ok) {
        throw new Error('Failed to fetch from backend. Make sure the API is running.');
      }

      const prediction = await predictRes.json();
      const explanation = await explainRes.json();

      setResultData({ prediction, explanation });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="header">
        <h1 className="title">Placement Predictor</h1>
        <p className="subtitle">AI-powered analysis of your campus placement probability</p>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {formFields.map((field) => (
              <div className="form-group" key={field.name}>
                <label className="form-label" htmlFor={field.name}>{field.label}</label>
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  step={field.step}
                  placeholder={field.placeholder}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
                <span className="input-hint">{field.hint}</span>
              </div>
            ))}
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="btn-group">
            <button type="submit" className="btn-submit" disabled={loading}>
              <span>{loading ? 'Analyzing Profile...' : 'Predict My Placement'}</span>
            </button>
            <button type="button" className="btn-reset" onClick={handleReset} disabled={loading}>
              Reset
            </button>
          </div>
        </form>
      </div>

      {resultData && (
        <ResultModal 
          result={resultData} 
          onClose={() => setResultData(null)} 
        />
      )}
    </div>
  );
}

export default App;
