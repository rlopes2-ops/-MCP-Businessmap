"""Base client module for Businessmap (Kanbanize) API interactions."""

import logging
import requests
from typing import Any, Dict, List, Optional, Union

from ..preprocessing import BusinessmapPreprocessor
from .config import BusinessmapConfig

# Configure logging
logger = logging.getLogger("mcp-businessmap")


class BusinessmapClient:
    """Base client for Businessmap (Kanbanize) API interactions."""

    def __init__(self, config: BusinessmapConfig | None = None) -> None:
        """Initialize the Businessmap client with configuration options.

        Args:
            config: Optional configuration object (will use env vars if not provided)

        Raises:
            ValueError: If configuration is invalid or required credentials are missing
        """
        # Load configuration from environment variables if not provided
        self.config = config or BusinessmapConfig.from_env()

        # Initialize the requests session
        self.session = requests.Session()
        
        # Configure authentication - Kanbanize uses apikey in header
        self.session.headers.update({
            "apikey": self.config.apikey,
            "Content-Type": "application/json"
        })

        # Configure SSL verification
        self.session.verify = self.config.ssl_verify
        
        # Initialize the text preprocessor for text processing capabilities
        self.preprocessor = BusinessmapPreprocessor(base_url=self.config.url)

        # Cache for frequently used data
        self._boards_data: Optional[List[Dict[str, Any]]] = None
        self._current_user_data: Optional[Dict[str, Any]] = None
    
    def _clean_text(self, text: str) -> str:
        """Clean text content.

        Args:
            text: Text to clean

        Returns:
            Cleaned text
        """
        if not text:
            return ""

        return self.preprocessor.clean_text(text)
    
    def _make_request(self, method: str, endpoint: str, **kwargs) -> Any:
        """Make a request to the Kanbanize API.
        
        Args:
            method: HTTP method (get, post, put, delete)
            endpoint: API endpoint path
            **kwargs: Additional arguments to pass to requests
            
        Returns:
            JSON response data
            
        Raises:
            HTTPError: If the request fails
        """
        url = f"{self.config.url}{endpoint}"
        response = self.session.request(method, url, **kwargs)
        response.raise_for_status()
        
        if response.content:
            return response.json()
        return None 