from django.urls import path
from rest_framework_simplejwt.views import (TokenObtainPairView,
                                            TokenRefreshView)

from .views import ProfileView, RegisterView

urlpatterns = [
    path("signup/", RegisterView.as_view(), name="register"),
    path("signin/", TokenObtainPairView.as_view(), name="signin"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("profile/", ProfileView.as_view(), name="profile"),
]
