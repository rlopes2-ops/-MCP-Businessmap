"""MCP Server implementation for Businessmap (Kanbanize)."""

import asyncio
import logging
import os
from typing import Any, Dict, List, Optional, Union

import modelcontextprotocol as mcp
from modelcontextprotocol import Parameter, ResourceMetadata, Resource, Schema

from .businessmap import BusinessmapAPI

# Configure logging
logger = logging.getLogger("mcp-businessmap")

# Create MCP schema
schema = Schema()


# Define resources
@schema.resource("businessmap")
class BusinessmapResource(Resource):
    """Resource for accessing Businessmap content."""
    
    @property
    def client(self) -> BusinessmapAPI:
        """Get the Businessmap client instance."""
        # Initialize client if not already done
        if not hasattr(self, "_client"):
            self._client = BusinessmapAPI()
        return self._client
    
    async def list(self) -> list[str]:
        """List available Businessmap boards.
        
        Returns:
            List of board resource identifiers
        """
        try:
            # Get boards from Businessmap
            boards = self.client._make_request("get", "/api/v2/boards")
            
            # Filter boards if configured
            if self.client.config.boards_filter:
                allowed_board_ids = set(self.client.config.boards_filter.split(","))
                boards = [b for b in boards.get("data", []) if str(b.get("id")) in allowed_board_ids]
            else:
                boards = boards.get("data", [])
            
            # Convert to resource IDs
            resources = [f"businessmap://{board.get('id')}" for board in boards]
            return resources
        except Exception as e:
            logger.error(f"Error listing Businessmap boards: {e}")
            return []
    
    async def get(self, key: str) -> ResourceMetadata:
        """Get metadata for a Businessmap board.
        
        Args:
            key: Board ID
            
        Returns:
            ResourceMetadata with board information
        """
        try:
            # Get board details
            board = self.client._make_request("get", f"/api/v2/boards/{key}")
            
            # Create metadata
            return ResourceMetadata(
                id=f"businessmap://{key}",
                name=board.get("name", f"Board {key}"),
                description=board.get("description", ""),
                source=self.client.config.url,
            )
        except Exception as e:
            logger.error(f"Error getting Businessmap board {key}: {e}")
            return ResourceMetadata(
                id=f"businessmap://{key}",
                name=f"Board {key}",
                source=self.client.config.url,
            )


# Define tools
@schema.tool
async def businessmap_search(
    query: str = Parameter(description="Text to search for"),
    board_ids: Optional[str] = Parameter(description="Comma-separated list of board IDs to search in", default=None),
    max_results: int = Parameter(description="Maximum number of results to return", default=50),
) -> Any:
    """Search for cards in Businessmap."""
    businessmap = BusinessmapResource()
    client = businessmap.client
    
    board_id_list = None
    if board_ids:
        board_id_list = board_ids.split(",")
    
    results = client.search_cards(
        query=query,
        board_ids=board_id_list,
        max_results=max_results,
    )
    
    return results


@schema.tool
async def businessmap_get_card(
    card_id: str = Parameter(description="Card ID to retrieve"),
) -> Any:
    """Get a specific card from Businessmap by ID."""
    businessmap = BusinessmapResource()
    client = businessmap.client
    
    card = client.get_card(card_id)
    return card


@schema.tool
async def businessmap_create_card(
    board_id: str = Parameter(description="Board ID"),
    workflow_id: str = Parameter(description="Workflow ID"),
    lane_id: str = Parameter(description="Lane ID"),
    column_id: str = Parameter(description="Column ID"),
    title: str = Parameter(description="Card title"),
    description: str = Parameter(description="Card description", default=""),
    priority: Optional[str] = Parameter(description="Card priority", default=None),
    assignee_ids: Optional[str] = Parameter(description="Comma-separated list of assignee IDs", default=None),
) -> Any:
    """Create a new card in Businessmap."""
    # Check if running in read-only mode
    if os.getenv("READ_ONLY_MODE", "").lower() in ("true", "1", "yes"):
        return {"error": "Cannot create card in read-only mode"}
    
    businessmap = BusinessmapResource()
    client = businessmap.client
    
    assignee_id_list = None
    if assignee_ids:
        assignee_id_list = assignee_ids.split(",")
    
    card = client.create_card(
        board_id=board_id,
        workflow_id=workflow_id,
        lane_id=lane_id,
        column_id=column_id,
        title=title,
        description=description,
        priority=priority,
        assignee_ids=assignee_id_list,
    )
    
    return card


@schema.tool
async def businessmap_update_card(
    card_id: str = Parameter(description="Card ID to update"),
    title: Optional[str] = Parameter(description="New card title", default=None),
    description: Optional[str] = Parameter(description="New card description", default=None),
    column_id: Optional[str] = Parameter(description="New column ID", default=None),
    lane_id: Optional[str] = Parameter(description="New lane ID", default=None),
    priority: Optional[str] = Parameter(description="New priority", default=None),
    assignee_ids: Optional[str] = Parameter(description="Comma-separated list of new assignee IDs", default=None),
) -> Any:
    """Update an existing card in Businessmap."""
    # Check if running in read-only mode
    if os.getenv("READ_ONLY_MODE", "").lower() in ("true", "1", "yes"):
        return {"error": "Cannot update card in read-only mode"}
    
    businessmap = BusinessmapResource()
    client = businessmap.client
    
    assignee_id_list = None
    if assignee_ids:
        assignee_id_list = assignee_ids.split(",")
    
    card = client.update_card(
        card_id=card_id,
        title=title,
        description=description,
        column_id=column_id,
        lane_id=lane_id,
        priority=priority,
        assignee_ids=assignee_id_list,
    )
    
    return card


@schema.tool
async def businessmap_delete_card(
    card_id: str = Parameter(description="Card ID to delete"),
) -> bool:
    """Delete a card from Businessmap."""
    # Check if running in read-only mode
    if os.getenv("READ_ONLY_MODE", "").lower() in ("true", "1", "yes"):
        return {"error": "Cannot delete card in read-only mode"}
    
    businessmap = BusinessmapResource()
    client = businessmap.client
    
    result = client.delete_card(card_id)
    return result


@schema.tool
async def businessmap_add_comment(
    card_id: str = Parameter(description="Card ID"),
    text: str = Parameter(description="Comment text"),
) -> Any:
    """Add a comment to a card in Businessmap."""
    # Check if running in read-only mode
    if os.getenv("READ_ONLY_MODE", "").lower() in ("true", "1", "yes"):
        return {"error": "Cannot add comment in read-only mode"}
    
    businessmap = BusinessmapResource()
    client = businessmap.client
    
    comment = client.add_comment(card_id, text)
    return comment


# Server runner
async def run_server(transport: str = "stdio", port: int = 8000) -> None:
    """Run the MCP server with the specified transport.
    
    Args:
        transport: Transport type (stdio or sse)
        port: Port number for SSE transport
    """
    logger.info(f"Starting MCP Businessmap server with {transport} transport")
    
    if transport == "stdio":
        # Run with standard I/O transport
        server = mcp.StdioServer(schema)
        await server.run()
    elif transport == "sse":
        # Run with SSE transport
        server = mcp.SseServer(schema, port=port)
        await server.run()
    else:
        logger.error(f"Unsupported transport: {transport}")
        raise ValueError(f"Unsupported transport: {transport}") 