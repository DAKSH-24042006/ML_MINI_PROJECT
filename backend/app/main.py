from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from backend.app.api.routes_data import router as data_router
from backend.app.api.routes_models import router as models_router
from backend.app.api.routes_telemetry import router as telemetry_router

app = FastAPI(
    title="F1 Driver Performance ML Analytics API",
    description="Machine Learning-Based Driver Performance Analysis Using Formula 1 Telemetry Data",
    version="1.0.0"
)

# Enable CORS for React/Vite development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers under /api
app.include_router(data_router, prefix="/api")
app.include_router(models_router, prefix="/api")
app.include_router(telemetry_router, prefix="/api")

@app.get("/")
def root():
    return {
        "project": "F1 Driver Performance ML Analytics",
        "status": "online",
        "docs_url": "/docs",
        "endpoints": [
            "/api/data/sessions",
            "/api/data/load",
            "/api/models/regression",
            "/api/models/classification",
            "/api/models/clustering",
            "/api/models/feature-importance",
            "/api/telemetry/compare",
            "/api/telemetry/eda/correlations"
        ]
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "f1-ml-backend"}

if __name__ == "__main__":
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
