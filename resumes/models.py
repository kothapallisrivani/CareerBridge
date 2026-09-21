from django.db import models
from candidates.models import Candidate


class Resume(models.Model):
    candidate = models.ForeignKey(
        Candidate,
        on_delete=models.CASCADE,
        related_name='resumes'
    )
    resume_file = models.FileField(upload_to='resumes/')
    extracted_skills = models.TextField(blank=True)
    uploaded_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.candidate.name} - Resume"