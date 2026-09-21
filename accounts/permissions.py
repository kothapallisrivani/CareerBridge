from rest_framework.permissions import BasePermission


class IsCandidate(BasePermission):
    """
    Allows access only to users who are Candidates.
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and hasattr(request.user, 'candidate_profile')
        )


class IsRecruiter(BasePermission):
    """
    Allows access only to users who are Recruiters.
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and hasattr(request.user, 'recruiter_profile')
        )


class IsAdmin(BasePermission):
    """
    Allows access only to Admin users.
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
        )