def get_skill_recommendations(missing_skills):
    """
    Generate learning recommendations
    for the skills missing from the candidate.
    """

    if not missing_skills:
        return []

    skills = [
        skill.strip().lower()
        for skill in missing_skills.split(",")
        if skill.strip()
    ]

    recommendations = []

    skill_learning_map = {
        "python": "Learn Python fundamentals, OOP, functions, and build practical projects.",
        "django": "Learn Django fundamentals, models, views, URLs, REST APIs, and build a CRUD web application.",
        "react": "Learn React components, props, state, hooks, and build interactive web applications.",
        "sql": "Learn SQL queries, joins, subqueries, constraints, and database design.",
        "mysql": "Practice MySQL databases, tables, relationships, joins, and SQL queries.",
        "git": "Learn Git commands, branching, merging, commits, and GitHub workflows.",
        "html": "Learn HTML structure, forms, semantic elements, and build responsive web pages.",
        "css": "Learn CSS layouts, Flexbox, Grid, responsive design, and styling.",
        "javascript": "Learn JavaScript fundamentals, DOM manipulation, ES6, and asynchronous programming.",
        "flask": "Learn Flask routing, templates, forms, REST APIs, and database integration.",
        "java": "Learn Java fundamentals, OOP, collections, exception handling, and build small applications.",
        "c": "Learn C programming fundamentals, functions, arrays, pointers, and data structures.",
        "c++": "Learn C++ OOP, STL, classes, inheritance, and problem solving.",
        "bootstrap": "Learn Bootstrap components, grid system, responsive layouts, and UI design.",
        "rest api": "Learn REST API concepts, HTTP methods, authentication, serializers, and API testing.",
        "docker": "Learn Docker images, containers, Dockerfiles, and containerized application deployment.",
        "aws": "Learn AWS fundamentals, EC2, S3, IAM, and basic cloud deployment.",
    }

    for skill in skills:

        recommendation = skill_learning_map.get(
            skill,
            f"Learn the fundamentals of {skill} and practice by building a small project."
        )

        recommendations.append({
            "skill": skill,
            "recommendation": recommendation
        })

    return recommendations