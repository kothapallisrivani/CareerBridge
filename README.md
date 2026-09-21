# CareerBridge – AI-Powered Career & Job Management Platform

CareerBridge is a full-stack career and job management platform designed to connect candidates, recruiters, and administrators through a centralized web application.

The platform provides job discovery, job applications, saved jobs, resume management, skill-based job matching, recruiter job management, applicant management, and administrative management.

---

## 🚀 Features

### 👤 Candidate Features

- Candidate registration and login
- Candidate profile management
- Browse available jobs
- View detailed job information
- Search and explore job opportunities
- Apply for jobs
- View applied jobs
- Save jobs for later
- View saved jobs
- Upload resumes
- Resume management
- Resume skill extraction
- Job skill matching
- Matched skills and missing skills display
- Job match percentage
- Candidate dashboard
- Application tracking

---

### 🏢 Recruiter Features

- Recruiter registration and login
- Recruiter profile management
- Create job postings
- Edit own job postings
- Delete own job postings
- View posted jobs
- Manage job details
- View applicants
- View candidate information
- View candidate resumes
- Update application status
- Manage recruitment activities through the recruiter dashboard

---

### 🛠️ Admin Features

- Admin authentication
- Admin dashboard
- Candidate management
- Recruiter management
- Job management
- Application management
- View application status
- Update application status
- User management
- Enable/disable user accounts
- Delete users
- Dashboard statistics

---

## 🎯 Job Matching System

CareerBridge includes a skill-based job matching system.

The system compares:

- Candidate skills
- Job required skills

It identifies:

- ✅ Matched skills
- ❌ Missing skills
- 📊 Job match percentage

The matching system also normalizes common skill variations such as:

- `JS` → `JavaScript`
- `Py` → `Python`
- `React.js` → `React`
- `ReactJS` → `React`
- `HTML5` → `HTML`
- `CSS3` → `CSS`

This helps provide more consistent skill matching between candidates and job requirements.

---

## 🛠️ Technologies Used

### Backend

- Python
- Django
- Django REST Framework
- Django REST Framework Token Authentication
- SQLite

### Frontend

- React
- JavaScript
- HTML
- CSS
- Vite

### Database

- SQLite

### Other Tools

- Git
- GitHub
- VS Code
- Postman

---

## 📂 Project Structure

```text
CareerBridge/
│
├── accounts/
│   ├── admin.py
│   ├── models.py
│   ├── permissions.py
│   ├── serializers.py
│   ├── urls.py
│   └── views.py
│
├── applications/
│   ├── migrations/
│   ├── models.py
│   ├── serializers.py
│   ├── urls.py
│   └── views.py
│
├── candidates/
│   ├── migrations/
│   ├── models.py
│   ├── serializers.py
│   ├── urls.py
│   └── views.py
│
├── config/
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── jobs/
│   ├── migrations/
│   ├── models.py
│   ├── serializers.py
│   ├── urls.py
│   └── views.py
│
├── matching/
│   ├── migrations/
│   ├── models.py
│   ├── recommendations.py
│   ├── serializers.py
│   ├── urls.py
│   ├── utils.py
│   └── views.py
│
├── recruiters/
│   ├── migrations/
│   ├── models.py
│   ├── serializers.py
│   ├── urls.py
│   └── views.py
│
├── resumes/
│   ├── migrations/
│   ├── models.py
│   ├── resume_parser.py
│   ├── serializers.py
│   ├── skill_extractor.py
│   ├── urls.py
│   └── views.py
│
├── manage.py
├── .gitignore
└── README.md