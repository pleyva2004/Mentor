from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import fitz
from typing import Optional

app = FastAPI(title="Mentor Resume Parser", description="FastAPI app for PDF resume processing")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF bytes"""
    try:
        doc = fitz.open(stream=file_content, filetype="pdf")
        text = ''

        for page in doc:
            text += page.get_text()

        doc.close()

        if len(text.strip()) < 50:
            raise ValueError("PDF appears to be empty or scanned")

        return text.strip()

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error extracting text: {str(e)}")

@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    """Upload and extract text from resume PDF"""

    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    content = await file.read()

    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max size is 10MB")

    extracted_text = extract_text_from_pdf(content)

    return JSONResponse(content={
        "filename": file.filename,
        "text": extracted_text,
        "character_count": len(extracted_text)
    })

@app.get("/")
async def root():
    return {"message": "Mentor Resume Parser API"}