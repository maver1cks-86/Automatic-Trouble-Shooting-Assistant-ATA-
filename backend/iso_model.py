from sklearn.ensemble import IsolationForest
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import pandas as pd

def detect_log_anomalies(logs: list, contamination: float = 0.1):
    """
    logs: list of dicts with keys ['EventID','Source','Msg','Time']
    contamination: fraction of anomalies

    returns: df with anomaly labels and trained model
    """
    print("Logs for anomaly detection:", len(logs))
    df = pd.DataFrame(logs)
    df['EventID'] = df['EventID'].astype(int)
    
    # Convert 'Time' to datetime
    df['Time'] = pd.to_datetime(df['Time'], errors='coerce')
    df['hour'] = df['Time'].dt.hour
    df['weekday'] = df['Time'].dt.weekday
    df_model = df.drop(columns=['Time'], errors='ignore')

    # Preprocessing: textual + categorical
    preprocessor = ColumnTransformer(
        transformers=[
            ('msg_tfidf', TfidfVectorizer(max_features=200), 'Msg'),
            ('source_oh', OneHotEncoder(), ['Source']),
        ],
        remainder='passthrough'
    )

    iso_model = Pipeline(steps=[
        ('preprocess', preprocessor),
        ('model', IsolationForest(contamination=contamination, random_state=42))
    ])

    iso_model.fit(df_model)
    df["anomaly"] = iso_model.predict(df_model)  # 1=normal, -1=anomaly

    return df, iso_model
