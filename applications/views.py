from rest_framework import viewsets, status
from django.db.models import Max

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from candidates.models import Candidate
from recruiters.models import Recruiter
from resumes.models import Resume

from .models import Application, SavedJob
from .serializers import ApplicationSerializer, SavedJobSerializer

from accounts.permissions import IsCandidate, IsRecruiter


# =========================================================
# Application ViewSet
# =========================================================

class ApplicationViewSet(viewsets.ModelViewSet):

    serializer_class = ApplicationSerializer

    permission_classes = [
        IsAuthenticated,
        IsCandidate
    ]

    def get_queryset(self):
        return Application.objects.filter(
            candidate__user=self.request.user
        )

    def create(self, request, *args, **kwargs):

        job_id = request.data.get("job")

        if not job_id:
            return Response(
                {
                    "error": "job is required"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        candidate = request.user.candidate_profile

        existing_application = Application.objects.filter(
            candidate=candidate,
            job_id=job_id
        ).first()

        if existing_application:
            return Response(
                {
                    "error": "You have already applied to this job.",
                    "application_id": existing_application.id,
                    "status": existing_application.status
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # -------------------------------------------------
        # Generate application number for this candidate
        # -------------------------------------------------

        last_application_number = Application.objects.filter(
            candidate=candidate
        ).aggregate(
            Max("application_number")
        )["application_number__max"]

        if last_application_number is None:
            next_application_number = 1
        else:
            next_application_number = last_application_number + 1

        # -------------------------------------------------
        # Create application
        # -------------------------------------------------

        application = Application.objects.create(
            candidate=candidate,
            job_id=job_id,
            application_number=next_application_number
        )

        serializer = ApplicationSerializer(application)

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )


# =========================================================
# Saved Job ViewSet
# =========================================================

class SavedJobViewSet(viewsets.ModelViewSet):

    serializer_class = SavedJobSerializer

    permission_classes = [
        IsAuthenticated,
        IsCandidate
    ]

    def get_queryset(self):
        return SavedJob.objects.filter(
            candidate__user=self.request.user
        )

    def create(self, request, *args, **kwargs):

        job_id = request.data.get("job")

        if not job_id:
            return Response(
                {
                    "error": "job is required"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        candidate = request.user.candidate_profile

        existing_saved_job = SavedJob.objects.filter(
            candidate=candidate,
            job_id=job_id
        ).first()

        if existing_saved_job:
            return Response(
                {
                    "error": "This job is already saved.",
                    "saved_job_id": existing_saved_job.id
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        saved_job = SavedJob.objects.create(
            candidate=candidate,
            job_id=job_id
        )

        serializer = SavedJobSerializer(saved_job)

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )


# =========================================================
# Candidate Applications
# =========================================================

class CandidateApplicationsView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsCandidate
    ]

    def get(self, request, candidate_id):

        try:

            candidate = Candidate.objects.get(
                id=candidate_id,
                user=request.user
            )

        except Candidate.DoesNotExist:

            return Response(
                {
                    "error": "You do not have permission to access this candidate."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        applications = Application.objects.filter(
            candidate=candidate
        ).order_by(
            "-applied_date"
        )

        serializer = ApplicationSerializer(
            applications,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )


# =========================================================
# Recruiter Applicants
# =========================================================

class RecruiterApplicantsView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsRecruiter
    ]

    def get(self, request, recruiter_id):

        # -------------------------------------------------
        # Check recruiter permission
        # -------------------------------------------------

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

        # -------------------------------------------------
        # Get applications for recruiter's jobs
        # -------------------------------------------------

        applications = Application.objects.filter(
            job__recruiter=recruiter
        ).select_related(
            "candidate",
            "job"
        ).order_by(
            "-applied_date"
        )

        data = []

        # -------------------------------------------------
        # Build applicant response
        # -------------------------------------------------

        for application in applications:

            candidate = application.candidate
            job = application.job

            # -------------------------------------------------
            # Get latest resume of candidate
            # -------------------------------------------------

            resume = Resume.objects.filter(
                candidate=candidate
            ).order_by(
                "-id"
            ).first()

            # -------------------------------------------------
            # Resume information
            # -------------------------------------------------

            resume_data = None

            if resume:

                resume_data = {
                    "id": resume.id,
                    "file": (
                        resume.resume_file.url
                        if resume.resume_file
                        else None
                    )
                }

            # -------------------------------------------------
            # Applicant data
            # -------------------------------------------------

            data.append(
                {
                    "application_id": application.id,

                    "candidate": {
                        "id": candidate.id,
                        "name": candidate.name,
                        "email": candidate.email,
                        "phone": candidate.phone,
                        "skills": candidate.skills,
                        "education": candidate.education,
                        "experience": candidate.experience,
                        "location": candidate.location,

                        # Resume
                        "resume": resume_data
                    },

                    "job": {
                        "id": job.id,
                        "title": job.title,
                        "location": job.location,
                        "job_type": job.job_type,
                        "salary": job.salary
                    },

                    "status": application.status,

                    "applied_date": application.applied_date
                }
            )

        return Response(
            data,
            status=status.HTTP_200_OK
        )


# =========================================================
# Application Status Update
# =========================================================

class ApplicationStatusUpdateView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsRecruiter
    ]

    def patch(self, request, application_id):

        # -------------------------------------------------
        # Check application belongs to recruiter's job
        # -------------------------------------------------

        try:

            application = Application.objects.select_related(
                "job__recruiter"
            ).get(
                id=application_id,
                job__recruiter__user=request.user
            )

        except Application.DoesNotExist:

            return Response(
                {
                    "error": "You do not have permission to update this application."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # -------------------------------------------------
        # Get new status
        # -------------------------------------------------

        new_status = request.data.get("status")

        allowed_statuses = [
            "Applied",
            "Shortlisted",
            "Rejected",
            "Selected"
        ]

        # -------------------------------------------------
        # Validate status
        # -------------------------------------------------

        if not new_status:

            return Response(
                {
                    "error": "status is required"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if new_status not in allowed_statuses:

            return Response(
                {
                    "error": "Invalid status",
                    "allowed_statuses": allowed_statuses
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # -------------------------------------------------
        # Update application status
        # -------------------------------------------------

        application.status = new_status

        application.save()

        serializer = ApplicationSerializer(
            application
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )