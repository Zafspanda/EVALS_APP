#!/bin/bash

# Start backend server
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
