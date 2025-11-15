"""
Annotation schemas for request/response validation
"""
from pydantic import BaseModel, Field, validator
from typing import Optional, Literal
from datetime import datetime

class AnnotationCreate(BaseModel):
    """Schema for creating an annotation"""
    trace_id: str = Field(..., description="ID of the trace being annotated")
    holistic_pass_fail: Literal["Pass", "Fail"] = Field(..., description="Overall pass/fail rating")
    first_failure_note: Optional[str] = Field(None, max_length=256, description="Note about first failure point")
    open_codes: Optional[str] = Field(None, max_length=500, description="Comma-separated open codes")
    comments_hypotheses: Optional[str] = Field(None, max_length=1000, description="Comments and hypotheses")

    @validator('first_failure_note')
    def validate_failure_note(cls, v, values):
        """Failure note should only be present if holistic_pass_fail is Fail"""
        if v and values.get('holistic_pass_fail') == 'Pass':
            return None  # Clear failure note if pass
        return v

    class Config:
        schema_extra = {
            "example": {
                "trace_id": "session_123_1",
                "holistic_pass_fail": "Pass",
                "open_codes": "helpful,accurate,concise",
                "comments_hypotheses": "Response was clear and addressed the user's question directly"
            }
        }

class AnnotationUpdate(BaseModel):
    """Schema for updating an annotation"""
    holistic_pass_fail: Optional[Literal["Pass", "Fail"]] = None
    first_failure_note: Optional[str] = Field(None, max_length=256)
    open_codes: Optional[str] = Field(None, max_length=500)
    comments_hypotheses: Optional[str] = Field(None, max_length=1000)

class AnnotationResponse(BaseModel):
    """Schema for annotation responses"""
    trace_id: str
    user_id: str
    holistic_pass_fail: Literal["Pass", "Fail"]
    first_failure_note: Optional[str] = None
    open_codes: Optional[str] = None
    comments_hypotheses: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    version: int

    class Config:
        orm_mode = True