import React, { useState } from 'react';
import './App.css';
import ResultModal from './components/ResultModal';

// Fields match api.py exactly:
// cgpa, internships, projects, certifications, aptitude,
// softskills, extracurricular, training, ssc, hsc
const formFields = [
  { name: 'cgpa',            label: 'CGPA',                      type: 'number', step: '0.01', placeholder: 'e.g. 8.5',  hint: 'Out of 10',              min: 0, max: 10  },
  { name: 'internships',     label: 'Internships',               type: 'number', step: '1',    placeholder: 'e.g. 2',    hint: 'Number of internships',   min: 0           },
  { name: 'projects',        label: 'Projects',                  type: 'number', step: '1',    placeholder: 'e.g. 3',    hint: 'Max 20 projects',         min: 0, max: 20  },
  { name: 'certifications',  label: 'Certifications',            type: 'number', step: '1',    placeholder: 'e.g. 2',    hint: 'Total certifications',    min: 0           },
  { name: 'aptitude',        label: 'Aptitude Score',            type: 'number', step: '0.1',  placeholder: 'e.g. 85.5', hint: 'Score out of 100',        min: 0, max: 100 },
  { name: 'softskills',      label: 'Soft Skills Rating',        type: 'number', step: '0.1',  placeholder: 'e.g. 4.2',  hint: 'Rating out of 5',         min: 0, max: 5   },
  { name: 'extracurricular', label: 'Extracurricular Activities',type: 'select',               placeholder: 'Select',     hint: '0 = No,  1 = Yes'                        },
  { name: 'training',        label: 'Placement Training',        type: 'select',               placeholder: 'Select',     hint: '0 = No,  1 = Yes'                        },
  { name: 'ssc',             label: 'SSC Marks (%)',             type: 'number', step: '0.1',  placeholder: 'e.g. 88.5', hint: '10th grade percentage',   min: 0, max: 100 },
  { name: 'hsc',             label: 'HSC Marks (%)',             type: 'number', step: '0.1',  placeholder: 'e.g. 82.0', hint: '12th grade percentage',   min: 0, max: 100 },
];

function App() {
  const [formData, setFormData] = useState({
    cgpa: '', internships: '', projects: '', certifications: '',
    aptitude: '', softskills: '', extracurricular: '', training: '', ssc: '', hsc: ''
  });

  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear the error for this field as user types
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errors = {};

    formFields.forEach((field) => {
      const val = formData[field.name];
      if (val === '' || val === null || val === undefined) {
        errors[field.name] = 'This field is required.';
        return;
      }

      if (field.type === 'select') {
        if (val !== '0' && val !== '1') {
          errors[field.name] = 'Please select 0 (No) or 1 (Yes).';
        }
        return;
      }

      const num = parseFloat(val);
      if (isNaN(num)) { errors[field.name] = 'Must be a number.'; return; }
      if (num < 0)    { errors[field.name] = 'Value cannot be negative.'; return; }
      if (field.max !== undefined && num > field.max) {
        errors[field.name] = `Maximum allowed value is ${field.max}.`;
      }
    });

    return errors;
  };

  const handleReset = () => {
    setFormData({
      cgpa: '', internships: '', projects: '', certifications: '',
      aptitude: '', softskills: '', extracurricular: '', training: '', ssc: '', hsc: ''
    });
    setResultData(null);
    setError(null);
    setFieldErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Run validation before calling the API
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setLoading(true);

    try {
      const params = new URLSearchParams(formData).toString();

    const API = process.env.REACT_APP_API_URL || 'http://localhost:8000';

      const [predictRes, explainRes] = await Promise.all([
        fetch(`${API}/predict?${params}`),
        fetch(`${API}/explain?${params}`)
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
      {/* Animated background */}
      <div className="bg-canvas" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="app-content">
        {/* Header */}
        <div className="header">
          <h1 className="title">Placement Predictor</h1>
          <p className="subtitle">
            Enter your academic profile and get an instant, AI-driven analysis
            of your campus placement probability.
          </p>
        </div>

        {/* Form */}
        <div className="form-container">
          <div className="form-section-title">Academic Profile</div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              {formFields.map((field) => (
                <div className="form-group" key={field.name}>
                  <label className="form-label" htmlFor={field.name}>
                    {field.label}
                  </label>
                  <div className="input-wrapper">
                    {field.type === 'select' ? (
                      <select
                        id={field.name}
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleChange}
                        className={`form-input${fieldErrors[field.name] ? ' input-error' : ''}`}
                        required
                      >
                        <option value="">Select…</option>
                        <option value="0">0 — No</option>
                        <option value="1">1 — Yes</option>
                      </select>
                    ) : (
                      <input
                        id={field.name}
                        name={field.name}
                        type={field.type}
                        step={field.step}
                        min={field.min}
                        max={field.max}
                        placeholder={field.placeholder}
                        value={formData[field.name]}
                        onChange={handleChange}
                        className={`form-input${fieldErrors[field.name] ? ' input-error' : ''}`}
                        required
                      />
                    )}
                  </div>
                  {fieldErrors[field.name]
                    ? <span className="field-error">{fieldErrors[field.name]}</span>
                    : <span className="input-hint">{field.hint}</span>
                  }
                </div>
              ))}
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="btn-group">
              <button type="submit" className="btn-submit" disabled={loading} id="predict-btn">
                <span>
                  {loading ? (
                    <>
                      <div className="spinner" />
                      Analyzing Profile…
                    </>
                  ) : (
                    <>✨ Predict My Placement</>
                  )}
                </span>
              </button>
              <button type="button" className="btn-reset" onClick={handleReset} disabled={loading} id="reset-btn">
                ↺ Reset
              </button>
            </div>
          </form>
        </div>
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
