import os
import logging
import time
import requests
import json
from bs4 import BeautifulSoup
from provider import get_llm_provider
from typing import Optional
from serpapi import GoogleSearch
from cache import get_cache, set_cache
from extract import parseLLMResponse

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

client = get_llm_provider(provider="openai")

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}


def searchCourseCatalogs(school: str, major: str) -> list[str]:

    query = f"{school} {major} degree requirements course catalog"

    try:
        search = GoogleSearch({
            "engine": "google",
            "q": query,
            "api_key": os.getenv('SERPAPI_API_KEY'),
            "num": 3
        })

        results = search.get_dict()
        organic_results = results['organic_results']

        # Extract URLs from organic search results
        urls = []
        for result in organic_results[:3]:
            url = result['link']
            if url:
                urls.append(url)

        logger.info(f"Found {len(urls)} catalog URLs for {school} {major}")
        return urls

    except Exception as e:
        logger.error(f"Error searching with SerpAPI: {e}")
        return []


def fetchPageContent(url: str) -> Optional[str]:

    try:
        response = requests.get(url, headers=HEADERS, timeout=15)
        response.raise_for_status()
        return response.text
    except Exception as e:
        logger.error(f"Error fetching {url}: {e}")
        return None


def extractCourses(html_content: str, school: str, major: str) -> dict:

    soup = BeautifulSoup(html_content, 'html.parser')

    for script in soup(['script', 'style', 'nav', 'footer', 'header']):
        script.decompose()

    text_content = soup.get_text(separator='\n', strip=True)[:15000]

    prompt_course_scraper = f"""
        You are an information extraction system. You will receive the HTML of a university course catalog for a specific major. Your task is to extract all course titles and course numbers belonging to that major.

        Instructions:
        1. Parse the HTML carefully and find all courses listed under the major's section.
        2. For each course, extract:
        - Course Number (e.g., "MATH 340" or "CS 100")
        - Course Title (e.g., "Numerical Methods" or "Introduction to Programming")
        3. Return the output as a **JSON array** of objects with the following schema:
        ```json
        [
            {{
            "course_number": "DEPT 101",
            "course_title": "Course Title"
            }},
            ...
        ]
        ```

        4. Ignore course descriptions, prerequisites, credit hours, or general education notes — only capture number and title.
        5. If there are cross-listed courses, list each course number separately with the same title.
        6. Do not hallucinate or infer missing titles; only extract what is explicitly present in the HTML.

        Example (Input → Output)

        Input HTML (truncated):
        ```html
        <h2 id="math">Mathematics (MATH)</h2>
        <div class="course">
        <span class="course-number">MATH 340</span>
        <span class="course-title">Numerical Methods</span>
        <p class="course-description">Introduction to numerical techniques for solving equations...</p>
        </div>
        <div class="course">
        <span class="course-number">MATH 461</span>
        <span class="course-title">Probability</span>
        </div>
        ```

        Output:

        ```json
        [
        {{
            "course_number": "MATH 340",
            "course_title": "Numerical Methods"
        }},
        {{
            "course_number": "MATH 461",
            "course_title": "Probability"
        }}
        ]
        ```
        T

        The output should only contain the JSON array of objects. Do not include any other text or comments. Do not include any steps or explanations.

        Input:

        The following is the HTML content of the course catalog for the major {major}:

        ```
        {text_content}
        ```

        Output:
        """
    try:
        message = client.generate(prompt_course_scraper)

        courses_data = parseLLMResponse(message)

        logger.info(f"Extracted {len(courses_data)} courses")
        return courses_data, True

    except Exception as e:
        logger.error(f"Error extracting courses with AI: {e}")
        return [], False


def scrapeCourseRequirements(school: str, major: str) -> dict:

    # Create cache key
    cache_key = f"{school.lower().replace(' ', '_')}_{major.lower().replace(' ', '_')}"
    print("--------------------------------")
    logger.info(f"Cache key: {cache_key}")
    print("--------------------------------")
    
    # Check cache first
    cached_data = get_cache(cache_key)
    if cached_data:
        logger.info(f"Using cached data for {school} {major}")
        print("--------------------------------")
        return cached_data

    logger.info(f"Scraping course requirements for {school} {major}")
    print("--------------------------------")

    # Search for catalog URLs
    urls = searchCourseCatalogs(school, major)

    if not urls:
        logger.warning("No catalog URLs found")
        print("--------------------------------")
        return [], False

    # Try each URL until we get course data
    all_courses = []
    for url in urls:
        logger.info(f"Fetching content from {url}")
        print("--------------------------------")
        html_content = fetchPageContent(url)
        if not html_content:
            continue

        result = extractCourses(html_content, school, major)
        courses = result[0]

        if result[1]:
            all_courses.extend(courses)
            break

    unique_courses = []
    seen_codes = set()
    for course in all_courses:
        code = course['course_number']
        if code not in seen_codes:
            unique_courses.append(course)
            seen_codes.add(code)

    final_result = unique_courses

    # Cache the results
    if unique_courses:
        set_cache(cache_key, final_result)

    logger.info(f"Scraped {len(unique_courses)} unique courses for {school} {major}")
    print("--------------------------------")
    return final_result
