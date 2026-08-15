from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pickle
import numpy as np
import shap

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = pickle.load(open("model.pkl", "rb"))

@app.get("/")
def home():
    return {"message": "Placement Predictor API Running"}

@app.get("/predict")
def predict(
    cgpa: float,
    internships: int,
    projects: int,
    certifications: int,
    aptitude: float,
    softskills: float,
    extracurricular: int,
    training: int,
    ssc: float,
    hsc: float
):
    data = np.array([[cgpa, internships, projects, certifications,
                       aptitude, softskills, extracurricular, training,
                       ssc, hsc]])
    proba = model.predict_proba(data)[0][1]
    prediction = int(proba >= 0.5)
    return {
        "Placement Probability": round(float(proba), 3),
        "Predicted Status": "Placed" if prediction == 1 else "Not Placed"
    }



background = pickle.load(open("background.pkl", "rb"))
feature_names = ['CGPA','Internships','Projects','Workshops/Certifications',
                  'AptitudeTestScore','SoftSkillsRating','ExtracurricularActivities',
                  'PlacementTraining','SSC_Marks','HSC_Marks']
explainer = shap.LinearExplainer(model, background)

@app.get("/explain")
def explain(
    cgpa: float, internships: int, projects: int, certifications: int,
    aptitude: float, softskills: float, extracurricular: int,
    training: int, ssc: float, hsc: float
):
    data = np.array([[cgpa, internships, projects, certifications,
                       aptitude, softskills, extracurricular, training,
                       ssc, hsc]])
    shap_values = explainer.shap_values(data)[0]
    result = [
        {"feature": name, "impact": round(float(val), 4)}
        for name, val in zip(feature_names, shap_values)
    ]
    result.sort(key=lambda x: abs(x["impact"]), reverse=True)
    return {"top_factors": result[:5]}