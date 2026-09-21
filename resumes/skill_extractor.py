SKILLS = [
    "python",
    "django",
    "flask",
    "fastapi",
    "sql",
    "mysql",
    "postgresql",
    "html",
    "css",
    "javascript",
    "react",
    "git",
    "github",
    "java",
    "c++",
    "tensorflow",
    "pytorch",
    "opencv",
    "numpy",
    "pandas",
]


def extract_skills(resume_text):
    resume_text = resume_text.lower()

    found_skills = []

    for skill in SKILLS:
        if skill in resume_text:
            found_skills.append(skill)

    return sorted(found_skills)