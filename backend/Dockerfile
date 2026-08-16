# Use official Python slim image (smaller than full Python image)
FROM python:3.11-slim

# Set working directory inside the container
WORKDIR /app

# Copy requirements first — Docker caches this layer,
# so if requirements don't change, it won't reinstall on rebuilds
COPY requirements.txt .

# Install build tools needed by shap (requires C++ compilation)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install all Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend files (api.py, model.pkl, background.pkl, etc.)
COPY . .

# Expose port 8000 so other containers and the host can reach the API
EXPOSE 8000

# Start the FastAPI server
# --host 0.0.0.0 is required so it accepts connections from outside the container
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]
