import os
from dotenv import load_dotenv
from abc import ABC, abstractmethod

from anthropic import Anthropic
from openai import OpenAI
import google.generativeai as genai


load_dotenv()


class LLMProvider(ABC):

    @abstractmethod
    def generate(self, prompt: str, max_tokens: int = 2000) -> str:
        """
        Generate a response from the LLM.

        Args:
            prompt: The prompt to send to the LLM
            max_tokens: Maximum tokens in the response

        Returns:
            The generated text response
        """
        pass


class OpenAIProvider(LLMProvider):

    def __init__(self, model: str = "gpt-4o"):
        self.client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        self.model = model

    def generate(self, prompt: str, max_tokens: int = 2000) -> str:
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=max_tokens
        )
        return response.choices[0].message.content.strip()


class AnthropicProvider(LLMProvider):

    def __init__(self, model: str = "claude-sonnet-4-20250514"):
        self.client = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))
        self.model = model

    def generate(self, prompt: str, max_tokens: int = 2000) -> str:
        message = self.client.messages.create(
            model=self.model,
            max_tokens=max_tokens,
            messages=[{"role": "user", "content": prompt}]
        )
        return message.content[0].text.strip()


class GeminiProvider(LLMProvider):

    def __init__(self, model: str = "gemini-2.0-flash-exp"):
        genai.configure(os.getenv('GEMINI_API_KEY'))
        self.model = genai.GenerativeModel(model)

    def generate(self, prompt: str, max_tokens: int = 2000) -> str:
        response = self.model.generate_content(
            prompt,
            generation_config={"max_output_tokens": max_tokens}
        )
        return response.text.strip()


def get_llm_provider(provider: str = "anthropic", **kwargs) -> LLMProvider:

    providers = {
        'openai': OpenAIProvider,
        'anthropic': AnthropicProvider,
        'gemini': GeminiProvider
    }

    provider_lower = provider.lower()
    if provider_lower not in providers:
        raise ValueError(
            f"Unknown provider: {provider}. "
            f"Available providers: {', '.join(providers.keys())}"
        )

    return providers[provider_lower](**kwargs)
