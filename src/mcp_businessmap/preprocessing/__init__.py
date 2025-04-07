"""Preprocessing module for cleaning and formatting text content from Businessmap."""

import re
from typing import Optional


class BusinessmapPreprocessor:
    """Preprocessor for cleaning and converting Businessmap text content."""

    def __init__(self, base_url: Optional[str] = None):
        """Initialize the preprocessor.
        
        Args:
            base_url: Base URL of the Businessmap instance
        """
        self.base_url = base_url
    
    def clean_text(self, text: str) -> str:
        """Clean text content from Businessmap API response.
        
        Args:
            text: Raw text from Businessmap
            
        Returns:
            Cleaned text
        """
        if not text:
            return ""
        
        # Replace HTML entities
        text = text.replace("&lt;", "<").replace("&gt;", ">").replace("&amp;", "&")
        
        # Replace Businessmap card references with links
        if self.base_url:
            # Match card references like [card:123]
            card_pattern = r'\[card:(\d+)\]'
            text = re.sub(
                card_pattern,
                lambda m: f"[Card #{m.group(1)}]({self.base_url}/view/card/{m.group(1)})",
                text
            )
        
        return text
    
    def markdown_to_businessmap(self, markdown_text: str) -> str:
        """Convert Markdown to Businessmap format.
        
        Args:
            markdown_text: Text in Markdown format
            
        Returns:
            Text in Businessmap format
        """
        if not markdown_text:
            return ""
        
        # Kanbanize appears to support Markdown, so we might not need any conversion
        # This would need to be adjusted based on actual Kanbanize formatting requirements
        
        return markdown_text 