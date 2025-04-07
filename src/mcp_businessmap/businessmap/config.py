"""Configuration module for Businessmap API interactions."""

import os
from dataclasses import dataclass


@dataclass
class BusinessmapConfig:
    """Businessmap (Kanbanize) API configuration."""

    url: str  # Base URL for Kanbanize
    apikey: str  # API key for authentication
    ssl_verify: bool = True  # Whether to verify SSL certificates
    boards_filter: str | None = None  # List of board IDs to filter

    @classmethod
    def from_env(cls) -> "BusinessmapConfig":
        """Create configuration from environment variables.

        Returns:
            BusinessmapConfig with values from environment variables

        Raises:
            ValueError: If required environment variables are missing or invalid
        """
        url = os.getenv("BUSINESSMAP_URL")
        if not url:
            error_msg = "Missing required BUSINESSMAP_URL environment variable"
            raise ValueError(error_msg)

        apikey = os.getenv("BUSINESSMAP_APIKEY")
        if not apikey:
            error_msg = "Missing required BUSINESSMAP_APIKEY environment variable"
            raise ValueError(error_msg)

        # SSL verification
        ssl_verify_env = os.getenv("BUSINESSMAP_SSL_VERIFY", "true").lower()
        ssl_verify = ssl_verify_env not in ("false", "0", "no")

        # Get the boards filter if provided
        boards_filter = os.getenv("BUSINESSMAP_BOARDS_FILTER")

        return cls(
            url=url,
            apikey=apikey,
            ssl_verify=ssl_verify,
            boards_filter=boards_filter,
        ) 