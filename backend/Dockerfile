FROM python:3.11-slim

WORKDIR /app

# 1. Install curl for healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 2. Install PyTorch CPU first (dedicated cached layer, ~200MB)
RUN pip install --no-cache-dir torch==2.6.0 --index-url https://download.pytorch.org/whl/cpu

# 3. Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt --prefer-binary

# 4. Build-time Verification / Sanity Test: Memastikan seluruh dependency ter-load tanpa error
RUN python -c "\
import fastapi, pydantic, sqlalchemy, alembic, chromadb, \
       sentence_transformers, torch, transformers, xgboost, \
       sklearn, scipy, numpy, pandas, twscrape, groq; \
print('✅ [Axiom Build Test] All backend dependencies successfully verified!')"

# 5. Copy backend source code & create non-root appuser
COPY . .

RUN groupadd -g 1000 appuser && \
    useradd -u 1000 -g appuser -s /bin/bash -m appuser && \
    mkdir -p /app/data /app/reports && \
    chown -R appuser:appuser /app

USER appuser

# 6. Expose port & default command
EXPOSE 8000

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
