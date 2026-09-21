from django.db import models

# Create your models here.
from candidates.models import Candidate
from jobs.models import Job


class JobMatch(models.Model):
    candidate = models.ForeignKey(
        Candidate,
        on_delete=models.CASCADE,
        related_name='job_matches'
    )

    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name='candidate_matches'
    )

    match_score = models.FloatField(default=0)

    matched_skills = models.TextField(blank=True)

    missing_skills = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.candidate.name} - {self.job.title} - {self.match_score}%"