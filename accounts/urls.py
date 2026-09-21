from django.urls import path

from .views import (
    RegisterView,
    LoginView,
    ForgotPasswordView,
    ResetPasswordView,
    AdminDashboardView,
    AdminCandidatesView,
    AdminRecruitersView,
    AdminJobsView,
    AdminApplicationsView,
    AdminApplicationStatusUpdateView,
    AdminUsersView,
    AdminUserStatusUpdateView,
    AdminUserDeleteView
)


urlpatterns = [

    path(
        'register/',
        RegisterView.as_view(),
        name='register'
    ),

    path(
        'login/',
        LoginView.as_view(),
        name='login'
    ),

    path(
    'forgot-password/',
    ForgotPasswordView.as_view(),
    name='forgot-password'
    ),

    path(
    'reset-password/',
    ResetPasswordView.as_view(),
    name='reset-password'
    ),


    path(
        'admin-dashboard/',
        AdminDashboardView.as_view(),
        name='admin-dashboard'
    ),

    path(
        'admin-candidates/',
        AdminCandidatesView.as_view(),
        name='admin-candidates'
    ),

    path(
        'admin-recruiters/',
        AdminRecruitersView.as_view(),
        name='admin-recruiters'
    ),

    path(
        'admin-jobs/',
        AdminJobsView.as_view(),
        name='admin-jobs'
    ),

    path(
        'admin-applications/',
        AdminApplicationsView.as_view(),
        name='admin-applications'
    ),

    path(
        'admin-application-status/<int:application_id>/',
        AdminApplicationStatusUpdateView.as_view(),
        name='admin-application-status'
    ),

    path(
        'admin-users/',
        AdminUsersView.as_view(),
        name='admin-users'
    ),

    path(
        'admin-user-status/<int:user_id>/',
        AdminUserStatusUpdateView.as_view(),
        name='admin-user-status'
    ),

    path(
        'admin-user-delete/<int:user_id>/',
        AdminUserDeleteView.as_view(),
        name='admin-user-delete'
    ),

]