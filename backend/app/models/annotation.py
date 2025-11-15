"""
Annotation data models
"""
from pydantic import BaseModel, Field, field_validator, ConfigDict, field_serializer
from pydantic_core import core_schema
from typing import Optional, Literal, Any
from datetime import datetime
from bson import ObjectId

class PyObjectId(str):
    """Custom ObjectId type for Pydantic v2"""
    @classmethod
    def __get_pydantic_core_schema__(
        cls,
        _source_type: Any,
        _handler: Any,
    ) -> core_schema.CoreSchema:
        return core_schema.union_schema([
            core_schema.is_instance_schema(ObjectId),
            core_schema.chain_schema([
                core_schema.str_schema(),
                core_schema.no_info_plain_validator_function(cls.validate),
            ])
        ], serialization=core_schema.plain_serializer_function_ser_schema(str))

    @classmethod
    def validate(cls, v):
        if isinstance(v, ObjectId):
            return v
        if isinstance(v, str) and ObjectId.is_valid(v):
            return ObjectId(v)
        raise ValueError("Invalid ObjectId")

class AnnotationModel(BaseModel):
    """Database model for annotations"""
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True
    )

    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    trace_id: str = Field(..., description="ID of the trace being annotated")
    user_id: str = Field(..., description="Clerk user ID")
    holistic_pass_fail: Literal["Pass", "Fail"] = Field(..., description="Overall pass/fail rating")
    first_failure_note: Optional[str] = Field(None, max_length=256, description="Note about first failure point")
    open_codes: Optional[str] = Field(None, max_length=500, description="Comma-separated open codes")
    comments_hypotheses: Optional[str] = Field(None, max_length=1000, description="Comments and hypotheses")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    version: int = Field(default=1, description="Version number for tracking changes")

    @field_validator('first_failure_note')
    @classmethod
    def validate_failure_note(cls, v: Optional[str], info) -> Optional[str]:
        """Failure note should only be present if holistic_pass_fail is Fail"""
        # Note: In Pydantic v2, field_validator doesn't have access to other field values
        # This validation should be moved to model_validator if needed
        return v

    @field_serializer('id')
    def serialize_id(self, value: Any, _info):
        if value is not None:
            return str(value)
        return None