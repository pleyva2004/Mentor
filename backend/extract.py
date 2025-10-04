import json

test = """
```json
[
  {
    "course_number": "6.0001",
    "course_title": "Introduction to Computer Science Programming in Python"
  },
  {
    "course_number": "6.0002",
    "course_title": "Introduction to Computational Thinking and Data Science"
  },
  {
    "course_number": "6.004",
    "course_title": "Computation Structures"
  },
  {
    "course_number": "6.006",
    "course_title": "Introduction to Algorithms"
  },
  {
    "course_number": "6.008",
    "course_title": "Introduction to Inference"
  },
  {
    "course_number": "6.009",
    "course_title": "Fundamentals of Programming"
  },
  {
    "course_number": "6.031",
    "course_title": "Elements of Software Construction"
  },
  {
    "course_number": "6.033",
    "course_title": "Computer System Engineering"
  },
  {
    "course_number": "6.034",
    "course_title": "Artificial Intelligence"
  },
  {
    "course_number": "6.036",
    "course_title": "Introduction to Machine Learning"
  },
  {
    "course_number": "6.042",
    "course_title": "Mathematics for Computer Science"
  },
  {
    "course_number": "6.045",
    "course_title": "Automata, Computability, and Complexity"
  },
  {
    "course_number": "6.046",
    "course_title": "Design and Analysis of Algorithms"
  },
  {
    "course_number": "6.047",
    "course_title": "Computational Biology: Genomes, Networks, Evolution"
  },
  {
    "course_number": "6.060",
    "course_title": "Quantum Computing"
  },
  {
    "course_number": "6.637",
    "course_title": "Machine Learning for Signal Processing"
  }
]
```
"""

def parseLLMResponse(response: str) -> list[dict]:
    response = response.replace("```", "").replace("json", "")
    return json.loads(response)

parsed = parseLLMResponse(test)
for course in parsed:
  number = course['course_number']
  title = course['course_title']
  number = number.replace(" ", "")
  title = title.replace(" ", "")
  print(number, title)
  print("--------------------------------")