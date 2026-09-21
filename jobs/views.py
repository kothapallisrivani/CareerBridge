from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from .models import Job
from .serializers import JobSerializer


class JobViewSet(viewsets.ModelViewSet):
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Recruiter sees only their own jobs
        if hasattr(user, "recruiter_profile"):
            return Job.objects.filter(
                recruiter=user.recruiter_profile
            )

        # Other users can see all jobs
        return Job.objects.all()

    def perform_create(self, serializer):
        recruiter = self.request.user.recruiter_profile

        serializer.save(
            recruiter=recruiter
        )

    def perform_update(self, serializer):
        recruiter = self.request.user.recruiter_profile

        job = self.get_object()

        if job.recruiter != recruiter:
            raise PermissionDenied(
                "You can only edit your own jobs."
            )

        serializer.save()

    def perform_destroy(self, instance):
        recruiter = self.request.user.recruiter_profile

        if instance.recruiter != recruiter:
            raise PermissionDenied(
                "You can only delete your own jobs."
            )

        instance.delete()