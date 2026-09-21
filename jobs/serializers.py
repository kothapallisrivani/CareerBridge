from rest_framework import serializers
from .models import Job


class JobSerializer(serializers.ModelSerializer):
    recruiter_name = serializers.CharField(
        source="recruiter.name",
        read_only=True
    )

    class Meta:
        model = Job
        fields = [
            "id",
            "title",
            "description",
            "what_youll_be_doing",
            "what_were_looking_for",
            "education",
            "key_skills",
            "recruiter",
            "recruiter_name",
            "location",
            "job_type",
            "salary",
            "required_skills",
            "experience",
            "shift",
            "shift_timing",
            "cab_available",
            "work_mode",
            "vacancies",
            "posted_date",
        ]
        read_only_fields = [
            "recruiter",
            "recruiter_name",
            "posted_date",
        ]