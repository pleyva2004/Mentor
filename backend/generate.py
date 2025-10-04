from provider import get_llm_provider

client = get_llm_provider(provider="openai")

message = client.generate("What is 2+2?", max_tokens=2000)

print(message)