"""
API tests for trace endpoints
Testing business logic, data transformations, and error handling
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch
import json
from datetime import datetime
from faker import Faker

fake = Faker()


class TestTracesAPI:
    """API tests for trace CRUD operations"""

    @pytest.mark.asyncio
    async def test_upload_traces_csv_success(self, client: TestClient, mock_db):
        """[P1] POST /api/traces/upload - should import valid CSV successfully"""
        # GIVEN: Valid CSV content
        csv_content = """llm_prompt,llm_response,llm_model_name,evaluator_model_name,evaluator_response
"What is 2+2?","The answer is 4","gpt-4","claude-3","pass"
"Explain gravity","Gravity is a fundamental force...","gpt-3.5-turbo","gpt-4","pass"
"""
        # WHEN: Uploading CSV file
        response = client.post(
            "/api/traces/upload",
            files={"file": ("traces.csv", csv_content, "text/csv")},
        )

        # THEN: Returns 200 with import summary
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["traces_imported"] == 2
        assert data["validation_errors"] == []
        assert "Successfully imported" in data["message"]

    @pytest.mark.asyncio
    async def test_upload_traces_csv_validation_error(self, client: TestClient):
        """[P1] POST /api/traces/upload - should return 400 for invalid CSV"""
        # GIVEN: CSV missing required columns
        invalid_csv = """prompt,response
"Question","Answer"
"""
        # WHEN: Uploading invalid CSV
        response = client.post(
            "/api/traces/upload",
            files={"file": ("invalid.csv", invalid_csv, "text/csv")},
        )

        # THEN: Returns 400 with validation errors
        assert response.status_code == 400
        data = response.json()
        assert "Missing required columns" in data["detail"]
        assert "llm_prompt" in data["detail"]

    @pytest.mark.asyncio
    async def test_get_user_assigned_traces(self, client: TestClient, mock_db):
        """[P1] GET /api/traces/my-traces - should return user's assigned traces"""
        # GIVEN: User with assigned traces
        user_id = "user_123"
        mock_traces = [
            {
                "id": i,
                "llm_prompt": fake.text(),
                "llm_response": fake.text(),
                "status": "pending",
                "assigned_to": user_id,
            }
            for i in range(1, 6)
        ]
        mock_db.traces.find.return_value.to_list.return_value = mock_traces

        # WHEN: Fetching user's traces
        response = client.get(
            "/api/traces/my-traces",
            headers={"X-User-Id": user_id},
        )

        # THEN: Returns only assigned traces
        assert response.status_code == 200
        data = response.json()
        assert len(data["traces"]) == 5
        assert all(t["assigned_to"] == user_id for t in data["traces"])

    @pytest.mark.asyncio
    async def test_assign_traces_to_users(self, client: TestClient, mock_db):
        """[P1] POST /api/traces/assign - admin should assign trace ranges"""
        # GIVEN: Admin making assignment request
        assignment_data = {
            "user_id": "evaluator_1",
            "trace_range": {"start": 1, "end": 50},
        }

        # Mock admin check
        with patch("app.auth.is_admin", return_value=True):
            # WHEN: Assigning traces
            response = client.post(
                "/api/traces/assign",
                json=assignment_data,
                headers={"X-User-Id": "admin_user"},
            )

        # THEN: Returns success with assignment details
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["assigned_count"] == 50
        assert data["user_id"] == "evaluator_1"

    @pytest.mark.asyncio
    async def test_prevent_duplicate_trace_assignment(self, client: TestClient, mock_db):
        """[P1] POST /api/traces/assign - should prevent duplicate assignments"""
        # GIVEN: Traces already assigned to another user
        mock_db.traces.count_documents.return_value = 25  # Some already assigned

        assignment_data = {
            "user_id": "evaluator_2",
            "trace_range": {"start": 1, "end": 50},
        }

        with patch("app.auth.is_admin", return_value=True):
            # WHEN: Attempting duplicate assignment
            response = client.post(
                "/api/traces/assign",
                json=assignment_data,
                headers={"X-User-Id": "admin_user"},
            )

        # THEN: Returns partial success
        assert response.status_code == 200
        data = response.json()
        assert data["assigned_count"] == 25
        assert "already assigned" in data["message"].lower()

    @pytest.mark.asyncio
    async def test_get_trace_by_id(self, client: TestClient, mock_db):
        """[P2] GET /api/traces/{trace_id} - should return trace details"""
        # GIVEN: Existing trace
        mock_trace = {
            "_id": 1,
            "llm_prompt": "Test prompt",
            "llm_response": "Test response",
            "llm_model_name": "gpt-4",
            "status": "pending",
        }
        mock_db.traces.find_one.return_value = mock_trace

        # WHEN: Fetching trace by ID
        response = client.get("/api/traces/1")

        # THEN: Returns trace details
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == 1
        assert data["llm_prompt"] == "Test prompt"
        assert data["status"] == "pending"

    @pytest.mark.asyncio
    async def test_trace_not_found(self, client: TestClient, mock_db):
        """[P2] GET /api/traces/{trace_id} - should return 404 for missing trace"""
        # GIVEN: Non-existent trace ID
        mock_db.traces.find_one.return_value = None

        # WHEN: Fetching non-existent trace
        response = client.get("/api/traces/999")

        # THEN: Returns 404
        assert response.status_code == 404
        assert "Trace not found" in response.json()["detail"]


