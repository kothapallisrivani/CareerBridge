from django.contrib.auth import authenticate
from django.contrib.auth.models import User

from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from candidates.models import Candidate
from recruiters.models import Recruiter

from .serializers import RegisterSerializer


# =========================================================
# REGISTER
# =========================================================

class RegisterView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        name = request.data.get("name", "").strip()
        username = request.data.get("username", "").strip()
        email = request.data.get("email", "").strip()
        phone = request.data.get("phone", "").strip()
        role = request.data.get("role", "Candidate")

        # -------------------------
        # REQUIRED FIELD VALIDATION
        # -------------------------

        if not name:
            return Response(
                {"name": "Full name is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not username:
            return Response(
                {"username": "Username is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not email:
            return Response(
                {"email": "Email is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not phone:
            return Response(
                {"phone": "Phone number is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # -------------------------
        # CHECK USERNAME
        # -------------------------

        if User.objects.filter(username=username).exists():

            return Response(
                {
                    "username":
                    "A user with this username already exists."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # -------------------------
        # CHECK EMAIL
        # -------------------------

        if User.objects.filter(email=email).exists():

            return Response(
                {
                    "email":
                    "An account with this email already exists."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # -------------------------
        # CREATE USER
        # -------------------------

        serializer = RegisterSerializer(
            data={
                "username": username,
                "email": email,
                "password": request.data.get("password")
            }
        )

        if not serializer.is_valid():

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        user = serializer.save()

        # =================================================
        # CANDIDATE REGISTRATION
        # =================================================

        if role == "Candidate":

            candidate = Candidate.objects.create(
                user=user,
                name=name,
                email=email,
                phone=phone,
                skills="",
                education="",
                experience=0,
                location="Hyderabad"
            )

            token, created = Token.objects.get_or_create(
                user=user
            )

            return Response(
                {
                    "message":
                    "Candidate account created successfully.",

                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "role": "candidate",
                        "candidate_id": candidate.id
                    }
                },
                status=status.HTTP_201_CREATED
            )

        # =================================================
        # RECRUITER REGISTRATION
        # =================================================

        elif role == "Recruiter":

            recruiter = Recruiter.objects.create(
                user=user,
                name=name,
                email=email,
                phone=phone,
                company="",
                position="",
                website="",
                location="Hyderabad"
            )

            token, created = Token.objects.get_or_create(
                user=user
            )

            return Response(
                {
                    "message":
                    "Recruiter account created successfully.",

                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "role": "recruiter",
                        "recruiter_id": recruiter.id
                    }
                },
                status=status.HTTP_201_CREATED
            )

        # -------------------------
        # INVALID ROLE
        # -------------------------

        user.delete()

        return Response(
            {
                "error": "Invalid registration role."
            },
            status=status.HTTP_400_BAD_REQUEST
        )


# =========================================================
# LOGIN
# =========================================================

class LoginView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        login_value = request.data.get(
            "username",
            ""
        ).strip()

        password = request.data.get(
            "password",
            ""
        )

        if not login_value:

            return Response(
                {
                    "error":
                    "Username or email is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if not password:

            return Response(
                {
                    "error":
                    "Password is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # =================================================
        # LOGIN USING USERNAME
        # =================================================

        user = authenticate(
            username=login_value,
            password=password
        )

        # =================================================
        # LOGIN USING EMAIL
        # =================================================

        if user is None:

            try:

                email_user = User.objects.get(
                    email__iexact=login_value
                )

                user = authenticate(
                    username=email_user.username,
                    password=password
                )

            except User.DoesNotExist:

                user = None

        # =================================================
        # INVALID LOGIN
        # =================================================

        if user is None:

            return Response(
                {
                    "error":
                    "Invalid username/email or password."
                },
                status=status.HTTP_401_UNAUTHORIZED
            )

        # =================================================
        # CHECK ACTIVE ACCOUNT
        # =================================================

        if not user.is_active:

            return Response(
                {
                    "error":
                    "Your account has been disabled."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # =================================================
        # TOKEN
        # =================================================

        token, created = Token.objects.get_or_create(
            user=user
        )

        # =================================================
        # DETERMINE ROLE
        # =================================================

        if user.is_staff:

            role = "admin"

        elif hasattr(user, "candidate_profile"):

            role = "candidate"

        elif hasattr(user, "recruiter_profile"):

            role = "recruiter"

        else:

            role = "user"

        # =================================================
        # USER DATA
        # =================================================

        user_data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": role,
            "is_staff": user.is_staff
        }

        if role == "candidate":

            user_data["candidate_id"] = (
                user.candidate_profile.id
            )

        if role == "recruiter":

            user_data["recruiter_id"] = (
                user.recruiter_profile.id
            )

        # =================================================
        # LOGIN RESPONSE
        # =================================================

        return Response(
            {
                "message": "Login successful.",
                "token": token.key,
                "user": user_data
            },
            status=status.HTTP_200_OK
        )


    # =========================================================
# FORGOT PASSWORD
# =========================================================

from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes


class ForgotPasswordView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        email = request.data.get("email", "").strip()

        if not email:
            return Response(
                {
                    "error": "Email address is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(
                email__iexact=email
            )

        except User.DoesNotExist:
            return Response(
                {
                    "error":
                    "No account found with this email address."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        uid = urlsafe_base64_encode(
            force_bytes(user.pk)
        )

        token = default_token_generator.make_token(
            user
        )

        return Response(
            {
                "message":
                "Password reset token generated successfully.",

                "uid": uid,

                "token": token
            },
            status=status.HTTP_200_OK
        )


# =========================================================
# RESET PASSWORD
# =========================================================

from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str


class ResetPasswordView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        uid = request.data.get("uid", "").strip()
        token = request.data.get("token", "").strip()
        password = request.data.get("password", "")

        # -------------------------
        # REQUIRED FIELD VALIDATION
        # -------------------------

        if not uid:
            return Response(
                {
                    "error": "Reset user ID is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if not token:
            return Response(
                {
                    "error": "Reset token is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if not password:
            return Response(
                {
                    "error": "New password is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # -------------------------
        # PASSWORD LENGTH
        # -------------------------

        if len(password) < 8:
            return Response(
                {
                    "error":
                    "Password must be at least 8 characters long."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # -------------------------
        # DECODE USER ID
        # -------------------------

        try:

            user_id = force_str(
                urlsafe_base64_decode(uid)
            )

            user = User.objects.get(
                pk=user_id
            )

        except (
            TypeError,
            ValueError,
            OverflowError,
            User.DoesNotExist
        ):

            return Response(
                {
                    "error":
                    "Invalid password reset request."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # -------------------------
        # VERIFY TOKEN
        # -------------------------

        if not default_token_generator.check_token(
            user,
            token
        ):

            return Response(
                {
                    "error":
                    "Invalid or expired password reset token."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # -------------------------
        # UPDATE PASSWORD
        # -------------------------

        user.set_password(password)
        user.save()

        return Response(
            {
                "message":
                "Password reset successfully."
            },
            status=status.HTTP_200_OK
        )

# =========================================================
# ADMIN DASHBOARD
# =========================================================

class AdminDashboardView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if not request.user.is_staff:

            return Response(
                {
                    "error":
                    "Admin access required."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        from jobs.models import Job
        from applications.models import Application

        total_candidates = Candidate.objects.count()
        total_recruiters = Recruiter.objects.count()
        total_jobs = Job.objects.count()
        total_applications = Application.objects.count()

        return Response(
            {
                "message":
                "Welcome to CareerBridge Admin Dashboard.",

                "total_candidates":
                total_candidates,

                "total_recruiters":
                total_recruiters,

                "total_jobs":
                total_jobs,

                "total_applications":
                total_applications
            },
            status=status.HTTP_200_OK
        )


# =========================================================
# ADMIN CANDIDATES
# =========================================================

class AdminCandidatesView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if not request.user.is_staff:

            return Response(
                {
                    "error":
                    "Admin access required."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        candidates = Candidate.objects.all()

        data = []

        for candidate in candidates:

            data.append(
                {
                    "id": candidate.id,
                    "name": candidate.name,
                    "email": candidate.email,
                    "phone": candidate.phone,
                    "skills": candidate.skills,
                    "education": candidate.education,
                    "experience": candidate.experience,
                    "location": candidate.location
                }
            )

        return Response(
            data,
            status=status.HTTP_200_OK
        )


# =========================================================
# ADMIN RECRUITERS
# =========================================================

class AdminRecruitersView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if not request.user.is_staff:

            return Response(
                {
                    "error":
                    "Admin access required."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        recruiters = Recruiter.objects.all()

        data = []

        for recruiter in recruiters:

            data.append(
                {
                    "id": recruiter.id,
                    "name": recruiter.name,
                    "email": recruiter.email,
                    "phone": recruiter.phone,
                    "company": recruiter.company,
                    "position": recruiter.position,
                    "website": recruiter.website,
                    "location": recruiter.location
                }
            )

        return Response(
            data,
            status=status.HTTP_200_OK
        )


# =========================================================
# ADMIN JOBS
# =========================================================

class AdminJobsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if not request.user.is_staff:

            return Response(
                {
                    "error":
                    "Admin access required."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        from jobs.models import Job

        jobs = Job.objects.all()

        data = []

        for job in jobs:

            data.append(
                {
                    "id": job.id,
                    "title": job.title,
                    "description": job.description,
                    "location": job.location,
                    "job_type": job.job_type,
                    "salary": job.salary,
                    "required_skills": job.required_skills,
                    "experience": job.experience,
                    "recruiter": job.recruiter.id,
                    "posted_date": job.posted_date
                }
            )

        return Response(
            data,
            status=status.HTTP_200_OK
        )


# =========================================================
# ADMIN APPLICATIONS
# =========================================================

class AdminApplicationsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if not request.user.is_staff:

            return Response(
                {
                    "error":
                    "Admin access required."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        from applications.models import Application

        applications = Application.objects.all()

        data = []

        for application in applications:

            data.append(
                {
                    "id": application.id,
                    "candidate": application.candidate.id,
                    "job": application.job.id,
                    "status": application.status,
                    "applied_date":
                    application.applied_date
                }
            )

        return Response(
            data,
            status=status.HTTP_200_OK
        )


# =========================================================
# ADMIN APPLICATION STATUS UPDATE
# =========================================================

class AdminApplicationStatusUpdateView(APIView):

    permission_classes = [IsAuthenticated]

    def patch(self, request, application_id):

        if not request.user.is_staff:

            return Response(
                {
                    "error":
                    "Admin access required."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        from applications.models import Application

        try:

            application = Application.objects.get(
                id=application_id
            )

        except Application.DoesNotExist:

            return Response(
                {
                    "error":
                    "Application not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        new_status = request.data.get("status")

        allowed_statuses = [
            "Applied",
            "Shortlisted",
            "Rejected",
            "Selected"
        ]

        if new_status not in allowed_statuses:

            return Response(
                {
                    "error":
                    "Invalid status.",

                    "allowed_statuses":
                    allowed_statuses
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        application.status = new_status
        application.save()

        return Response(
            {
                "message":
                "Application status updated successfully.",

                "status":
                application.status
            },
            status=status.HTTP_200_OK
        )


# =========================================================
# ADMIN USERS
# =========================================================

class AdminUsersView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if not request.user.is_staff:

            return Response(
                {
                    "error":
                    "Admin access required."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        users = User.objects.all()

        data = []

        for user in users:

            if user.is_staff:

                role = "admin"

            elif hasattr(user, "candidate_profile"):

                role = "candidate"

            elif hasattr(user, "recruiter_profile"):

                role = "recruiter"

            else:

                role = "user"

            data.append(
                {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": role,
                    "is_active": user.is_active
                }
            )

        return Response(
            data,
            status=status.HTTP_200_OK
        )


# =========================================================
# ADMIN USER STATUS
# =========================================================

class AdminUserStatusUpdateView(APIView):

    permission_classes = [IsAuthenticated]

    def patch(self, request, user_id):

        if not request.user.is_staff:

            return Response(
                {
                    "error":
                    "Admin access required."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        try:

            user = User.objects.get(
                id=user_id
            )

        except User.DoesNotExist:

            return Response(
                {
                    "error":
                    "User not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        user.is_active = request.data.get(
            "is_active",
            user.is_active
        )

        user.save()

        return Response(
            {
                "message":
                "User status updated successfully.",

                "is_active":
                user.is_active
            },
            status=status.HTTP_200_OK
        )


# =========================================================
# ADMIN USER DELETE
# =========================================================

class AdminUserDeleteView(APIView):

    permission_classes = [IsAuthenticated]

    def delete(self, request, user_id):

        if not request.user.is_staff:

            return Response(
                {
                    "error":
                    "Admin access required."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        try:

            user = User.objects.get(
                id=user_id
            )

        except User.DoesNotExist:

            return Response(
                {
                    "error":
                    "User not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if user.is_staff:

            return Response(
                {
                    "error":
                    "Admin users cannot be deleted here."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        user.delete()

        return Response(
            {
                "message":
                "User deleted successfully."
            },
            status=status.HTTP_200_OK
        )