from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    ApplicationViewSet,
    SavedJobViewSet,
    CandidateApplicationsView,
    RecruiterApplicantsView,
    ApplicationStatusUpdateView
)


router = DefaultRouter()

router.register(
    r'applications',
    ApplicationViewSet,
    basename='application'
)

router.register(
    r'saved-jobs',
    SavedJobViewSet,
    basename='saved-job'
)


urlpatterns = router.urls + [
    path(
        'my-applications/<int:candidate_id>/',
        CandidateApplicationsView.as_view(),
        name='my-applications'
    ),

    path(
        'recruiter-applicants/<int:recruiter_id>/',
        RecruiterApplicantsView.as_view(),
        name='recruiter-applicants'
    ),

    path(
        'application-status/<int:application_id>/',
        ApplicationStatusUpdateView.as_view(),
        name='application-status'
    ),
]