class TestAnnotationsAPI:
    """API tests for annotation operations"""

    @pytest.mark.asyncio
    async def test_create_annotation(self, client: TestClient, mock_db):
        """[P0] POST /api/annotations - should create new annotation"""
        # GIVEN: Valid annotation data
        annotation_data = {
            "trace_id": 1,
            "human_label": "pass",
            "human_confidence": 4,
            "evaluator_agrees": "yes",
            "failure_modes": [],
            "is_golden_set": False,
            "needs_support_clarification": False,
            "notes": "Good response",
        }

        # WHEN: Creating annotation
        response = client.post(
            "/api/annotations",
            json=annotation_data,
            headers={"X-User-Id": "evaluator_1"},
        )

        # THEN: Returns 201 with created annotation
        assert response.status_code == 201
        data = response.json()
        assert data["trace_id"] == 1
        assert data["human_label"] == "pass"
        assert "created_at" in data
        assert "annotated_by" in data

    @pytest.mark.asyncio
    async def test_update_existing_annotation(self, client: TestClient, mock_db):
        """[P1] PUT /api/annotations/{id} - should update existing annotation"""
        # GIVEN: Existing annotation
        annotation_id = "annotation_123"
        update_data = {
            "human_confidence": 5,
            "is_golden_set": True,
            "notes": "Updated after review",
        }

        # WHEN: Updating annotation
        response = client.put(
            f"/api/annotations/{annotation_id}",
            json=update_data,
            headers={"X-User-Id": "evaluator_1"},
        )

        # THEN: Returns updated annotation
        assert response.status_code == 200
        data = response.json()
        assert data["human_confidence"] == 5
        assert data["is_golden_set"] is True
        assert "Updated after review" in data["notes"]

    @pytest.mark.asyncio
    async def test_annotation_with_dynamic_labels(self, client: TestClient, mock_db):
        """[P1] POST /api/annotations - should handle dynamic rubric labels"""
        # GIVEN: Annotation with dynamic labels
        annotation_data = {
            "trace_id": 2,
            "human_label": "fail",
            "human_confidence": 2,
            "evaluator_agrees": "no",
            "failure_modes": ["hallucination", "off_topic"],
            "dynamic_labels": {
                "constraint_violation": False,
                "hallucination": True,
                "off_topic": True,
                "poor_quality": "n/a",
            },
        }

        # WHEN: Creating annotation with dynamic labels
        response = client.post(
            "/api/annotations",
            json=annotation_data,
            headers={"X-User-Id": "evaluator_1"},
        )

        # THEN: Dynamic labels are saved
        assert response.status_code == 201
        data = response.json()
        assert data["dynamic_labels"]["hallucination"] is True
        assert data["dynamic_labels"]["poor_quality"] == "n/a"

    @pytest.mark.asyncio
    async def test_get_annotation_by_trace(self, client: TestClient, mock_db):
        """[P2] GET /api/annotations/trace/{trace_id} - should return annotation for trace"""
        # GIVEN: Trace with annotation
        mock_annotation = {
            "_id": "annotation_1",
            "trace_id": 1,
            "human_label": "pass",
            "human_confidence": 4,
            "created_at": datetime.utcnow().isoformat(),
        }
        mock_db.annotations.find_one.return_value = mock_annotation

        # WHEN: Fetching annotation by trace ID
        response = client.get("/api/annotations/trace/1")

        # THEN: Returns annotation
        assert response.status_code == 200
        data = response.json()
        assert data["trace_id"] == 1
        assert data["human_label"] == "pass"