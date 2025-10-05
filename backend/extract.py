import json
import re

def clean_llm_response(response: str, response_type: str = "json") -> str:
    """
    Clean LLM response by removing common markdown artifacts and unwanted text.
    
    Args:
        response (str): Raw LLM response
        response_type (str): Expected response type ("json" or "html")
    
    Returns:
        str: Cleaned response
    """
    # Remove code block markers (safe if not present)
    response = response.replace("```", "")
    
    # Remove common language identifiers (safe if not present)
    response = response.replace("json", "").replace("html", "")
    
    # Remove common markdown artifacts at start of lines (safe if pattern doesn't match)
    response = re.sub(r'^(json|html)\s*', '', response, flags=re.IGNORECASE | re.MULTILINE)
    
    # Clean up extra whitespace
    response = response.strip()
    
    return response

def parseLLMResponse(response: str) -> list[dict]:
    """Parse JSON response from LLM after cleaning."""
    cleaned_response = clean_llm_response(response, "json")
    return json.loads(cleaned_response)

def parseHTMLResponse(response: str) -> str:
    """Parse HTML response from LLM after cleaning."""
    return clean_llm_response(response, "html")