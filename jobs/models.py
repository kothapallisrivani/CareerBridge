from django.db import models

from recruiters.models import Recruiter


class Job(models.Model):

    JOB_TYPE_CHOICES = [
        ('Full Time', 'Full Time'),
        ('Part Time', 'Part Time'),
        ('Internship', 'Internship'),
        ('Contract', 'Contract'),
    ]

    SHIFT_CHOICES = [
        ('Day Shift', 'Day Shift'),
        ('Night Shift', 'Night Shift'),
        ('Rotational Shift', 'Rotational Shift'),
        ('Flexible Shift', 'Flexible Shift'),
    ]

    WORK_MODE_CHOICES = [
        ('Work From Office', 'Work From Office'),
        ('Hybrid', 'Hybrid'),
        ('Remote', 'Remote'),
    ]

    title = models.CharField(max_length=200)

    description = models.TextField()

    what_youll_be_doing = models.TextField(
        blank=True
    )

    what_were_looking_for = models.TextField(
        blank=True
    )

    education = models.TextField(
        blank=True
    )

    key_skills = models.TextField(
        blank=True
    )

    recruiter = models.ForeignKey(
        Recruiter,
        on_delete=models.CASCADE,
        related_name='jobs'
    )

    location = models.CharField(max_length=100)

    job_type = models.CharField(
        max_length=20,
        choices=JOB_TYPE_CHOICES
    )

    salary = models.CharField(
        max_length=100,
        blank=True
    )

    # Kept for compatibility with the existing
    # CareerBridge matching system
    required_skills = models.TextField(
        blank=True
    )

    experience = models.IntegerField(
        default=0
    )

    shift = models.CharField(
        max_length=30,
        choices=SHIFT_CHOICES,
        default='Day Shift'
    )

    shift_timing = models.CharField(
        max_length=100,
        blank=True
    )

    cab_available = models.BooleanField(
        default=False
    )

    work_mode = models.CharField(
        max_length=30,
        choices=WORK_MODE_CHOICES,
        default='Work From Office'
    )

    vacancies = models.IntegerField(
        default=1
    )

    posted_date = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.title