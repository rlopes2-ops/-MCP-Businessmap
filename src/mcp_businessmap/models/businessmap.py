"""Models for Businessmap (Kanbanize) entities."""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional

from ..preprocessing import BusinessmapPreprocessor


@dataclass
class BusinessmapCard:
    """Represents a Businessmap (Kanbanize) card."""

    id: str
    title: str
    description: str
    board_id: str
    workflow_id: str
    lane_id: str
    column_id: str
    priority: Optional[str] = None
    assignee_ids: List[str] = field(default_factory=list)
    tags: List[str] = field(default_factory=list)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    custom_fields: Dict[str, Any] = field(default_factory=dict)
    comments: List[Dict[str, Any]] = field(default_factory=list)
    attachments: List[Dict[str, Any]] = field(default_factory=list)
    
    @classmethod
    def from_api_response(cls, data: Dict[str, Any], base_url: Optional[str] = None) -> "BusinessmapCard":
        """Create a BusinessmapCard instance from API response data.
        
        Args:
            data: Raw API response data
            base_url: Base URL of the Businessmap instance
            
        Returns:
            BusinessmapCard instance
        """
        # Initialize preprocessor if base_url is provided
        preprocessor = None
        if base_url:
            preprocessor = BusinessmapPreprocessor(base_url=base_url)
        
        # Clean description if preprocessor is available
        description = data.get("description", "")
        if preprocessor and description:
            description = preprocessor.clean_text(description)
        
        # Parse dates
        created_at = None
        if "created_at" in data and data["created_at"]:
            try:
                created_at = datetime.fromisoformat(data["created_at"].replace("Z", "+00:00"))
            except (ValueError, TypeError):
                pass
                
        updated_at = None
        if "updated_at" in data and data["updated_at"]:
            try:
                updated_at = datetime.fromisoformat(data["updated_at"].replace("Z", "+00:00"))
            except (ValueError, TypeError):
                pass
        
        # Create the instance
        return cls(
            id=str(data.get("id", "")),
            title=data.get("title", ""),
            description=description,
            board_id=str(data.get("board_id", "")),
            workflow_id=str(data.get("workflow_id", "")),
            lane_id=str(data.get("lane_id", "")),
            column_id=str(data.get("column_id", "")),
            priority=data.get("priority"),
            assignee_ids=data.get("assignee_ids", []),
            tags=data.get("tags", []),
            created_at=created_at,
            updated_at=updated_at,
            custom_fields=data.get("custom_fields", {}),
            comments=data.get("comments", []),
            attachments=data.get("attachments", []),
        ) 