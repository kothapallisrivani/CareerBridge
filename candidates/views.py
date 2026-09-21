from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Candidate
from .serializers import CandidateSerializer

from accounts.permissions import IsCandidate

from resumes.serializers import ResumeSerializer
from applications.serializers import ApplicationSerializer
from matching.serializers import JobMatchSerializer


class CandidateViewSet(viewsets.ModelViewSet):
    serializer_class = CandidateSerializer
    permission_classes = [IsAuthenticated, IsCandidate]

    def get_queryset(self):
        return Candidate.objects.filter(
            user=self.request.user
        )


class CandidateDashboardView(APIView):
    permission_classes = [
        IsAuthenticated,
        IsCandidate
    ]

    def get(self, request):

        try:
            candidate = Candidate.objects.get(
                user=request.user
            )

        except Candidate.DoesNotExist:
            return Response(
                {
                    "error": "Candidate profile not found."
                },
                status=404
            )

        # ---------------------------------
        # Get candidate data
        # ---------------------------------

        resumes = candidate.resumes.all()

        applications = candidate.applications.all()

        job_matches = candidate.job_matches.all()

        # ---------------------------------
        # Total Applications
        # ---------------------------------

        total_applications = applications.count()

        # ---------------------------------
        # Average Match
        # ---------------------------------
        # Only JobMatches belonging to jobs
        # that the candidate has actually
        # applied for are considered.
        #
        # Unapplied jobs are NOT included.
        # ---------------------------------

        applied_job_ids = applications.values_list(
            "job_id",
            flat=True
        )

        applied_job_matches = job_matches.filter(
            job_id__in=applied_job_ids
        )

        total_job_matches = applied_job_matches.count()

        average_match_score = 0

        if total_job_matches > 0:

            total_score = sum(
                match.match_score
                for match in applied_job_matches
            )

            average_match_score = round(
                total_score / total_job_matches,
                2
            )

        # ---------------------------------
        # Return Dashboard Data
        # ---------------------------------

        return Response(
            {
                "profile": CandidateSerializer(
                    candidate
                ).data,

                "resumes": ResumeSerializer(
                    resumes,
                    many=True
                ).data,

                "applications": ApplicationSerializer(
                    applications,
                    many=True
                ).data,

                "job_matches": JobMatchSerializer(
                    job_matches,
                    many=True
                ).data,

                "statistics": {

                    "total_applications":
                        total_applications,

                    "total_job_matches":
                        total_job_matches,

                    "average_match_score":
                        average_match_score
                }
            },
            status=200
        )


class CandidateProfileUpdateView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsCandidate
    ]

    def put(self, request):

        try:
            candidate = Candidate.objects.get(
                user=request.user
            )

        except Candidate.DoesNotExist:
            return Response(
                {
                    "error":
                    "Candidate profile not found."
                },
                status=404
            )

        serializer = CandidateSerializer(
            candidate,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                serializer.data,
                status=200
            )

        return Response(
            serializer.errors,
            status=400
        )