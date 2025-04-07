"""Module for Businessmap (Kanbanize) card operations."""

import logging
from typing import Any, Dict, List, Optional, Union

from ..models.businessmap import BusinessmapCard

logger = logging.getLogger("mcp-businessmap")


class CardsMixin:
    """Mixin for Businessmap card operations."""

    def get_card(
        self,
        card_id: str,
        with_comments: bool = True,
        with_attachments: bool = True,
    ) -> BusinessmapCard:
        """
        Get a Businessmap card by ID.

        Args:
            card_id: The card ID
            with_comments: Whether to include comments
            with_attachments: Whether to include attachments

        Returns:
            BusinessmapCard model with card data

        Raises:
            Exception: If there is an error retrieving the card
        """
        try:
            # Get the card data
            endpoint = f"/api/v2/cards/{card_id}"
            card_data = self._make_request("get", endpoint)
            
            # Get comments if needed
            comments = []
            if with_comments:
                comments_endpoint = f"/api/v2/cards/{card_id}/comments"
                comments = self._make_request("get", comments_endpoint)
            
            # Get attachments if needed
            attachments = []
            if with_attachments:
                attachments_endpoint = f"/api/v2/cards/{card_id}/attachments"
                attachments = self._make_request("get", attachments_endpoint)
            
            # Add comments and attachments to the card data
            if comments:
                card_data["comments"] = comments
            if attachments:
                card_data["attachments"] = attachments
            
            # Create and return the BusinessmapCard model
            return BusinessmapCard.from_api_response(
                card_data,
                base_url=self.config.url,
            )
        except Exception as e:
            logger.error(f"Error retrieving card {card_id}: {str(e)}")
            raise Exception(f"Error retrieving card {card_id}: {str(e)}")
    
    def create_card(
        self,
        board_id: str,
        workflow_id: str,
        lane_id: str,
        column_id: str,
        title: str,
        description: str = "",
        priority: Optional[str] = None,
        assignee_ids: Optional[List[str]] = None,
        tags: Optional[List[str]] = None,
        custom_fields: Optional[Dict[str, Any]] = None,
    ) -> BusinessmapCard:
        """
        Create a new card in Businessmap.
        
        Args:
            board_id: The board ID
            workflow_id: The workflow ID
            lane_id: The lane ID
            column_id: The column ID
            title: Card title
            description: Card description
            priority: Card priority
            assignee_ids: List of assignee IDs
            tags: List of tags
            custom_fields: Custom field values
            
        Returns:
            The created card
            
        Raises:
            Exception: If card creation fails
        """
        try:
            payload = {
                "title": title,
                "description": description,
                "column_id": column_id,
                "lane_id": lane_id,
                "workflow_id": workflow_id,
            }
            
            # Add optional fields if provided
            if priority:
                payload["priority"] = priority
            if assignee_ids:
                payload["assignee_ids"] = assignee_ids
            if tags:
                payload["tags"] = tags
            if custom_fields:
                payload["custom_fields"] = custom_fields
            
            # Create the card
            endpoint = f"/api/v2/boards/{board_id}/cards"
            response = self._make_request("post", endpoint, json=payload)
            
            # Get the created card ID
            card_id = response.get("id")
            if not card_id:
                raise ValueError("Failed to get ID of created card")
            
            # Return the full card details
            return self.get_card(card_id)
        except Exception as e:
            logger.error(f"Error creating card: {str(e)}")
            raise Exception(f"Error creating card: {str(e)}")
    
    def update_card(
        self,
        card_id: str,
        title: Optional[str] = None,
        description: Optional[str] = None,
        column_id: Optional[str] = None,
        lane_id: Optional[str] = None,
        priority: Optional[str] = None,
        assignee_ids: Optional[List[str]] = None,
        tags: Optional[List[str]] = None,
        custom_fields: Optional[Dict[str, Any]] = None,
    ) -> BusinessmapCard:
        """
        Update an existing card in Businessmap.
        
        Args:
            card_id: The card ID
            title: New card title
            description: New card description
            column_id: New column ID
            lane_id: New lane ID
            priority: New priority
            assignee_ids: New list of assignee IDs
            tags: New list of tags
            custom_fields: New custom field values
            
        Returns:
            The updated card
            
        Raises:
            Exception: If card update fails
        """
        try:
            payload = {}
            
            # Add fields to update if provided
            if title is not None:
                payload["title"] = title
            if description is not None:
                payload["description"] = description
            if column_id is not None:
                payload["column_id"] = column_id
            if lane_id is not None:
                payload["lane_id"] = lane_id
            if priority is not None:
                payload["priority"] = priority
            if assignee_ids is not None:
                payload["assignee_ids"] = assignee_ids
            if tags is not None:
                payload["tags"] = tags
            if custom_fields is not None:
                payload["custom_fields"] = custom_fields
            
            # Update the card
            endpoint = f"/api/v2/cards/{card_id}"
            self._make_request("patch", endpoint, json=payload)
            
            # Return the updated card
            return self.get_card(card_id)
        except Exception as e:
            logger.error(f"Error updating card {card_id}: {str(e)}")
            raise Exception(f"Error updating card {card_id}: {str(e)}")
    
    def delete_card(self, card_id: str) -> bool:
        """
        Delete a card from Businessmap.
        
        Args:
            card_id: The card ID
            
        Returns:
            True if deletion was successful
            
        Raises:
            Exception: If card deletion fails
        """
        try:
            endpoint = f"/api/v2/cards/{card_id}"
            self._make_request("delete", endpoint)
            return True
        except Exception as e:
            logger.error(f"Error deleting card {card_id}: {str(e)}")
            raise Exception(f"Error deleting card {card_id}: {str(e)}") 