from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    CandidateViewSet,
    CandidateDashboardView,
    CandidateProfileUpdateView,
)


router = DefaultRouter()

router.register(
    r"candidates",
    CandidateViewSet,
    basename="candidate",
)


urlpatterns = [

    # Candidate Dashboard
    path(
        "candidates/dashboard/",
        CandidateDashboardView.as_view(),
        name="candidate-dashboard",
    ),

    # Candidate Profile Update
    path(
        "candidates/profile/",
        CandidateProfileUpdateView.as_view(),
        name="candidate-profile-update",
    ),

] + router.urls