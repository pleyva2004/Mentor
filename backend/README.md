# Mentór

FastAPI app for PDF resume processing

## Description

This is a FastAPI application that processes PDF resumes and provides various functionalities including:
- PDF resume processing using PyMuPDF
- Web scraping capabilities with BeautifulSoup
- Integration with Anthropic's AI services
- Course scraping functionality

## Installation

```bash
poetry install
```

## Running the application

```bash
poetry run uvicorn main:app --reload
```

## Dependencies

- FastAPI
- Uvicorn
- PyMuPDF for PDF processing
- BeautifulSoup4 for web scraping
- Anthropic for AI integration
- Python-dotenv for environment management
