"""Businessmap (Kanbanize) API client and related modules."""

from .cards import CardsMixin
from .client import BusinessmapClient
from .comments import CommentsMixin
from .config import BusinessmapConfig
from .search import SearchMixin


class BusinessmapAPI(BusinessmapClient, CardsMixin, CommentsMixin, SearchMixin):
    """Complete Businessmap API client combining all functionality."""
    
    pass


__all__ = ["BusinessmapAPI", "BusinessmapClient", "BusinessmapConfig"] 