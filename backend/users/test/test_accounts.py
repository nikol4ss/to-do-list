import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse

User = get_user_model()

VALID_PAYLOAD = {
    "username": "newuser",
    "email": "newuser@test.com",
    "password": "StrongPass123!",
    "first_name": "New",
    "last_name": "User",
}


# RegisterView  —  POST /accounts/signup/
@pytest.mark.django_db
class TestRegisterView:
    url = reverse("register")

    def test_register_success(self, api_client):
        response = api_client.post(self.url, VALID_PAYLOAD, format="json")
        assert response.status_code == 201
        data = response.json()
        assert data["username"] == VALID_PAYLOAD["username"]
        assert data["email"] == VALID_PAYLOAD["email"]
        assert "password" not in data  # write_only

    def test_register_persists_user(self, api_client):
        api_client.post(self.url, VALID_PAYLOAD, format="json")
        assert User.objects.filter(username=VALID_PAYLOAD["username"]).exists()

    def test_register_duplicate_email(self, api_client, create_user):
        create_user(email="newuser@test.com")
        response = api_client.post(self.url, VALID_PAYLOAD, format="json")
        assert response.status_code == 400
        assert "email" in response.json()

    def test_register_duplicate_username(self, api_client, create_user):
        create_user(username="newuser")
        response = api_client.post(self.url, VALID_PAYLOAD, format="json")
        assert response.status_code == 400

    def test_register_short_password(self, api_client):
        payload = {**VALID_PAYLOAD, "password": "abc"}
        response = api_client.post(self.url, payload, format="json")
        assert response.status_code == 400
        assert "password" in response.json()

    def test_register_missing_username(self, api_client):
        payload = {k: v for k, v in VALID_PAYLOAD.items() if k != "username"}
        response = api_client.post(self.url, payload, format="json")
        assert response.status_code == 400

    def test_register_missing_password(self, api_client):
        payload = {k: v for k, v in VALID_PAYLOAD.items() if k != "password"}
        response = api_client.post(self.url, payload, format="json")
        assert response.status_code == 400

    def test_register_email_is_lowercased(self, api_client):
        payload = {**VALID_PAYLOAD, "email": "NEWUSER@TEST.COM"}
        api_client.post(self.url, payload, format="json")
        user = User.objects.get(username=VALID_PAYLOAD["username"])
        assert user.email == "newuser@test.com"

    def test_register_response_has_id(self, api_client):
        response = api_client.post(self.url, VALID_PAYLOAD, format="json")
        assert "id" in response.json()

    def test_register_id_is_read_only(self, api_client):
        payload = {**VALID_PAYLOAD, "id": 9999}
        response = api_client.post(self.url, payload, format="json")
        assert response.status_code == 201
        data = response.json()
        assert data["id"] != 9999


# TokenObtainPairView  —  POST /accounts/signin/
@pytest.mark.django_db
class TestSignInView:
    url = reverse("signin")

    def test_signin_success(self, api_client, user):
        response = api_client.post(
            self.url,
            {"username": user.username, "password": "StrongPass123!"},
            format="json",
        )
        assert response.status_code == 200
        data = response.json()
        assert "access" in data
        assert "refresh" in data

    def test_signin_wrong_password(self, api_client, user):
        response = api_client.post(
            self.url,
            {"username": user.username, "password": "wrongpass"},
            format="json",
        )
        assert response.status_code == 401

    def test_signin_nonexistent_user(self, api_client):
        response = api_client.post(
            self.url,
            {"username": "nobody", "password": "StrongPass123!"},
            format="json",
        )
        assert response.status_code == 401

    def test_signin_missing_fields(self, api_client):
        response = api_client.post(self.url, {}, format="json")
        assert response.status_code == 400


# TokenRefreshView  —  POST /accounts/refresh/
@pytest.mark.django_db
class TestTokenRefreshView:
    url = reverse("token_refresh")

    def test_refresh_success(self, api_client, tokens):
        response = api_client.post(
            self.url, {"refresh": tokens["refresh"]}, format="json"
        )
        assert response.status_code == 200
        assert "access" in response.json()

    def test_refresh_invalid_token(self, api_client):
        response = api_client.post(
            self.url, {"refresh": "invalid.token.here"}, format="json"
        )
        assert response.status_code == 401

    def test_refresh_missing_token(self, api_client):
        response = api_client.post(self.url, {}, format="json")
        assert response.status_code == 400


# ProfileView  —  GET / PATCH / PUT /accounts/profile/
@pytest.mark.django_db
class TestProfileView:
    url = reverse("profile")

    def test_get_profile_authenticated(self, auth_client, user):
        response = auth_client.get(self.url)
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == user.username
        assert data["email"] == user.email
        assert "date_joined" in data
        assert "id" in data

    def test_get_profile_unauthenticated(self, api_client):
        response = api_client.get(self.url)
        assert response.status_code == 401

    def test_get_profile_no_password_in_response(self, auth_client):
        response = auth_client.get(self.url)
        assert "password" not in response.json()

    def test_patch_profile_first_name(self, auth_client, user):
        response = auth_client.patch(self.url, {"first_name": "Updated"}, format="json")
        assert response.status_code == 200
        user.refresh_from_db()
        assert user.first_name == "Updated"

    def test_patch_profile_last_name(self, auth_client, user):
        response = auth_client.patch(self.url, {"last_name": "Last"}, format="json")
        assert response.status_code == 200
        user.refresh_from_db()
        assert user.last_name == "Last"

    def test_patch_profile_unauthenticated(self, api_client):
        response = api_client.patch(self.url, {"first_name": "Hacker"}, format="json")
        assert response.status_code == 401

    def test_id_is_read_only(self, auth_client, user):
        original_id = user.id
        auth_client.patch(self.url, {"id": 9999}, format="json")
        user.refresh_from_db()
        assert user.id == original_id

    def test_date_joined_is_read_only(self, auth_client, user):
        original = user.date_joined
        auth_client.patch(
            self.url, {"date_joined": "2000-01-01T00:00:00Z"}, format="json"
        )
        user.refresh_from_db()
        assert user.date_joined == original

    def test_put_profile(self, auth_client, user):
        payload = {
            "username": user.username,
            "email": user.email,
            "first_name": "Full",
            "last_name": "Update",
        }
        response = auth_client.put(self.url, payload, format="json")
        assert response.status_code == 200
        user.refresh_from_db()
        assert user.first_name == "Full"
        assert user.last_name == "Update"
