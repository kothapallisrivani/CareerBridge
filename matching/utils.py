def normalize_skill(skill):
    """
    Normalize skill names so different spellings
    are treated as the same skill.
    """

    skill = skill.strip().lower()

    skill_aliases = {
        "js": "javascript",
        "javascript": "javascript",

        "py": "python",
        "python": "python",

        "django": "django",

        "react.js": "react",
        "reactjs": "react",
        "react": "react",

        "html5": "html",
        "html": "html",

        "css3": "css",
        "css": "css",

        "sql": "sql",

        "git": "git",
    }

    return skill_aliases.get(skill, skill)


def calculate_job_match(candidate_skills, required_skills):
    """
    Compare candidate skills with job required skills
    and calculate a match percentage.
    """

    # Convert candidate skills into normalized set
    candidate_skill_set = {
        normalize_skill(skill)
        for skill in candidate_skills.split(",")
        if skill.strip()
    }

    # Convert required skills into normalized set
    required_skill_set = {
        normalize_skill(skill)
        for skill in required_skills.split(",")
        if skill.strip()
    }

    # If no required skills are provided
    if not required_skill_set:
        return {
            "match_score": 0,
            "matched_skills": [],
            "missing_skills": []
        }

    # Find matching skills
    matched_skills = candidate_skill_set.intersection(
        required_skill_set
    )

    # Find missing skills
    missing_skills = required_skill_set.difference(
        candidate_skill_set
    )

    # Calculate match percentage
    match_score = (
        len(matched_skills) / len(required_skill_set)
    ) * 100

    return {
        "match_score": round(match_score, 2),
        "matched_skills": sorted(matched_skills),
        "missing_skills": sorted(missing_skills)
    }