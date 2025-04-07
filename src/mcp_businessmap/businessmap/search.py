"""Module for Businessmap (Kanbanize) search operations."""

import logging
from typing import Any, Dict, List, Optional

logger = logging.getLogger("mcp-businessmap")


class SearchMixin:
    """Mixin for Businessmap search operations."""

    def search_cards(
        self,
        query: Optional[str] = None,
        board_ids: Optional[List[str]] = None,
        workflow_ids: Optional[List[str]] = None,
        lane_ids: Optional[List[str]] = None,
        column_ids: Optional[List[str]] = None,
        tag_names: Optional[List[str]] = None,
        assignee_ids: Optional[List[str]] = None,
        fields: Optional[List[str]] = None,
        max_results: int = 50,
        page: int = 1,
    ) -> Dict[str, Any]:
        """
        Search for cards in Businessmap.
        
        Args:
            query: Text search query
            board_ids: List of board IDs to search in
            workflow_ids: List of workflow IDs to filter by
            lane_ids: List of lane IDs to filter by
            column_ids: List of column IDs to filter by
            tag_names: List of tag names to filter by
            assignee_ids: List of assignee IDs to filter by
            fields: List of fields to include in results
            max_results: Maximum number of results to return
            page: Page number for pagination
            
        Returns:
            Dictionary with search results and metadata
            
        Raises:
            Exception: If search fails
        """
        try:
            # Apply boards filter from config if no board_ids provided
            if not board_ids and self.config.boards_filter:
                board_ids = self.config.boards_filter.split(",")
            
            # Build search parameters
            params = {
                "page": page,
                "per_page": max_results,
            }
            
            # Build filter payload
            payload = {}
            
            if query:
                payload["search_text"] = query
            if board_ids:
                payload["board_ids"] = board_ids
            if workflow_ids:
                payload["workflow_ids"] = workflow_ids
            if lane_ids:
                payload["lane_ids"] = lane_ids
            if column_ids:
                payload["column_ids"] = column_ids
            if tag_names:
                payload["tag_names"] = tag_names
            if assignee_ids:
                payload["assignee_ids"] = assignee_ids
            if fields:
                payload["fields"] = fields
            
            # Execute the search
            endpoint = "/api/v2/cards"
            results = self._make_request("get", endpoint, params=params, json=payload if payload else None)
            
            # Format the results
            formatted_results = {
                "cards": results.get("data", []),
                "total": results.get("pagination", {}).get("total_items", 0),
                "page": results.get("pagination", {}).get("current_page", 1),
                "per_page": results.get("pagination", {}).get("items_per_page", max_results),
            }
            
            return formatted_results
        except Exception as e:
            logger.error(f"Error searching cards: {str(e)}")
            raise Exception(f"Error searching cards: {str(e)}") 