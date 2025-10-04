import json

def parseLLMResponse(response: str) -> list[dict]:
    response = response.replace("```", "").replace("json", "")
    return json.loads(response)