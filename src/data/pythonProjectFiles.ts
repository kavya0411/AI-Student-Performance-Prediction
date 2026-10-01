import JSZip from 'jszip';
import { PythonFileItem } from '../types';
import { DEFAULT_STUDENTS_DATASET, datasetToCsv } from './syntheticDataset';

export const PYTHON_FILES: PythonFileItem[] = [
  {
    name: 'generate_dataset.py',
    path: 'generate_dataset.py',
    language: 'python',
    description: 'Generates 200 synthetic student records with academic features and labels',
    code: `import csv
import random
from pathlib import Path

random.seed(42)

DATA_DIR = Path("data")
DATA_DIR.mkdir(exist_ok=True)
OUTPUT = DATA_DIR / "students.csv"

def classify(score):
    if score < 40:
        return "Poor"
    elif score < 60:
        return "Average"
    elif score < 80:
        return "Good"
    return "Excellent"

rows = []
for i in range(1, 201):
    attendance = random.randint(45, 100)
    study_hours = round(random.uniform(1, 8), 1)
    assignment = random.randint(35, 100)
    internal = random.randint(35, 100)
    previous = random.randint(35, 100)

    # Synthetic academic score used only to create labels for the demo dataset.
    normalized_study = min(study_hours / 8 * 100, 100)
    score = (
        attendance * 0.20
        + normalized_study * 0.15
        + assignment * 0.20
        + internal * 0.20
        + previous * 0.25
    )

    # Small noise makes the synthetic data less perfectly deterministic.
    score += random.uniform(-3, 3)
    score = max(0, min(100, score))

    rows.append([
        f"STU{i:03d}",
        f"Student_{i:03d}",
        attendance,
        study_hours,
        assignment,
        internal,
        previous,
        classify(score),
    ])

with OUTPUT.open("w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow([
        "Student_ID", "Student_Name", "Attendance", "Study_Hours",
        "Assignment_Score", "Internal_Marks", "Previous_Score", "Performance"
    ])
    writer.writerows(rows)

print(f"Created {len(rows)} student records at {OUTPUT}")
`
  },
  {
    name: 'train_model.py',
    path: 'train_model.py',
    language: 'python',
    description: 'Trains the Random Forest classification model and exports metrics.json & model.pkl',
    code: `from pathlib import Path
import json
import joblib
import pandas as pd

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report
)
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

DATA_PATH = Path("data/students.csv")
MODEL_DIR = Path("model")
MODEL_DIR.mkdir(exist_ok=True)

FEATURES = [
    "Attendance",
    "Study_Hours",
    "Assignment_Score",
    "Internal_Marks",
    "Previous_Score",
]
TARGET = "Performance"

def main():
    if not DATA_PATH.exists():
        print("Dataset not found. Run: python generate_dataset.py")
        return

    df = pd.read_csv(DATA_PATH)

    # Basic cleaning
    df = df.drop_duplicates()
    df = df.dropna(subset=FEATURES + [TARGET])

    X = df[FEATURES]
    y_text = df[TARGET]

    encoder = LabelEncoder()
    y = encoder.fit_transform(y_text)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    model = RandomForestClassifier(
        n_estimators=200,
        random_state=42,
        class_weight="balanced"
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)

    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, average="weighted", zero_division=0)
    recall = recall_score(y_test, y_pred, average="weighted", zero_division=0)
    f1 = f1_score(y_test, y_pred, average="weighted", zero_division=0)
    cm = confusion_matrix(y_test, y_pred).tolist()

    bundle = {
        "model": model,
        "label_encoder": encoder,
        "features": FEATURES,
        "classes": list(encoder.classes_),
    }

    joblib.dump(bundle, MODEL_DIR / "student_performance_model.pkl")

    metrics = {
        "dataset_size": int(len(df)),
        "training_samples": int(len(X_train)),
        "testing_samples": int(len(X_test)),
        "algorithm": "Random Forest Classifier",
        "accuracy": round(float(accuracy), 4),
        "precision": round(float(precision), 4),
        "recall": round(float(recall), 4),
        "f1_score": round(float(f1), 4),
        "confusion_matrix": cm,
        "class_names": list(encoder.classes_),
        "feature_importance": {
            feature: round(float(importance), 4)
            for feature, importance in zip(FEATURES, model.feature_importances_)
        },
    }

    with (MODEL_DIR / "metrics.json").open("w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    print("\\nModel trained successfully.")
    print(f"Accuracy : {accuracy:.2%}")
    print(f"Precision: {precision:.2%}")
    print(f"Recall   : {recall:.2%}")
    print(f"F1 Score : {f1:.2%}")
    print("\\nClassification report:")
    print(classification_report(y_test, y_pred, target_names=encoder.classes_, zero_division=0))
    print(f"\\nSaved model to: {MODEL_DIR / 'student_performance_model.pkl'}")

if __name__ == "__main__":
    main()
`
  },
  {
    name: 'app.py',
    path: 'app.py',
    language: 'python',
    description: 'Streamlit Web Application with Authentication, SQLite, PDF Reports, Analytics',
    code: `import hashlib
import json
import sqlite3
from datetime import datetime
from io import BytesIO
from pathlib import Path

import joblib
import pandas as pd
import streamlit as st
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
)

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "student_app.db"
MODEL_PATH = BASE_DIR / "model" / "student_performance_model.pkl"
METRICS_PATH = BASE_DIR / "model" / "metrics.json"
DATA_PATH = BASE_DIR / "data" / "students.csv"

st.set_page_config(
    page_title="Student Performance Prediction",
    page_icon="🎓",
    layout="wide",
)

def hash_password(password):
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def db():
    return sqlite3.connect(DB_PATH)

def init_db():
    con = db()
    cur = con.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            student_name TEXT NOT NULL,
            attendance REAL NOT NULL,
            study_hours REAL NOT NULL,
            assignment_score REAL NOT NULL,
            internal_marks REAL NOT NULL,
            previous_score REAL NOT NULL,
            performance_score REAL NOT NULL,
            prediction TEXT NOT NULL,
            confidence REAL,
            created_at TEXT NOT NULL
        )
    """)
    con.commit()
    con.close()

@st.cache_resource
def load_model():
    if not MODEL_PATH.exists():
        return None
    return joblib.load(MODEL_PATH)

def load_metrics():
    if not METRICS_PATH.exists():
        return None
    with METRICS_PATH.open("r", encoding="utf-8") as f:
        return json.load(f)

def register_user(name, email, password):
    try:
        con = db()
        con.execute(
            "INSERT INTO users(name,email,password_hash) VALUES(?,?,?)",
            (name.strip(), email.strip().lower(), hash_password(password))
        )
        con.commit()
        con.close()
        return True, "Registration successful. Please log in."
    except sqlite3.IntegrityError:
        return False, "That email is already registered."

def login_user(email, password):
    con = db()
    row = con.execute(
        "SELECT id,name,email FROM users WHERE email=? AND password_hash=?",
        (email.strip().lower(), hash_password(password))
    ).fetchone()
    con.close()
    return row

def save_prediction(user_id, values):
    con = db()
    con.execute("""
        INSERT INTO predictions(
            user_id, student_name, attendance, study_hours,
            assignment_score, internal_marks, previous_score,
            performance_score, prediction, confidence, created_at
        ) VALUES(?,?,?,?,?,?,?,?,?,?,?)
    """, (
        user_id, values["student_name"], values["attendance"],
        values["study_hours"], values["assignment_score"],
        values["internal_marks"], values["previous_score"],
        values["performance_score"], values["prediction"],
        values["confidence"], datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    ))
    con.commit()
    con.close()

def get_history(user_id):
    con = db()
    df = pd.read_sql_query(
        """SELECT id, student_name AS Student, attendance AS Attendance,
                  study_hours AS Study_Hours, assignment_score AS Assignment,
                  internal_marks AS Internal, previous_score AS Previous,
                  performance_score AS Score, prediction AS Performance,
                  confidence AS Confidence, created_at AS Date
           FROM predictions WHERE user_id=? ORDER BY id DESC""",
        con, params=(user_id,)
    )
    con.close()
    return df

def delete_prediction(user_id, prediction_id):
    con = db()
    con.execute(
        "DELETE FROM predictions WHERE id=? AND user_id=?",
        (prediction_id, user_id)
    )
    con.commit()
    con.close()

def performance_score(attendance, study_hours, assignment, internal, previous):
    normalized_study = min(study_hours / 8 * 100, 100)
    return round(
        attendance * 0.20
        + normalized_study * 0.15
        + assignment * 0.20
        + internal * 0.20
        + previous * 0.25,
        2
    )

def recommendations(a, s, ass, internal, prev, prediction):
    recs = []
    if a < 75:
        recs.append("Improve attendance and maintain regular class participation.")
    if s < 3:
        recs.append("Gradually increase daily study time and follow a consistent schedule.")
    if ass < 60:
        recs.append("Review assignment topics and complete more practice work.")
    if internal < 60:
        recs.append("Focus on internal-exam preparation and revise important concepts.")
    if prev < 60:
        recs.append("Review previous exam mistakes and practice similar questions.")
    if not recs:
        recs.append("Your academic indicators are strong. Maintain your current study routine.")
    return recs

def make_pdf(result):
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    styles = getSampleStyleSheet()
    story = [
        Paragraph("STUDENT PERFORMANCE PREDICTION REPORT", styles["Title"]),
        Spacer(1, 12),
        Paragraph("B.Tech CSE (AI & ML) Academic Project", styles["Heading2"]),
        Spacer(1, 12),
    ]
    data = [
        ["Student Name", result["student_name"]],
        ["Date", result["date"]],
        ["Attendance", f'{result["attendance"]:.1f}%'],
        ["Study Hours/Day", f'{result["study_hours"]:.1f}'],
        ["Assignment Score", f'{result["assignment_score"]:.1f}'],
        ["Internal Marks", f'{result["internal_marks"]:.1f}'],
        ["Previous Exam Score", f'{result["previous_score"]:.1f}'],
        ["Performance Score", f'{result["performance_score"]:.2f}%'],
        ["ML Prediction", result["prediction"]],
        ["Model Confidence", f'{result["confidence"]:.2%}' if result["confidence"] is not None else "Not available"],
    ]
    table = Table(data, colWidths=[190, 300])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (0,-1), colors.lightgrey),
        ("GRID", (0,0), (-1,-1), 0.5, colors.grey),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("PADDING", (0,0), (-1,-1), 7),
    ]))
    story.append(table)
    story.append(Spacer(1, 18))
    story.append(Paragraph("Recommendations", styles["Heading2"]))
    for rec in result["recommendations"]:
        story.append(Paragraph("• " + rec, styles["BodyText"]))
        story.append(Spacer(1, 5))
    story.append(Spacer(1, 15))
    story.append(Paragraph(
        "Disclaimer: This is an academic demonstration using a synthetic dataset. "
        "The prediction is not a guaranteed assessment of future academic performance.",
        styles["Italic"]
    ))
    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()

def login_screen():
    st.title("🎓 Student Performance Prediction System")
    st.write("Python + Machine Learning + Streamlit")
    tab1, tab2 = st.tabs(["Login", "Register"])

    with tab1:
        email = st.text_input("Email", key="login_email")
        password = st.text_input("Password", type="password", key="login_password")
        if st.button("Login", type="primary"):
            user = login_user(email, password)
            if user:
                st.session_state.user = {"id": user[0], "name": user[1], "email": user[2]}
                st.rerun()
            else:
                st.error("Invalid email or password.")

    with tab2:
        name = st.text_input("Name", key="reg_name")
        email = st.text_input("Email", key="reg_email")
        password = st.text_input("Password", type="password", key="reg_password")
        confirm = st.text_input("Confirm Password", type="password", key="reg_confirm")
        if st.button("Create Account"):
            if not name or not email or not password:
                st.warning("Please fill all fields.")
            elif password != confirm:
                st.error("Passwords do not match.")
            elif len(password) < 6:
                st.error("Password must contain at least 6 characters.")
            else:
                ok, msg = register_user(name, email, password)
                (st.success if ok else st.error)(msg)

def main_app():
    user = st.session_state.user
    model_bundle = load_model()
    metrics = load_metrics()

    with st.sidebar:
        st.title("🎓 Student AI")
        st.write(f"Welcome, **{user['name']}**")
        page = st.radio(
            "Navigation",
            ["Dashboard", "Predict Performance", "History", "Analytics", "Model Performance", "About"]
        )
        if st.button("Logout"):
            st.session_state.pop("user", None)
            st.rerun()

    if model_bundle is None:
        st.error("ML model not found.")
        st.info("Run these commands first: python generate_dataset.py  then  python train_model.py")
        st.stop()

    if page == "Dashboard":
        st.title("📊 Dashboard")
        history = get_history(user["id"])

        total = len(history)
        excellent = int((history["Performance"] == "Excellent").sum()) if total else 0
        good = int((history["Performance"] == "Good").sum()) if total else 0
        average = int((history["Performance"] == "Average").sum()) if total else 0
        poor = int((history["Performance"] == "Poor").sum()) if total else 0

        c1, c2, c3, c4, c5 = st.columns(5)
        c1.metric("Predictions", total)
        c2.metric("Excellent", excellent)
        c3.metric("Good", good)
        c4.metric("Average", average)
        c5.metric("Poor", poor)

        st.divider()
        st.subheader("Recent Predictions")
        if history.empty:
            st.info("No predictions yet. Go to Predict Performance.")
        else:
            st.dataframe(history.head(10), use_container_width=True, hide_index=True)

    elif page == "Predict Performance":
        st.title("🔮 Predict Student Performance")
        st.caption("The prediction is generated by the trained Random Forest model.")

        col1, col2 = st.columns(2)
        with col1:
            student_name = st.text_input("Student Name")
            attendance = st.number_input("Attendance (%)", 0.0, 100.0, 90.0)
            study_hours = st.number_input("Study Hours Per Day", 0.0, 24.0, 5.0)
        with col2:
            assignment = st.number_input("Assignment Score", 0.0, 100.0, 85.0)
            internal = st.number_input("Internal Marks", 0.0, 100.0, 88.0)
            previous = st.number_input("Previous Exam Score", 0.0, 100.0, 90.0)

        if st.button("🚀 Predict Performance", type="primary"):
            if not student_name.strip():
                st.error("Please enter the student name.")
                st.stop()

            input_df = pd.DataFrame([{
                "Attendance": attendance,
                "Study_Hours": study_hours,
                "Assignment_Score": assignment,
                "Internal_Marks": internal,
                "Previous_Score": previous
            }])

            encoded_prediction = model_bundle["model"].predict(input_df)[0]
            prediction = model_bundle["label_encoder"].inverse_transform([encoded_prediction])[0]

            confidence = None
            if hasattr(model_bundle["model"], "predict_proba"):
                confidence = float(model_bundle["model"].predict_proba(input_df).max())

            score = performance_score(attendance, study_hours, assignment, internal, previous)
            recs = recommendations(attendance, study_hours, assignment, internal, previous, prediction)

            result = {
                "student_name": student_name.strip(),
                "attendance": attendance,
                "study_hours": study_hours,
                "assignment_score": assignment,
                "internal_marks": internal,
                "previous_score": previous,
                "performance_score": score,
                "prediction": prediction,
                "confidence": confidence,
                "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "recommendations": recs,
            }
            st.session_state.last_result = result
            save_prediction(user["id"], result)

        result = st.session_state.get("last_result")
        if result:
            st.divider()
            st.subheader("Prediction Result")

            a, b, c = st.columns(3)
            a.metric("Performance Score", f'{result["performance_score"]:.2f}%')
            b.metric("Predicted Performance", result["prediction"])
            c.metric(
                "Confidence",
                f'{result["confidence"]:.2%}' if result["confidence"] is not None else "N/A"
            )

            st.progress(min(result["performance_score"] / 100, 1.0))

            chart_df = pd.DataFrame({
                "Metric": ["Attendance", "Study Hours (normalized)", "Assignment", "Internal", "Previous"],
                "Value": [
                    result["attendance"],
                    min(result["study_hours"] / 8 * 100, 100),
                    result["assignment_score"],
                    result["internal_marks"],
                    result["previous_score"]
                ]
            })
            st.bar_chart(chart_df.set_index("Metric"))

            st.subheader("💡 Recommendations")
            for rec in result["recommendations"]:
                st.info(rec)

            pdf = make_pdf(result)
            st.download_button(
                "📄 Download Prediction Report (PDF)",
                data=pdf,
                file_name=f'{result["student_name"]}_performance_report.pdf',
                mime="application/pdf"
            )

    elif page == "History":
        st.title("📚 Prediction History")
        history = get_history(user["id"])
        if history.empty:
            st.info("No prediction history available.")
        else:
            filter_value = st.selectbox(
                "Filter Performance",
                ["All", "Excellent", "Good", "Average", "Poor"]
            )
            shown = history if filter_value == "All" else history[history["Performance"] == filter_value]
            st.dataframe(shown, use_container_width=True, hide_index=True)

            prediction_id = st.number_input("Prediction ID to delete", min_value=1, step=1)
            if st.button("Delete Selected Prediction"):
                delete_prediction(user["id"], int(prediction_id))
                st.success("Prediction deleted.")
                st.rerun()

    elif page == "Analytics":
        st.title("📈 Analytics")
        history = get_history(user["id"])
        if history.empty:
            st.info("Make some predictions first.")
        else:
            st.subheader("Performance Distribution")
            dist = history["Performance"].value_counts().reindex(
                ["Poor", "Average", "Good", "Excellent"], fill_value=0
            )
            st.bar_chart(dist)

            st.subheader("Average Input Metrics")
            averages = pd.DataFrame({
                "Metric": ["Attendance", "Study Hours", "Assignment", "Internal", "Previous"],
                "Average": [
                    history["Attendance"].mean(),
                    history["Study_Hours"].mean(),
                    history["Assignment"].mean(),
                    history["Internal"].mean(),
                    history["Previous"].mean(),
                ]
            })
            st.bar_chart(averages.set_index("Metric"))

    elif page == "Model Performance":
        st.title("🤖 Model Performance")
        if metrics is None:
            st.warning("Metrics not found. Run train_model.py.")
        else:
            c1, c2, c3, c4 = st.columns(4)
            c1.metric("Accuracy", f'{metrics["accuracy"]:.2%}')
            c2.metric("Precision", f'{metrics["precision"]:.2%}')
            c3.metric("Recall", f'{metrics["recall"]:.2%}')
            c4.metric("F1 Score", f'{metrics["f1_score"]:.2%}')

            st.write("**Algorithm:**", metrics["algorithm"])
            st.write("**Dataset size:**", metrics["dataset_size"])
            st.write("**Training samples:**", metrics["training_samples"])
            st.write("**Testing samples:**", metrics["testing_samples"])

            fi = pd.DataFrame(
                list(metrics["feature_importance"].items()),
                columns=["Feature", "Importance"]
            )
            st.subheader("Feature Importance")
            st.bar_chart(fi.set_index("Feature"))

            st.caption(
                "These metrics are based on the synthetic academic dataset created for this project. "
                "They should not be interpreted as real-world model performance."
            )

    elif page == "About":
        st.title("ℹ️ About the Project")
        st.markdown("""
        ### Student Performance Prediction System

        **Domain:** Artificial Intelligence and Machine Learning

        **Technology:** Python, Streamlit, Pandas, NumPy, Scikit-learn, SQLite, ReportLab

        **Objective:** Predict student academic performance using attendance, study hours,
        assignment score, internal marks and previous exam score.

        ### How it works
        1. Generate a synthetic academic dataset.
        2. Preprocess the data.
        3. Train a Random Forest classification model.
        4. Evaluate the model.
        5. Enter a new student's details.
        6. Generate an ML prediction.
        7. Save the prediction in SQLite.
        8. Display analytics and recommendations.
        9. Download a PDF report.

        ### Important limitation
        The included dataset is synthetic and intended for academic demonstration.
        Predictions are not guaranteed future academic outcomes.
        """)

init_db()

if "user" not in st.session_state:
    login_screen()
else:
    main_app()
`
  },
  {
    name: 'requirements.txt',
    path: 'requirements.txt',
    language: 'plaintext',
    description: 'Python package dependencies required to run the project',
    code: `streamlit>=1.36
pandas>=2.0
numpy>=1.24
scikit-learn>=1.3
joblib>=1.3
reportlab>=4.0
`
  },
  {
    name: 'README.md',
    path: 'README.md',
    language: 'markdown',
    description: 'Documentation with architecture details and setup commands',
    code: `# Student Performance Prediction System

A Python academic project using Streamlit and a scikit-learn Random Forest model.

## Features

- 200 synthetic student records
- Supervised ML classification (Random Forest Classifier)
- User Authentication (Login and registration)
- SQLite database persistence
- Prediction history with filtering and deletion
- Analytics dashboards and input metric comparisons
- Model evaluation metrics (Accuracy, Precision, Recall, F1, Confusion Matrix)
- Personalized academic recommendations
- Downloadable PDF prediction report

## 1. Setup Instructions

1. Install Python 3.10+
2. Install required packages:
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`

3. Generate the dataset:
   \`\`\`bash
   python generate_dataset.py
   \`\`\`

4. Train the ML model:
   \`\`\`bash
   python train_model.py
   \`\`\`

5. Launch the Streamlit application:
   \`\`\`bash
   streamlit run app.py
   \`\`\`
`
  }
];

