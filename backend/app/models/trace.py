"""
Trace data models
"""
from pydantic import BaseModel, Field, ConfigDict, field_serializer
from pydantic_core import core_schema
from typing import Dict, Any, Optional, Annotated
from typing_extensions import Self
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

class TraceModel(BaseModel):
    """Database model for traces"""
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True
    )

    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    trace_id: str = Field(..., description="Unique identifier for the trace")
    flow_session: str = Field(..., description="Session UUID")
    turn_number: int = Field(..., description="Turn number in conversation")
    total_turns: int = Field(..., description="Total turns in conversation")
    user_message: str = Field(..., description="User's message")
    ai_response: str = Field(..., description="AI's response")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="CSV metadata columns")
    imported_at: datetime = Field(default_factory=datetime.utcnow)
    imported_by: str = Field(..., description="User ID who imported")

    @field_serializer('id')
    def serialize_id(self, value: Any, _info):
        if value is not None:
            return str(value)
        return None