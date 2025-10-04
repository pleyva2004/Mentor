from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from provider import get_llm_provider
from extract import parseLLMResponse
import fitz

from course_scraper import scrapeCourseRequirements

app = FastAPI(title="Mentor Resume Parser", description="FastAPI app for PDF resume processing")
client = get_llm_provider(provider="openai")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def extract_text_from_pdf(file_content: bytes) -> str:
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

    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    content = await file.read()

    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max size is 10MB")

    extracted_text = extract_text_from_pdf(content)


    prompt = f"""
    You are an information extraction system. You will receive the full extracted text of a resume.  
    Your task is to identify and return ONLY the following information in a strict JSON object:

    - `college_name`: The name of the college or university the candidate attended.  
    - `major`: The candidate’s major or field of study.  
    - `graduation_year`: The 4-digit year of graduation (e.g., 2025).  

    If any of these pieces of information are NOT found in the text, return the value `False` for that field.

    Do not include explanations, extra text, or formatting outside the JSON.  
    Return only a valid JSON object.

    Here is the required JSON schema:
    ```json
    {{
    "college_name": "string or False",
    "major": "string or False",
    "graduation_year": "number or False"
    }}
    ````

    Output:
    ```json
    {{
    "college_name": "New Jersey Institute of Technology",
    "major": "Applied Statistics",
    "gradu ation_year": 2026
    }}
    ````

    Example if some fields are missing

    ```json
    {{
    "college_name": "False",
    "major": "Computer Science",
    "graduation_year": "False"
    }}  
    ```

    Resume text:

    ```
    {extracted_text}
    ```

    Output:

    """
    response = client.generate(prompt)
    parsed_response = parseLLMResponse(response)
    college_name = parsed_response["college_name"]
    major = parsed_response["major"]
    graduation_year = parsed_response["graduation_year"]

    course_work = scrapeCourseRequirements(college_name, major)

    return JSONResponse(content={
        "filename": file.filename,
        "text": extracted_text,
        "course_work": course_work
    })

@app.get("/")
async def root():
    return {"message": "Mentor Resume Parser API"}