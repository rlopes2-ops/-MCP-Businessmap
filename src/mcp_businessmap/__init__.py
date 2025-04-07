import asyncio
import logging
import os

import click
from dotenv import load_dotenv

from .utils.logging import setup_logging

__version__ = "0.1.0"

# Initialize logging with appropriate level
logging_level = logging.WARNING
if os.getenv("MCP_VERBOSE", "").lower() in ("true", "1", "yes"):
    logging_level = logging.DEBUG

# Set up logging using the utility function
logger = setup_logging(logging_level)


@click.command()
@click.option(
    "-v",
    "--verbose",
    count=True,
    help="Increase verbosity (can be used multiple times)",
)
@click.option(
    "--env-file", type=click.Path(exists=True, dir_okay=False), help="Path to .env file"
)
@click.option(
    "--transport",
    type=click.Choice(["stdio", "sse"]),
    default="stdio",
    help="Transport type (stdio or sse)",
)
@click.option(
    "--port",
    default=8000,
    help="Port to listen on for SSE transport",
)
@click.option(
    "--businessmap-url",
    help="Businessmap URL (e.g., https://your-instance.kanbanize.com)",
)
@click.option(
    "--businessmap-apikey", 
    help="Businessmap API Key"
)
@click.option(
    "--businessmap-ssl-verify/--no-businessmap-ssl-verify",
    default=True,
    help="Verify SSL certificates for Businessmap (default: verify)",
)
@click.option(
    "--businessmap-boards-filter",
    help="Comma-separated list of Businessmap board IDs to filter results",
)
@click.option(
    "--read-only",
    is_flag=True,
    help="Run in read-only mode (disables all write operations)",
)
def main(
    verbose: bool,
    env_file: str | None,
    transport: str,
    port: int,
    businessmap_url: str | None,
    businessmap_apikey: str | None,
    businessmap_ssl_verify: bool,
    businessmap_boards_filter: str | None,
    read_only: bool = False,
) -> None:
    """MCP Businessmap Server - Kanbanize functionality for MCP"""
    
    # Configure logging based on verbosity
    logging_level = logging.WARNING
    if verbose == 1:
        logging_level = logging.INFO
    elif verbose >= 2:
        logging_level = logging.DEBUG

    # Use our utility function for logging setup
    global logger
    logger = setup_logging(logging_level)

    # Load environment variables from file if specified, otherwise try default .env
    if env_file:
        logger.debug(f"Loading environment from file: {env_file}")
        load_dotenv(env_file)
    else:
        logger.debug("Attempting to load environment from default .env file")
        load_dotenv()

    # Set environment variables from command line arguments if provided
    if businessmap_url:
        os.environ["BUSINESSMAP_URL"] = businessmap_url
    if businessmap_apikey:
        os.environ["BUSINESSMAP_APIKEY"] = businessmap_apikey

    # Set read-only mode from CLI flag
    if read_only:
        os.environ["READ_ONLY_MODE"] = "true"

    # Set SSL verification for Businessmap
    os.environ["BUSINESSMAP_SSL_VERIFY"] = str(businessmap_ssl_verify).lower()

    # Set boards filter for Businessmap
    if businessmap_boards_filter:
        os.environ["BUSINESSMAP_BOARDS_FILTER"] = businessmap_boards_filter

    from . import server

    # Run the server with specified transport
    asyncio.run(server.run_server(transport=transport, port=port))


__all__ = ["main", "server", "__version__"]

if __name__ == "__main__":
    main() 