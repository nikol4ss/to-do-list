import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken


User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def create_user(db):
    sequence = {"value": 0}

    def factory(**kwargs):
        sequence["value"] += 1
        suffix = sequence["value"]
        defaults = {
            "username": f"testuser{suffix}",
            "email": f"testuser{suffix}@example.com",
            "password": "StrongPass123!",
            "first_name": "Test",
            "last_name": "User",
        }
        defaults.update(kwargs)
        password = defaults.pop("password")
        return User.objects.create_user(password=password, **defaults)

    return factory


@pytest.fixture
def user(create_user):
    return create_user()


@pytest.fixture
def other_user(create_user):
    return create_user(
        username="otheruser",
        email="otheruser@example.com",
    )


@pytest.fixture
def auth_client(user):
    client = APIClient()
    refresh = RefreshToken.for_user(user)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
    return client


@pytest.fixture
def tokens(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }
