"""
API Tests for Open Coding Evaluation Platform
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import io
import pandas as pd

from app.main import app

client = TestClient(app)

@pytest.fixture
def mock_auth():
    """Mock authentication for tests"""
    with patch('app.api.auth.get_current_user') as mock:
        mock.return_value = {
            "clerk_id": "test_user_123",
            "email": "test@example.com",
            "name": "Test User"
        }
        yield mock

@pytest.fixture
def mock_db():
    """Mock database for tests"""
    with patch('app.db.mongodb.get_database') as mock:
        db_mock = MagicMock()
        mock.return_value = db_mock
        yield db_mock

def test_health_check():
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_root_endpoint():
    """Test root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "version" in data

class TestCSVImport:
    """Test CSV import functionality"""

    def test_csv_validation_invalid_extension(self, mock_auth):
        """Test that non-CSV files are rejected"""
        file = ("test.txt", b"test content", "text/plain")

        response = client.post(
            "/api/traces/import-csv",
            files={"file": file},
            headers={"Authorization": "Bearer test_token"}
        )

        assert response.status_code == 400
        assert "must be a CSV" in response.json()["detail"]

    def test_csv_validation_missing_columns(self, mock_auth, mock_db):
        """Test that CSV with missing columns is rejected"""
        # Create CSV with only 5 columns (should have 28)
        csv_content = "col1,col2,col3,col4,col5\nval1,val2,val3,val4,val5"
        file = ("test.csv", csv_content.encode(), "text/csv")

        response = client.post(
            "/api/traces/import-csv",
            files={"file": file},
            headers={"Authorization": "Bearer test_token"}
        )

        assert response.status_code == 400
        assert "must have exactly 28 columns" in response.json()["detail"]

    def test_csv_import_success(self, mock_auth, mock_db):
        """Test successful CSV import"""
        # Create valid CSV with 28 columns
        columns = ["trace_id", "flow_session", "turn_number", "total_turns",
                  "user_message", "ai_response"] + [f"col{i}" for i in range(7, 29)]
        data = {col: ["test_value"] for col in columns}
        data["turn_number"] = [1]
        data["total_turns"] = [3]

        df = pd.DataFrame(data)
        csv_buffer = io.StringIO()
        df.to_csv(csv_buffer, index=False)
        csv_content = csv_buffer.getvalue()

        file = ("test.csv", csv_content.encode(), "text/csv")

        # Mock database operations
        mock_db.traces.find_one.return_value = None
        mock_db.traces.insert_one.return_value = MagicMock(inserted_id="test_id")

        response = client.post(
            "/api/traces/import-csv",
            files={"file": file},
            headers={"Authorization": "Bearer test_token"}
        )

        assert response.status_code == 200
        data = response.json()
        assert "imported" in data
        assert data["imported"] == 1

class TestAnnotations:
    """Test annotation CRUD operations"""

    def test_create_annotation(self, mock_auth, mock_db):
        """Test creating an annotation"""
        # Mock trace exists
        mock_db.traces.find_one.return_value = {"trace_id": "test_trace_123"}
        mock_db.annotations.find_one.return_value = None
        mock_db.annotations.insert_one.return_value = MagicMock(inserted_id="ann_id")

        annotation_data = {
            "trace_id": "test_trace_123",
            "holistic_pass_fail": "Pass",
            "open_codes": "helpful,accurate",
            "comments_hypotheses": "Good response"
        }

        response = client.post(
            "/api/annotations",
            json=annotation_data,
            headers={"Authorization": "Bearer test_token"}
        )

        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "created" in data["message"].lower()

    def test_update_annotation(self, mock_auth, mock_db):
        """Test updating an existing annotation"""
        # Mock trace exists
        mock_db.traces.find_one.return_value = {"trace_id": "test_trace_123"}

        # Mock existing annotation
        existing = {
            "_id": "existing_id",
            "trace_id": "test_trace_123",
            "user_id": "test_user_123",
            "version": 1
        }
        mock_db.annotations.find_one.return_value = existing
        mock_db.annotations.replace_one.return_value = MagicMock(modified_count=1)

        annotation_data = {
            "trace_id": "test_trace_123",
            "holistic_pass_fail": "Fail",
            "first_failure_note": "Error in response",
            "open_codes": "inaccurate",
            "comments_hypotheses": "Needs improvement"
        }

        response = client.post(
            "/api/annotations",
            json=annotation_data,
            headers={"Authorization": "Bearer test_token"}
        )

        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "updated" in data["message"].lower()

    def test_get_annotation_for_trace(self, mock_auth, mock_db):
        """Test retrieving annotation for a trace"""
        mock_annotation = {
            "_id": "ann_id",
            "trace_id": "test_trace_123",
            "user_id": "test_user_123",
            "holistic_pass_fail": "Pass"
        }
        mock_db.annotations.find_one.return_value = mock_annotation

        response = client.get(
            "/api/annotations/trace/test_trace_123",
            headers={"Authorization": "Bearer test_token"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["trace_id"] == "test_trace_123"
        assert data["holistic_pass_fail"] == "Pass"

if __name__ == "__main__":
    pytest.main([__file__, "-v"])