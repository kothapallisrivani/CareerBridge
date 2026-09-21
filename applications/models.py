from django.db import models

from candidates.models import Candidate
from jobs.models import Job


class Application(models.Model):
    STATUS_CHOICES = [
        ('Applied', 'Applied'),
        ('Shortlisted', 'Shortlisted'),
        ('Rejected', 'Rejected'),
        ('Selected', 'Selected'),
    ]

    candidate = models.ForeignKey(
        Candidate,
        on_delete=models.CASCADE,
        related_name='applications'
    )

    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name='applications'
    )

    # Display application number
    application_number = models.PositiveIntegerField(
        null=True,
        blank=True
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='Applied'
    )

    applied_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['candidate', 'job'],
                name='unique_candidate_job_application'
            ),
            models.UniqueConstraint(
                fields=['candidate', 'application_number'],
                name='unique_candidate_application_number'
            )
        ]

    def __str__(self):
        return (
            f"Application #{self.application_number} - "
            f"{self.candidate.name} - {self.job.title}"
        )


class SavedJob(models.Model):
    candidate = models.ForeignKey(
        Candidate,
        on_delete=models.CASCADE,
        related_name='saved_jobs'
    )

    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name='saved_by_candidates'
    )

    saved_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['candidate', 'job'],
                name='unique_candidate_saved_job'
            )
        ]

    def __str__(self):
        return f"{self.candidate.name} - {self.job.title}"