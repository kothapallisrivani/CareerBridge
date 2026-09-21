from rest_framework import serializers

from .models import Application, SavedJob


class ApplicationSerializer(serializers.ModelSerializer):

    job_details = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = [
            'id',
            'application_number',
            'candidate',
            'job',
            'job_details',
            'status',
            'applied_date'
        ]

        validators = [
            serializers.UniqueTogetherValidator(
                queryset=Application.objects.all(),
                fields=['candidate', 'job'],
                message='You have already applied to this job.'
            )
        ]

    def get_job_details(self, obj):

        job = obj.job

        return {
            'id': job.id,
            'title': job.title,
            'description': job.description,
            'location': job.location,
            'job_type': job.job_type,
            'salary': job.salary,
            'required_skills': job.required_skills,
            'experience': job.experience,
            'posted_date': job.posted_date
        }


class SavedJobSerializer(serializers.ModelSerializer):

    job_details = serializers.SerializerMethodField()

    class Meta:
        model = SavedJob
        fields = [
            'id',
            'candidate',
            'job',
            'job_details',
            'saved_date'
        ]

    def get_job_details(self, obj):

        job = obj.job

        return {
            'id': job.id,
            'title': job.title,
            'description': job.description,
            'location': job.location,
            'job_type': job.job_type,
            'salary': job.salary,
            'required_skills': job.required_skills,
            'experience': job.experience,
            'posted_date': job.posted_date
        }