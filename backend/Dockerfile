# Dockerfile for StrapyATS Backend (Optimized for GCP Cloud Run - Free Tier)
FROM python:3.11-slim

# Prevent Python from writing .pyc files and buffer outputs
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy dependencies manifest
COPY requirements.txt .

# Install Python packages
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . .

# Create directory for persistent ChromaDB storage
RUN mkdir -p /app/chroma_db

EXPOSE 8000

# Start Uvicorn server binding to $PORT (required by Cloud Run)
CMD exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT}
