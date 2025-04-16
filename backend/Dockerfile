# backend/Dockerfile
FROM python:3.10-slim

WORKDIR /app
ENV PYTHONPATH=/app
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
# Install system dependencies
RUN apt-get update && apt-get install -y \
gcc \
python3-dev \
libpq-dev \
&& rm -rf /var/lib/apt/lists/*

# Install project dependencies
COPY pyproject.toml .
ENV PYTHONPATH="${PYTHONPATH}:/app"
# Generate requirements.txt from pyproject.toml
RUN pip install --no-cache-dir --upgrade pip && \
    pip install -U setuptools wheel pip-tools && \
    pip-compile pyproject.toml --output-file requirements.txt

# Install dependencies and verify critical packages
RUN pip install --no-cache-dir -r requirements.txt && \
    # Explicitly install click and other potentially missing dependencies
    pip install --no-cache-dir click>=8.0.0 && \
    # Verify installations
    pip list | grep click && \
    pip list | grep uvicorn

# Copy application code
COPY . .

# Expose ports
EXPOSE 8000

# Default command to run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
