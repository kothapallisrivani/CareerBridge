from rest_framework import serializers
from .models import JobMatch


class JobMatchSerializer(serializers.ModelSerializer):
    job_details = serializers.SerializerMethodField()
    recommendation = serializers.SerializerMethodField()

    class Meta:
        model = JobMatch
        fields = [
            "id",
            "match_score",
            "matched_skills",
            "missing_skills",
            "created_at",
            "candidate",
            "job",
            "job_details",
            "recommendation",
        ]

    def get_job_details(self, obj):
        return {
            "id": obj.job.id,
            "title": obj.job.title,
            "description": obj.job.description,
            "location": obj.job.location,
            "job_type": obj.job.job_type,
            "salary": obj.job.salary,
            "required_skills": obj.job.required_skills,
            "experience": obj.job.experience,
            "posted_date": obj.job.posted_date,
        }

    def get_recommendation(self, obj):
        if obj.missing_skills:
            return (
                f"Improve your skills in {obj.missing_skills} "
                "to increase your job match score."
            )

        return "You have all the required skills for this job."