from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Resume
from .serializers import ResumeSerializer

from accounts.permissions import IsCandidate

from .resume_parser import extract_text_from_pdf
from .skill_extractor import extract_skills


class ResumeViewSet(viewsets.ModelViewSet):

    serializer_class = ResumeSerializer

    permission_classes = [
        IsAuthenticated,
        IsCandidate
    ]

    def get_queryset(self):
        """
        Return only resumes belonging
        to the logged-in candidate.
        """

        return Resume.objects.filter(
            candidate__user=self.request.user
        )

    def perform_create(self, serializer):

        candidate = self.request.user.candidate_profile

        resume = serializer.save(
            candidate=candidate
        )

        self.extract_and_save_skills(resume)

    def perform_update(self, serializer):

        """
        Replace the existing resume file
        and extract skills again.
        """

        resume = serializer.save()

        self.extract_and_save_skills(resume)

    def extract_and_save_skills(self, resume):

        """
        Extract text from the PDF and
        save the extracted skills.
        """

        text = extract_text_from_pdf(
            resume.resume_file.path
        )

        skills = extract_skills(text)

        resume.extracted_skills = ", ".join(skills)

        resume.save()