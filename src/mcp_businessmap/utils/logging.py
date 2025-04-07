"""Logging utilities for MCP Businessmap."""

import logging
import os
import sys
from logging.handlers import RotatingFileHandler
from pathlib import Path


def setup_logging(level: int = logging.WARNING) -> logging.Logger:
    """Set up logging configuration.
    
    Args:
        level: Logging level (default: WARNING)
        
    Returns:
        Configured logger
    """
    # Create logger
    logger = logging.getLogger("mcp-businessmap")
    logger.setLevel(level)
    
    # Reset handlers to avoid duplicates
    logger.handlers = []
    
    # Create formatters
    console_formatter = logging.Formatter("%(levelname)s: %(message)s")
    file_formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    
    # Create console handler
    console_handler = logging.StreamHandler(sys.stderr)
    console_handler.setLevel(level)
    console_handler.setFormatter(console_formatter)
    logger.addHandler(console_handler)
    
    # Create file handler in user logs directory
    try:
        # Define log directory based on platform
        if sys.platform == "darwin":  # macOS
            log_dir = Path.home() / "Library" / "Logs" / "Claude"
        elif sys.platform == "win32":  # Windows
            log_dir = Path.home() / "AppData" / "Local" / "Claude" / "Logs"
        else:  # Linux, etc.
            log_dir = Path.home() / ".local" / "share" / "claude" / "logs"
        
        # Create directory if it doesn't exist
        os.makedirs(log_dir, exist_ok=True)
        
        # Create rotating file handler (10 MB max, 5 backups)
        log_file = log_dir / "mcp-businessmap.log"
        file_handler = RotatingFileHandler(
            log_file, maxBytes=10 * 1024 * 1024, backupCount=5
        )
        file_handler.setLevel(level)
        file_handler.setFormatter(file_formatter)
        logger.addHandler(file_handler)
    except Exception as e:
        # If file logging fails, just log to console
        logger.warning(f"Could not set up file logging: {e}")
    
    return logger 