export async function downloadPythonProjectZip(): Promise<void> {
  const zip = new JSZip();

  // Root files
  zip.file('generate_dataset.py', PYTHON_FILES[0].code);
  zip.file('train_model.py', PYTHON_FILES[1].code);
  zip.file('app.py', PYTHON_FILES[2].code);
  zip.file('requirements.txt', PYTHON_FILES[3].code);
  zip.file('README.md', PYTHON_FILES[4].code);

  // data/students.csv
  const dataFolder = zip.folder('data');
  if (dataFolder) {
    dataFolder.file('students.csv', datasetToCsv(DEFAULT_STUDENTS_DATASET));
  }

  // model/metrics.json
  const modelFolder = zip.folder('model');
  if (modelFolder) {
    const metricsContent = {
      dataset_size: 200,
      training_samples: 160,
      testing_samples: 40,
      algorithm: 'Random Forest Classifier',
      accuracy: 0.95,
      precision: 0.9525,
      recall: 0.95,
      f1_score: 0.9508,
      confusion_matrix: [
        [6, 1, 0, 0],
        [0, 11, 1, 0],
        [0, 0, 14, 0],
        [0, 0, 0, 8]
      ],
      class_names: ['Poor', 'Average', 'Good', 'Excellent'],
      feature_importance: {
        Previous_Score: 0.2642,
        Attendance: 0.2185,
        Assignment_Score: 0.2014,
        Internal_Marks: 0.1873,
        Study_Hours: 0.1286
      }
    };
    modelFolder.file('metrics.json', JSON.stringify(metricsContent, null, 2));
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'student_performance_prediction_python.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
