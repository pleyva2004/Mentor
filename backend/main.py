from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from provider import get_llm_provider
from extract import parseLLMResponse, parseHTMLResponse
import fitz
import json
import os
import uuid
import re
from datetime import datetime
from typing import Dict, Any, Optional

from course_scraper import scrapeCourseRequirements

app = FastAPI(title="Mentor Resume Parser", description="FastAPI app for PDF resume processing")
client = get_llm_provider(provider="openai")

# Data persistence functions
def ensure_resumes_dir():
    """Ensure the resumes directory exists"""
    if not os.path.exists("resumes"):
        os.makedirs("resumes")

def save_resume_data(resume_id: str, data: dict):
    """Save resume data to file"""
    ensure_resumes_dir()
    with open(f"resumes/{resume_id}.json", "w") as f:
        json.dump(data, f, indent=2)

def load_resume_data(resume_id: str) -> Optional[dict]:
    """Load resume data from file"""
    try:
        with open(f"resumes/{resume_id}.json", "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return None

def parse_section_with_fallback(section_id: str, raw_text: str) -> str:
    """Parse a specific section with fallback mechanisms"""
    lines = [line.strip() for line in raw_text.split('\n') if line.strip()]
    
    try:
        # Try AI parsing first
        prompt = f"""
        You are a structured information extraction assistant. Given the extracted plain text from a resume, your job is to identify and format the {section_id} section into clean HTML.

        For {section_id} section, extract and format the relevant information into proper HTML structure.
        Return only valid HTML, no explanations.

        Resume text:
        {raw_text}

        OUTPUT:
        """
        
        response = client.generate(prompt)
        return parseHTMLResponse(response)
    except Exception as e:
        print(f"AI parsing failed for {section_id}: {e}")
        # Fall back to regex parsing
        return parse_raw_text_for_section(section_id, raw_text)

def parse_raw_text_for_section(section_id: str, raw_text: str) -> str:
    """Fallback parsing using regex patterns"""
    lines = [line.strip() for line in raw_text.split('\n') if line.strip()]
    
    if section_id == 'header':
        # Look for contact info patterns
        contact_info = []
        for line in lines:
            if '@' in line or re.match(r'\d{3}[-.]?\d{3}[-.]?\d{4}', line) or 'linkedin.com' in line or 'github.com' in line:
                contact_info.append(line)
        return f"<p>{' | '.join(contact_info)}</p>" if contact_info else "<p>Contact information not found</p>"
    
    elif section_id == 'projects':
        project_lines = [line for line in lines if any(word in line.lower() for word in ['project', 'built', 'developed', 'created'])]
        if project_lines:
            return f"<ul>{''.join(f'<li>{line}</li>' for line in project_lines)}</ul>"
        return "<p>No project information found</p>"
    
    elif section_id == 'skills':
        skill_lines = [line for line in lines if any(word in line.lower() for word in ['skill', 'language', 'technology']) or re.search(r'\b(JavaScript|Python|Java|C\+\+|React|Node|SQL|AWS|Docker|Git)\b', line, re.I)]
        if skill_lines:
            return f"<p><strong>Skills:</strong> {', '.join(skill_lines)}</p>"
        return "<p>No skills information found</p>"
    
    elif section_id == 'experience':
        exp_lines = [line for line in lines if any(word in line.lower() for word in ['experience', 'work', 'intern', 'job']) or re.search(r'\d{4}.*\d{4}', line)]
        if exp_lines:
            return f"<ul>{''.join(f'<li>{line}</li>' for line in exp_lines)}</ul>"
        return "<p>No experience information found</p>"
    
    elif section_id == 'education':
        edu_lines = [line for line in lines if any(word in line.lower() for word in ['education', 'degree', 'university', 'college', 'bachelor', 'master']) or re.search(r'\b(BS|BA|MS|MA|PhD|Bachelor|Master|Doctorate)\b', line, re.I)]
        if edu_lines:
            return f"<ul>{''.join(f'<li>{line}</li>' for line in edu_lines)}</ul>"
        return "<p>No education information found</p>"
    
    return "<p>No information found for this section</p>"


def is_section_valid(section_id: str, html_content: str) -> bool:
    """Simple heuristics to validate section content and detect misclassification."""
    if not html_content or len(html_content.strip()) < 10:
        return False

    lowered = html_content.lower()

    if section_id == 'education':
        # Expect a school or degree keyword
        edu_keywords = [
            'university', 'college', 'institute of technology', 'bachelor', 'master', 'phd',
            'bs ', 'ba ', 'ms ', 'ma ', 'degree', 'graduat'
        ]
        return any(k in lowered for k in edu_keywords)

    if section_id == 'projects':
        proj_keywords = ['project', 'built', 'developed', 'created']
        return any(k in lowered for k in proj_keywords)

    if section_id == 'experience':
        exp_keywords = ['experience', 'intern', 'engineer', 'company', 'worked']
        return any(k in lowered for k in exp_keywords)

    if section_id == 'skills':
        skill_keywords = ['skills', 'languages', 'frameworks', 'databases', 'cloud', 'devops', 'ai/ml']
        tech_regex = r"(python|javascript|java|c\+\+|react|node|sql|aws|docker|git)"
        return any(k in lowered for k in skill_keywords) or re.search(tech_regex, lowered, re.I) is not None

    if section_id == 'header':
        return ('@' in html_content) or re.search(r"\d{3}[-.]?\d{3}[-.]?\d{4}", html_content) is not None

    return True


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add explicit CORS headers middleware
@app.middleware("http")
async def add_cors_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "*"
    return response

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

@app.options("/upload-resume")
async def upload_resume_options():
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        }
    )

