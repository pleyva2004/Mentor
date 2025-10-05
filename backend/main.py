from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from provider import get_llm_provider
from extract import parseLLMResponse, parseHTMLResponse
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

    prompt_header = f"""
   You are a structured information extraction assistant. Given the extracted plain text from a resume, your job is to identify and format the candidate's contact information into a single HTML paragraph tag in the following format:

    OUTPUT FORMAT:
    <p>Full Name | Job Title (if available, else skip) | Location (City, State) | Phone Number | Email Address | LinkedIn URL | GitHub URL</p>

    If any field is missing from the resume text, omit it without adding a placeholder.

    Only return the HTML string. Do not include any explanations or additional text.

    Here is the resume text:

    {extracted_text}

    OUTPUT:

    """

    response = client.generate(prompt_header)
    header = parseHTMLResponse(response)  # Clean HTML response

    prompt_projects = f"""
    You are a structured resume-to-HTML converter. Given plain extracted text from a resume that includes technical projects, your task is to identify and format **each project** into HTML using the following structure:

    OUTPUT FORMAT:
    <h4>Project Title</h4>
    <p><em>Short Project Description | Technologies Used | Date</em></p>
    <ul>
    <li>First bullet about the project (quantified or results-oriented if available)</li>
    <li>Second bullet about the project</li>
    <li>Third bullet about the project</li>
    </ul>
    

    Instructions:
    - Each project should follow this format.
    - Preserve technologies, tools, dates, and quantified results when mentioned.
    - Only include what is available — if the date is missing, you can skip it in the <em> block.
    - Do NOT hallucinate any content.
    - Output valid HTML.
    - Do not wrap the entire output in a single `<html>` or `<body>` tag. Just output the formatted blocks.

    NOTHING BUT THE HTML OUTPUT. NO EXPLANATIONS, NO ADDITIONAL TEXT, NO COMMENTS, NO STEPS, NO THINGS LIKE THAT.

    Here is the extracted resume text:

    {extracted_text}

    """

    response = client.generate(prompt_projects)
    projects = parseHTMLResponse(response)  # Clean HTML response

    prompt_skills = f"""
    You are a structured resume-to-HTML converter. Given plain extracted resume text that lists a candidate's technical skills, your task is to format the information into HTML paragraphs, grouping the skills into the following categories:

    1. Languages
    2. Frameworks/Libraries
    3. Databases
    4. Cloud/DevOps
    5. AI/ML

    OUTPUT FORMAT:

    <p><strong>Languages:</strong> [comma-separated list]</p>  
    <p><strong>Frameworks/Libraries:</strong> [comma-separated list]</p>  
    <p><strong>Databases:</strong> [comma-separated list]</p>  
    <p><strong>Cloud/DevOps:</strong> [comma-separated list]</p>

    INSTRUCTIONS:
    - Only include categories that appear in the input text. If a category is not present, skip it.
    - Group tools under the most appropriate category (e.g., “AWS” goes under Cloud/DevOps, “React” under Frameworks/Libraries).
    - Preserve the exact technology names and versions (e.g., "JavaScript (ES6+)", "AWS (EC2, S3, Lambda)").
    - Do not hallucinate or infer missing tools.
    - Output valid HTML only, no extra text.

    NOTHING BUT THE HTML OUTPUT. NO EXPLANATIONS, NO ADDITIONAL TEXT, NO COMMENTS, NO STEPS, NO THINGS LIKE THAT.

    Here is the extracted resume text:

    {extracted_text}
    """
    response = client.generate(prompt_skills)
    skills = parseHTMLResponse(response)  # Clean HTML response
    
    prompt_experience = f"""
    You are a structured information extraction assistant. Given the extracted plain text from a resume, your job is to identify and format the candidate's experience into a single HTML paragraph tag in the following format:


    OUTPUT FORMAT:

    <h4>Job Title</h4>  
    <p><em>Company Name | Location (City, State) | Start Date - End Date</em></p>  
    <ul>  
    <li>Responsibility or achievement 1 (quantified if available)</li>  
    <li>Responsibility or achievement 2</li>  
    <li>Responsibility or achievement 3</li>  
    </ul>

    INSTRUCTIONS:
    - Format **each work experience** entry following this structure.
    - Keep bullets factual, measurable, and written in past tense.
    - Include up to **3 key bullet points** per job — prioritize technical achievements, leadership, and results.
    - Use <em> for the company, location, and dates line.
    - If a date is missing, leave it out.
    - Do **not** add summary text or wrap in `<html>` or `<body>` tags.
    - Do not hallucinate or infer missing content.

    NOTHING BUT THE HTML OUTPUT. NO EXPLANATIONS, NO ADDITIONAL TEXT, NO COMMENTS, NO STEPS, NO THINGS LIKE THAT.

    Here is the extracted resume text:

    {extracted_text}
    """

    response = client.generate(prompt_experience)
    experience = parseHTMLResponse(response)  # Clean HTML response

    prompt_education = f"""
    You are an HTML generator that converts education information from a resume into structured HTML.

    Your goal is to extract the **degree**, **institution**, **location**, **graduation date**, and **relevant coursework** (if mentioned), and format it using the following structure:

    OUTPUT FORMAT:

    <h4>Degree</h4>  
    <p><em>School Name | City, State | Graduated [Month Year]</em></p>  
    <p><strong>Relevant Coursework:</strong> [comma-separated list]</p>

    INSTRUCTIONS:

    INSTRUCTIONS:
    - Only return valid HTML.
    - If relevant coursework is **not** mentioned, omit that line.
    - If graduation date is missing, skip it in the <em> tag (but still include school and location).
    - Do **not** hallucinate any information.
    - Do not wrap in <html> or <body> tags.
    

    NOTHING BUT THE HTML OUTPUT. NO EXPLANATIONS, NO ADDITIONAL TEXT, NO COMMENTS, NO STEPS, NO THINGS LIKE THAT.

    Here is the extracted resume text:

    {extracted_text}

    """

    response = client.generate(prompt_education)
    education = parseHTMLResponse(response)  # Clean HTML response
    print(education)

    return JSONResponse(content={
        "filename": file.filename,
        "text": extracted_text,
        "header": header,
        "projects": projects,
        "skills": skills,
        "experience": experience,
        "education": education,
        "course_work": course_work
    })

@app.get("/")
async def root():
    return {"message": "Mentor Resume Parser API"}