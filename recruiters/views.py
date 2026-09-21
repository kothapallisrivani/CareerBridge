from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Recruiter
from .serializers import RecruiterSerializer

from applications.models import Application
from jobs.models import Job
from jobs.serializers import JobSerializer

from accounts.permissions import IsRecruiter


class RecruiterViewSet(viewsets.ModelViewSet):

    serializer_class = RecruiterSerializer

    permission_classes = [
        IsAuthenticated,
        IsRecruiter
    ]

    def get_queryset(self):
        return Recruiter.objects.filter(
            user=self.request.user
        )


class RecruiterDashboardView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsRecruiter
    ]

    def get(self, request, recruiter_id):

        try:
            recruiter = Recruiter.objects.get(
                id=recruiter_id,
                user=request.user
            )

        except Recruiter.DoesNotExist:
            return Response(
                {
                    "error": "You do not have permission to access this recruiter."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        jobs = Job.objects.filter(
            recruiter=recruiter
        )

        applications = Application.objects.filter(
            job__recruiter=recruiter
        )

        total_jobs = jobs.count()
        total_applicants = applications.count()

        applied_count = applications.filter(
            status='Applied'
        ).count()

        shortlisted_count = applications.filter(
            status='Shortlisted'
        ).count()

        rejected_count = applications.filter(
            status='Rejected'
        ).count()

        selected_count = applications.filter(
            status='Selected'
        ).count()

        return Response(
            {
                "recruiter": {
                    "id": recruiter.id,
                    "name": recruiter.name,
                    "email": recruiter.email,
                    "company": recruiter.company,
                    "position": recruiter.position,
                    "website": recruiter.website,
                    "location": recruiter.location
                },

                "statistics": {
                    "total_jobs": total_jobs,
                    "total_applicants": total_applicants,
                    "applied": applied_count,
                    "shortlisted": shortlisted_count,
                    "rejected": rejected_count,
                    "selected": selected_count
                }
            },
            status=status.HTTP_200_OK
        )


class RecruiterJobsView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsRecruiter
    ]

    def get(self, request, recruiter_id):

        try:
            recruiter = Recruiter.objects.get(
                id=recruiter_id,
                user=request.user
            )

        except Recruiter.DoesNotExist:
            return Response(
                {
                    "error": "You do not have permission to access this recruiter."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        jobs = Job.objects.filter(
            recruiter=recruiter
        ).order_by(
            '-posted_date'
        )

        serializer = JobSerializer(
            jobs,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )