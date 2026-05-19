FROM python:3.11-slim

# Set the working directory
WORKDIR /app

# Copy the requirements file and install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend and frontend source code into the container
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Expose port (Cloud Run typically expects 8080)
EXPOSE 8080

# Command to run the application using uvicorn, utilizing the PORT environment variable
CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
