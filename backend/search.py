from course_scraper import scrapeCourseRequirements

result = scrapeCourseRequirements("MIT", "Computer Science")
if result:
    for course in result:
        print(course['course_number'], course['course_title'])
        print("--------------------------------")