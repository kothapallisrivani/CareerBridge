from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    RecruiterViewSet,
    RecruiterDashboardView,
    RecruiterJobsView
)


router = DefaultRouter()

router.register(
    r'recruiters',
    RecruiterViewSet,
    basename='recruiter'
)


urlpatterns = router.urls + [
    path(
        'recruiter-dashboard/<int:recruiter_id>/',
        RecruiterDashboardView.as_view(),
        name='recruiter-dashboard'
    ),

    path(
        'recruiter-jobs/<int:recruiter_id>/',
        RecruiterJobsView.as_view(),
        name='recruiter-jobs'
    ),
]