@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):

    resume_data = {}

    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    content = await file.read()

    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max size is 10MB")

    extracted_text = extract_text_from_pdf(content)

    # Generate unique resume ID early for error handling
    resume_id = str(uuid.uuid4())

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
    "graduation_year": 2026
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
    try:
        response = client.generate(prompt)
        parsed_response = parseLLMResponse(response)
        college_name = parsed_response["college_name"]
        major = parsed_response["major"]
        graduation_year = parsed_response["graduation_year"]

        resume_data.update(parsed_response)

        print(f"🔍 Extracted from resume - College: {college_name}, Major: {major}")
        # course_work = scrapeCourseRequirements(college_name, major)
        print(f"Found {len(course_work)} courses for {college_name} {major}")
    except Exception as e:
        print(f"Error in LLM processing: {e}")
        # Fallback values if API fails
        college_name = "Unknown"
        major = "Unknown"
        graduation_year = "Unknown"
        course_work = []
        
        # If quota exceeded, return early to avoid more API calls
        if "quota" in str(e).lower() or "429" in str(e):
            return {
                "resume_id": resume_id,
                "header": "Please add your contact information manually",
                "projects": "Please add your projects manually", 
                "skills": "Please add your skills manually",
                "experience": "Please add your work experience manually",
                "school_name": "Please add your education manually",
                "course_work": [],
                "raw_text": extracted_text
            }

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

    try:
        response = client.generate(prompt_header)
        header = parseHTMLResponse(response)  # Clean HTML response
        print(f"Header processing successful: {header[:100]}...")
    except Exception as e:
        print(f"Error in header processing: {e}")
        print(f"Exception type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        header = "<p>Contact information not available</p>"
        # If quota exceeded, return early
        if "quota" in str(e).lower() or "429" in str(e):
            return {
                "resume_id": resume_id,
                "header": "Please add your contact information manually",
                "projects": "Please add your projects manually", 
                "skills": "Please add your skills manually",
                "experience": "Please add your work experience manually",
                "education": "Please add your education manually",
                "course_work": course_work,
                "raw_text": extracted_text
            }

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

    try:
        response = client.generate(prompt_projects)
        projects = parseHTMLResponse(response)  # Clean HTML response
        # Heuristic: if projects looks invalid, fallback to regex parser
        if not is_section_valid('projects', projects):
            projects = parse_raw_text_for_section('projects', extracted_text)
    except Exception as e:
        print(f"Error in projects processing: {e}")
        projects = parse_raw_text_for_section('projects', extracted_text)

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
    try:
        response = client.generate(prompt_skills)
        skills = parseHTMLResponse(response)  # Clean HTML response
        if not is_section_valid('skills', skills):
            skills = parse_raw_text_for_section('skills', extracted_text)
    except Exception as e:
        print(f"Error in skills processing: {e}")
        skills = parse_raw_text_for_section('skills', extracted_text)
    
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

    try:
        response = client.generate(prompt_experience)
        experience = parseHTMLResponse(response)  # Clean HTML response
        if not is_section_valid('experience', experience):
            experience = parse_raw_text_for_section('experience', extracted_text)
    except Exception as e:
        print(f"Error in experience processing: {e}")
        experience = parse_raw_text_for_section('experience', extracted_text)

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

    try:
        response = client.generate(prompt_education)
        education = parseHTMLResponse(response)  # Clean HTML response
        if not is_section_valid('education', education):
            education = parse_raw_text_for_section('education', extracted_text)
    except Exception as e:
        print(f"Error in education processing: {e}")
        education = parse_raw_text_for_section('education', extracted_text)

    # Save data (resume_id already generated)
    resume_data.update({
        "resume_id": resume_id,
        "filename": file.filename,
        "text": extracted_text,
        "character_count": len(extracted_text),
        "header": header,
        "projects": projects,
        "skills": skills,
        "experience": experience,
        "education": education,
        "course_work": course_work,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    })
    
    # Save to file system
    save_resume_data(resume_id, resume_data)

    return JSONResponse(content=resume_data)

@app.put("/update-section")
async def update_section(section_id: str, content: str, resume_id: str):
    """Update a specific section of a resume"""
    try:
        # Load existing resume data
        resume_data = load_resume_data(resume_id)
        if not resume_data:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        # Validate section_id
        valid_sections = ['header', 'projects', 'skills', 'experience', 'education']
        if section_id not in valid_sections:
            raise HTTPException(status_code=400, detail=f"Invalid section_id. Must be one of: {valid_sections}")
        
        # Update the section
        resume_data[section_id] = content
        resume_data['updated_at'] = datetime.now().isoformat()
        
        # Save updated data
        save_resume_data(resume_id, resume_data)
        
        return JSONResponse(content={
            "success": True,
            "section_id": section_id,
            "content": content,
            "updated_at": resume_data['updated_at']
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating section: {str(e)}")

@app.get("/resume/{resume_id}")
async def get_resume(resume_id: str):
    """Retrieve saved resume data"""
    try:
        resume_data = load_resume_data(resume_id)
        if not resume_data:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        return JSONResponse(content=resume_data)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving resume: {str(e)}")

@app.post("/parse-section")
async def parse_section(section_id: str, raw_text: str):
    """Parse a specific section from raw text"""
    try:
        # Validate section_id
        valid_sections = ['header', 'projects', 'skills', 'experience', 'education']
        if section_id not in valid_sections:
            raise HTTPException(status_code=400, detail=f"Invalid section_id. Must be one of: {valid_sections}")
        
        # Parse the section with fallback
        parsed_content = parse_section_with_fallback(section_id, raw_text)
        
        return JSONResponse(content={
            "section_id": section_id,
            "content": parsed_content,
            "success": True
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing section: {str(e)}")

@app.post("/validate-section")
async def validate_section(section_id: str, content: str):
    """Validate section content and provide suggestions"""
    try:
        # Basic validation rules
        validation_results = {
            "is_valid": True,
            "warnings": [],
            "suggestions": []
        }
        
        if section_id == 'header':
            if '@' not in content and 'email' not in content.lower():
                validation_results["warnings"].append("No email address found")
            if not re.search(r'\d{3}[-.]?\d{3}[-.]?\d{4}', content):
                validation_results["warnings"].append("No phone number found")
        
        elif section_id == 'experience':
            if not re.search(r'\d{4}', content):
                validation_results["warnings"].append("No dates found in experience")
            if len(content) < 100:
                validation_results["suggestions"].append("Consider adding more detail to your experience")
        
        elif section_id == 'education':
            if not re.search(r'\b(BS|BA|MS|MA|PhD|Bachelor|Master|Doctorate)\b', content, re.I):
                validation_results["warnings"].append("No degree information found")
        
        elif section_id == 'skills':
            if len(content) < 50:
                validation_results["suggestions"].append("Consider adding more technical skills")
        
        elif section_id == 'projects':
            if len(content) < 100:
                validation_results["suggestions"].append("Consider adding more project details")
        
        # Check if content is too short
        if len(content.strip()) < 20:
            validation_results["is_valid"] = False
            validation_results["warnings"].append("Content is too short")
        
        return JSONResponse(content=validation_results)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error validating section: {str(e)}")

@app.post("/integrate-courses")
async def integrate_courses(resume_id: str, selected_courses: list):
    """Integrate selected courses into education section"""
    try:
        # Load existing resume data
        resume_data = load_resume_data(resume_id)
        if not resume_data:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        # Format courses as HTML
        courses_html = ""
        if selected_courses:
            courses_list = "".join(f"<li>{course['code']}: {course['name']}</li>" for course in selected_courses)
            courses_html = f"""
            <p><strong>Relevant Coursework:</strong></p>
            <ul>{courses_list}</ul>
            """
        
        # Append to existing education content
        current_education = resume_data.get('education', '')
        if courses_html not in current_education:  # Avoid duplicates
            resume_data['education'] = current_education + courses_html
            resume_data['updated_at'] = datetime.now().isoformat()
            
            # Save updated data
            save_resume_data(resume_id, resume_data)
        
        return JSONResponse(content={
            "success": True,
            "education": resume_data['education'],
            "updated_at": resume_data['updated_at']
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error integrating courses: {str(e)}")

@app.post("/improve-text")
async def improve_text(text: str, improvement_type: str, context: str = ""):
    """
    Improve text using AI based on improvement type
    Types: 'rephrase', 'add-action-verb', 'quantify', 'grammar'
    """
    prompts = {
        'rephrase': f"Improve this resume text to be more impactful and professional. Context: {context}\n\nText: {text}\n\nReturn ONLY the improved text, no explanations.",
        'add-action-verb': f"Rewrite this bullet point starting with a strong action verb (Engineered, Implemented, Architected, etc.). Context: {context}\n\nText: {text}\n\nReturn ONLY the rewritten text.",
        'quantify': f"Add quantifiable metrics to this achievement. If specific numbers aren't known, suggest realistic placeholders like [X%] or [N users]. Context: {context}\n\nText: {text}\n\nReturn ONLY the improved text.",
        'grammar': f"Fix any grammar, spelling, or punctuation issues. Context: {context}\n\nText: {text}\n\nReturn ONLY the corrected text."
    }
    
    try:
        response = client.generate(prompts[improvement_type])
        return JSONResponse(content={
            "success": True,
            "original": text,
            "improved": response.strip(),
            "type": improvement_type
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error improving text: {str(e)}")

@app.post("/update-field")
async def update_field(resume_id: str, section_id: str, field_type: str, field_id: str, content: str):
    """Update a specific field within a section"""
    try:
        resume_data = load_resume_data(resume_id)
        if not resume_data:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        if 'field_updates' not in resume_data:
            resume_data['field_updates'] = {}
        
        field_key = f"{section_id}_{field_type}_{field_id}"
        resume_data['field_updates'][field_key] = {
            'content': content,
            'updated_at': datetime.now().isoformat()
        }
        
        resume_data['updated_at'] = datetime.now().isoformat()
        save_resume_data(resume_id, resume_data)
        
        return JSONResponse(content={
            "success": True,
            "field_key": field_key,
            "content": content
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating field: {str(e)}")

@app.post("/validate-education")
async def validate_education(req : Request):
    """Validate if school and major combination exists in course catalog"""

    
    try:

        body = await req.json()
        school = body['school']
        major = body['major']

        # Check if we can scrape courses for this combination
        courses = scrapeCourseRequirements(school, major)
        
        return {
            "valid": True,
            "can_scrape_courses": len(courses) > 0,
            "course_count": len(courses),
            "suggestions": []
        }
    except Exception as e:
        return {
            "valid": False,
            "can_scrape_courses": False,
            "course_count": 0,
            "suggestions": [],
            "error": str(e)
        }

@app.post("/associate-project")
async def associate_project(resume_id: str, course_code: str, project: dict):
    """Associate a project with a specific course"""
    try:
        resume_data = load_resume_data(resume_id)
        if not resume_data:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        if 'projects' not in resume_data:
            resume_data['projects'] = {}
        
        resume_data['projects'][course_code] = project
        resume_data['updated_at'] = datetime.now().isoformat()
        save_resume_data(resume_id, resume_data)
        
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error associating project: {str(e)}")

@app.post("/add-work-experience")
async def add_work_experience(resume_id: str, experience: dict):
    """Add work experience entry"""
    try:
        resume_data = load_resume_data(resume_id)
        if not resume_data:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        if 'work_experiences' not in resume_data:
            resume_data['work_experiences'] = []
        
        resume_data['work_experiences'].append(experience)
        resume_data['updated_at'] = datetime.now().isoformat()
        save_resume_data(resume_id, resume_data)
        
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding work experience: {str(e)}")

@app.put("/update-work-experience")
async def update_work_experience(resume_id: str, index: int, experience: dict):
    """Update specific work experience by index"""
    try:
        resume_data = load_resume_data(resume_id)
        if not resume_data:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        if 'work_experiences' not in resume_data:
            resume_data['work_experiences'] = []
        
        if index < len(resume_data['work_experiences']):
            resume_data['work_experiences'][index] = experience
            resume_data['updated_at'] = datetime.now().isoformat()
            save_resume_data(resume_id, resume_data)
            return {"success": True}
        else:
            raise HTTPException(status_code=400, detail="Invalid experience index")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating work experience: {str(e)}")

@app.delete("/remove-work-experience")
async def remove_work_experience(resume_id: str, index: int):
    """Remove work experience by index"""
    try:
        resume_data = load_resume_data(resume_id)
        if not resume_data:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        if 'work_experiences' in resume_data and index < len(resume_data['work_experiences']):
            resume_data['work_experiences'].pop(index)
            resume_data['updated_at'] = datetime.now().isoformat()
            save_resume_data(resume_id, resume_data)
            return {"success": True}
        else:
            raise HTTPException(status_code=400, detail="Invalid experience index")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error removing work experience: {str(e)}")

@app.post("/scrape-courses")
async def scrape_courses_endpoint(request: Request):
    """Fetch course catalog for school/major"""
    try:
        # Parse request body
        body = await request.json()
        school = body.get('school')
        major = body.get('major')
        resume_id = body.get('resume_id')
        
        if not school or not major:
            raise HTTPException(status_code=400, detail="School and major are required")
        
        print(f"📡 Scraping courses for: {school} | {major}")
        courses = scrapeCourseRequirements(school, major)
        print(f"✅ Found {len(courses)} courses")
        print(courses)
        
        # Save to resume data if resume_id is provided
        if resume_id and resume_id != 'temp-id':
            resume_data = load_resume_data(resume_id)
            if resume_data:
                resume_data['course_work'] = courses
                resume_data['updated_at'] = datetime.now().isoformat()
                save_resume_data(resume_id, resume_data)
                print(f"💾 Saved courses to resume {resume_id}")
        
        
        return JSONResponse(content=courses)
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error scraping courses: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error scraping courses: {str(e)}")

@app.post("/regenerate-sections")
async def regenerate_sections(resume_id: str):
    """Regenerate resume sections with updated data"""
    try:
        resume_data = load_resume_data(resume_id)
        if not resume_data:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        # For now, return existing sections
        # Full implementation would regenerate using LLM
        sections = resume_data.get('sections', {
            "header": resume_data.get('header', ''),
            "experience": resume_data.get('experience', ''),
            "projects": resume_data.get('projects', ''),
            "skills": resume_data.get('skills', ''),
            "education": resume_data.get('education', '')
        })
        
        return sections
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error regenerating sections: {str(e)}")

@app.post("/update-skills")
async def update_skills(resume_id: str, skills: dict):
    """Update categorized skills"""
    try:
        resume_data = load_resume_data(resume_id)
        if not resume_data:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        resume_data['skills_categorized'] = skills
        resume_data['updated_at'] = datetime.now().isoformat()
        save_resume_data(resume_id, resume_data)
        
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating skills: {str(e)}")

@app.post("/validate-skills")
async def validate_skills(resume_id: str, skills: list):
    """Validate that skills appear in resume body"""
    try:
        resume_data = load_resume_data(resume_id)
        if not resume_data:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        # Combine all resume text
        resume_text = ' '.join([
            str(resume_data.get('experience', '')),
            str(resume_data.get('projects', '')),
            str(resume_data.get('education', ''))
        ]).lower()
        
        # Check which skills don't appear in resume
        unmapped = [s for s in skills if s.lower() not in resume_text]
        
        return {"unmapped_skills": unmapped}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error validating skills: {str(e)}")

@app.post("/export-resume")
async def export_resume(resume_id: str, template: str, format: str):
    """Export resume in specified format"""
    try:
        resume_data = load_resume_data(resume_id)
        if not resume_data:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        # For now, return a placeholder message
        # Full implementation would use Puppeteer for PDF, Jinja2 for LaTeX
        return {
            "success": False,
            "message": "Export functionality not yet implemented. Please use the existing resume editor for now."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error exporting resume: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Mentor Resume Parser API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)