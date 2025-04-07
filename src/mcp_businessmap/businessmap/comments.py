"""Module for Businessmap (Kanbanize) comment operations."""

import logging
from typing import Any, Dict, List, Optional

logger = logging.getLogger("mcp-businessmap")


class CommentsMixin:
    """Mixin for Businessmap comment operations."""

    def get_card_comments(
        self,
        card_id: str,
        max_results: int = 50,
        page: int = 1,
    ) -> List[Dict[str, Any]]:
        """
        Get comments for a card.
        
        Args:
            card_id: The card ID
            max_results: Maximum number of comments to return
            page: Page number for pagination
            
        Returns:
            List of comments
            
        Raises:
            Exception: If retrieving comments fails
        """
        try:
            params = {
                "page": page,
                "per_page": max_results,
            }
            
            endpoint = f"/api/v2/cards/{card_id}/comments"
            response = self._make_request("get", endpoint, params=params)
            
            return response.get("data", [])
        except Exception as e:
            logger.error(f"Error getting comments for card {card_id}: {str(e)}")
            raise Exception(f"Error getting comments for card {card_id}: {str(e)}")
    
    def add_comment(
        self,
        card_id: str,
        text: str,
    ) -> Dict[str, Any]:
        """
        Add a comment to a card.
        
        Args:
            card_id: The card ID
            text: Comment text
            
        Returns:
            The created comment
            
        Raises:
            Exception: If adding comment fails
        """
        try:
            payload = {
                "text": text,
            }
            
            endpoint = f"/api/v2/cards/{card_id}/comments"
            response = self._make_request("post", endpoint, json=payload)
            
            return response
        except Exception as e:
            logger.error(f"Error adding comment to card {card_id}: {str(e)}")
            raise Exception(f"Error adding comment to card {card_id}: {str(e)}") 