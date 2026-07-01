import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.linear_model import LinearRegression


class AnomalyModel:
    """Wrapper for IsolationForest for streaming detection."""
    def __init__(self, n_estimators=100, contamination=0.02, random_state=42):
        self.model = IsolationForest(n_estimators=n_estimators, contamination=contamination, random_state=random_state)
        self.is_trained = False

    def fit(self, X):
        self.model.fit(X)
        self.is_trained = True

    def predict(self, X):
        # returns boolean: True if anomaly
        if not self.is_trained:
            # Train on current window if small
            self.fit(X)
        preds = self.model.predict(X)
        # IsolationForest: -1 anomaly, 1 normal
        return preds == -1


class ForecastModel:
    """Simple linear regression forecast on recent average power."""
    def __init__(self):
        self.model = LinearRegression()
        self.trained = False

    def fit(self, X, y):
        self.model.fit(X, y)
        self.trained = True

    def predict(self, X):
        if not self.trained:
            # default to mean
            return np.full((X.shape[0],), np.mean(X))
        return self.model.predict(X)
