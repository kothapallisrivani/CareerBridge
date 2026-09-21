from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from candidates.models import Candidate
from jobs.models import Job
from accounts.permissions import IsCandidate
from .models import JobMatch
from .serializers import JobMatchSerializer
from .utils import calculate_job_match
from .recommendations import get_skill_recommendations


class JobMatchView(APIView):
    permission_classes = [IsAuthenticated, IsCandidate]

    def get(self, request):
        try:
            candidate = request.user.candidate_profile
        except Candidate.DoesNotExist:
            return Response(
                {"error": "Candidate profile not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get latest uploaded resume
        resume = candidate.resumes.order_by("-uploaded_date").first()

        # Resume is required for matching
        if not resume:
            return Response(
                {
                    "resume_uploaded": False,
                    "message": "Please upload your resume to see matched and missing skills."
                },
                status=status.HTTP_200_OK
            )

        # Extracted skills are required
        if not resume.extracted_skills:
            return Response(
                {
                    "resume_uploaded": True,
                    "skills_extracted": False,
                    "message": "Resume uploaded, but skills could not be extracted yet."
                },
                status=status.HTTP_200_OK
            )

        # Skills come ONLY from the uploaded resume
        candidate_skills = resume.extracted_skills

        jobs = Job.objects.all()

        for job in jobs:

            # Use recruiter-provided Key Skills
            if not job.key_skills:
                continue

            match_result = calculate_job_match(
                candidate_skills,
                job.key_skills
            )

            score = match_result["match_score"]
            matched_skills = match_result["matched_skills"]
            missing_skills = match_result["missing_skills"]

            JobMatch.objects.update_or_create(
                candidate=candidate,
                job=job,
                defaults={
                    "match_score": score,
                    "matched_skills": ", ".join(matched_skills),
                    "missing_skills": ", ".join(missing_skills),
                }
            )

        job_matches = (
            JobMatch.objects
            .filter(candidate=candidate)
            .select_related("candidate", "job")
            .order_by("-match_score")
        )

        serializer = JobMatchSerializer(
            job_matches,
            many=True
        )

        response_data = serializer.data

        for match_data, match_object in zip(
            response_data,
            job_matches
        ):
            match_data["recommendations"] = get_skill_recommendations(
                match_object.missing_skills
            )

        return Response(
            {
                "resume_uploaded": True,
                "skills_extracted": True,
                "resume_skills": candidate_skills,
                "matches": response_data
            },
            status=status.HTTP_200_OK
        )

    def post(self, request):
        job_id = request.data.get("job")

        if not job_id:
            return Response(
                {"error": "job is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            candidate = request.user.candidate_profile
        except Candidate.DoesNotExist:
            return Response(
                {"error": "Candidate profile not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Resume is required
        resume = candidate.resumes.order_by("-uploaded_date").first()

        if not resume:
            return Response(
                {
                    "resume_uploaded": False,
                    "message": "Please upload your resume before checking the job match."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Extracted skills are required
        if not resume.extracted_skills:
            return Response(
                {
                    "resume_uploaded": True,
                    "skills_extracted": False,
                    "message": "Resume uploaded, but skills could not be extracted yet."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            job = Job.objects.get(id=job_id)
        except Job.DoesNotExist:
            return Response(
                {"error": "Job not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Use Key Skills
        if not job.key_skills:
            return Response(
                {"error": "No key skills found for this job."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Skills ONLY from uploaded resume
        candidate_skills = resume.extracted_skills

        match_result = calculate_job_match(
            candidate_skills,
            job.key_skills
        )

        score = match_result["match_score"]
        matched_skills = match_result["matched_skills"]
        missing_skills = match_result["missing_skills"]

        job_match, created = JobMatch.objects.update_or_create(
            candidate=candidate,
            job=job,
            defaults={
                "match_score": score,
                "matched_skills": ", ".join(matched_skills),
                "missing_skills": ", ".join(missing_skills),
            }
        )

        recommendations = get_skill_recommendations(
            job_match.missing_skills
        )

        serializer = JobMatchSerializer(job_match)

        response_data = serializer.data
        response_data["recommendations"] = recommendations
        response_data["resume_skills"] = candidate_skills

        response_status = (
            status.HTTP_201_CREATED
            if created
            else status.HTTP_200_OK
        )

        return Response(
            response_data,
            status=response_status
        )