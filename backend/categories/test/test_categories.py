import pytest
from categories.models import Category
from django.urls import reverse


def make_category(owner, name="Trabalho", color="#FF5733"):
    return Category.objects.create(owner=owner, name=name, color=color)


# LIST  —  GET /categories/
@pytest.mark.django_db
class TestCategoryList:
    url = reverse("category-list")

    def test_list_returns_only_own_categories(self, auth_client, user, other_user):
        make_category(user, "Mine")
        make_category(other_user, "Theirs")
        response = auth_client.get(self.url)
        assert response.status_code == 200
        names = [c["name"] for c in response.json()]
        assert "Mine" in names
        assert "Theirs" not in names

    def test_list_unauthenticated(self, api_client):
        response = api_client.get(self.url)
        assert response.status_code == 401

    def test_list_empty(self, auth_client):
        response = auth_client.get(self.url)
        assert response.status_code == 200
        assert response.json() == []

    def test_list_multiple_categories(self, auth_client, user):
        make_category(user, "Cat1", "#AABBCC")
        make_category(user, "Cat2", "#DDEEFF")
        response = auth_client.get(self.url)
        assert len(response.json()) == 2


# CREATE  —  POST /categories/
@pytest.mark.django_db
class TestCategoryCreate:
    url = reverse("category-list")

    def test_create_success(self, auth_client, user):
        payload = {"name": "Estudos", "color": "#123ABC"}
        response = auth_client.post(self.url, payload, format="json")
        assert response.status_code == 201
        assert Category.objects.filter(owner=user, name="Estudos").exists()

    def test_create_unauthenticated(self, api_client):
        response = api_client.post(
            self.url, {"name": "X", "color": "#AABBCC"}, format="json"
        )
        assert response.status_code == 401

    def test_create_sets_owner_automatically(self, auth_client, user):
        response = auth_client.post(
            self.url, {"name": "Auto", "color": "#AABBCC"}, format="json"
        )
        assert response.status_code == 201
        cat = Category.objects.get(name="Auto")
        assert cat.owner == user

    def test_create_name_too_short(self, auth_client):
        response = auth_client.post(
            self.url, {"name": "AB", "color": "#AABBCC"}, format="json"
        )
        assert response.status_code == 400
        assert "name" in response.json()

    def test_create_duplicate_name_same_owner(self, auth_client, user):
        make_category(user, "Duplicada")
        response = auth_client.post(
            self.url, {"name": "Duplicada", "color": "#AABBCC"}, format="json"
        )
        assert response.status_code == 400
        assert "name" in response.json()

    def test_create_duplicate_name_case_insensitive(self, auth_client, user):
        make_category(user, "Personal")
        response = auth_client.post(
            self.url, {"name": "personal", "color": "#AABBCC"}, format="json"
        )
        assert response.status_code == 400

    def test_create_same_name_different_owner(self, auth_client, other_user):
        make_category(other_user, "Shared Name")
        response = auth_client.post(
            self.url, {"name": "Shared Name", "color": "#AABBCC"}, format="json"
        )
        assert response.status_code == 201

    def test_create_invalid_color_no_hash(self, auth_client):
        response = auth_client.post(
            self.url, {"name": "ValidName", "color": "AABBCC"}, format="json"
        )
        assert response.status_code == 400
        assert "color" in response.json()

    def test_create_invalid_color_short(self, auth_client):
        response = auth_client.post(
            self.url, {"name": "ValidName", "color": "#ABC"}, format="json"
        )
        assert response.status_code == 400

    def test_create_invalid_color_with_letters_out_of_range(self, auth_client):
        response = auth_client.post(
            self.url, {"name": "ValidName", "color": "#GGGGGG"}, format="json"
        )
        assert response.status_code == 400

    def test_create_color_is_uppercased(self, auth_client):
        response = auth_client.post(
            self.url, {"name": "ValidName", "color": "#aabbcc"}, format="json"
        )
        assert response.status_code == 201
        cat = Category.objects.get(name="ValidName")
        assert cat.color == "#AABBCC"

    def test_create_missing_name(self, auth_client):
        response = auth_client.post(self.url, {"color": "#AABBCC"}, format="json")
        assert response.status_code == 400

    def test_create_missing_color(self, auth_client):
        response = auth_client.post(self.url, {"name": "Valid"}, format="json")
        assert response.status_code == 400


# RETRIEVE  —  GET /categories/{id}/
@pytest.mark.django_db
class TestCategoryRetrieve:

    def test_retrieve_own_category(self, auth_client, user):
        cat = make_category(user)
        url = reverse("category-detail", args=[cat.id])
        response = auth_client.get(url)
        assert response.status_code == 200
        assert response.json()["id"] == cat.id

    def test_retrieve_other_user_category(self, auth_client, other_user):
        cat = make_category(other_user, "Others")
        url = reverse("category-detail", args=[cat.id])
        response = auth_client.get(url)
        assert response.status_code == 404

    def test_retrieve_unauthenticated(self, api_client, user):
        cat = make_category(user)
        url = reverse("category-detail", args=[cat.id])
        response = api_client.get(url)
        assert response.status_code == 401

    def test_retrieve_nonexistent(self, auth_client):
        url = reverse("category-detail", args=[9999])
        response = auth_client.get(url)
        assert response.status_code == 404

    def test_retrieve_response_fields(self, auth_client, user):
        cat = make_category(user, "Fields Test", "#CCDDEE")
        url = reverse("category-detail", args=[cat.id])
        data = auth_client.get(url).json()
        for field in ("id", "owner", "name", "color", "created_at", "updated_at"):
            assert field in data, f"Campo ausente: {field}"


# UPDATE  —  PUT /categories/{id}/
@pytest.mark.django_db
class TestCategoryUpdate:

    def test_put_success(self, auth_client, user):
        cat = make_category(user, "Antiga")
        url = reverse("category-detail", args=[cat.id])
        response = auth_client.put(
            url, {"name": "Nova", "color": "#001122"}, format="json"
        )
        assert response.status_code == 200
        cat.refresh_from_db()
        assert cat.name == "Nova"
        assert cat.color == "#001122"

    def test_put_other_user_category(self, auth_client, other_user):
        cat = make_category(other_user, "NotMine")
        url = reverse("category-detail", args=[cat.id])
        response = auth_client.put(
            url, {"name": "Hacked", "color": "#001122"}, format="json"
        )
        assert response.status_code in (403, 404)

    def test_put_unauthenticated(self, api_client, user):
        cat = make_category(user)
        url = reverse("category-detail", args=[cat.id])
        response = api_client.put(url, {"name": "X", "color": "#001122"}, format="json")
        assert response.status_code == 401

    def test_put_duplicate_name_same_user(self, auth_client, user):
        make_category(user, "Existente")
        cat2 = make_category(user, "Alvo", "#AABBCC")
        url = reverse("category-detail", args=[cat2.id])
        response = auth_client.put(
            url, {"name": "Existente", "color": "#001122"}, format="json"
        )
        assert response.status_code == 400

    def test_put_same_name_keeps_own_record(self, auth_client, user):
        cat = make_category(user, "MesmoNome")
        url = reverse("category-detail", args=[cat.id])
        response = auth_client.put(
            url, {"name": "MesmoNome", "color": "#001122"}, format="json"
        )
        assert response.status_code == 200


# PARTIAL UPDATE  —  PATCH /categories/{id}/
@pytest.mark.django_db
class TestCategoryPartialUpdate:

    def test_patch_name(self, auth_client, user):
        cat = make_category(user, "Original")
        url = reverse("category-detail", args=[cat.id])
        response = auth_client.patch(url, {"name": "Alterado"}, format="json")
        assert response.status_code == 200
        cat.refresh_from_db()
        assert cat.name == "Alterado"

    def test_patch_color(self, auth_client, user):
        cat = make_category(user)
        url = reverse("category-detail", args=[cat.id])
        response = auth_client.patch(url, {"color": "#FFFFFF"}, format="json")
        assert response.status_code == 200
        cat.refresh_from_db()
        assert cat.color == "#FFFFFF"

    def test_patch_other_user(self, auth_client, other_user):
        cat = make_category(other_user, "NotMine")
        url = reverse("category-detail", args=[cat.id])
        response = auth_client.patch(url, {"name": "Hacked"}, format="json")
        assert response.status_code in (403, 404)


# DELETE  —  DELETE /categories/{id}/
@pytest.mark.django_db
class TestCategoryDelete:

    def test_delete_success(self, auth_client, user):
        cat = make_category(user)
        url = reverse("category-detail", args=[cat.id])
        response = auth_client.delete(url)
        assert response.status_code == 204
        assert not Category.objects.filter(id=cat.id).exists()

    def test_delete_other_user_category(self, auth_client, other_user):
        cat = make_category(other_user, "NotMine")
        url = reverse("category-detail", args=[cat.id])
        response = auth_client.delete(url)
        assert response.status_code in (403, 404)
        assert Category.objects.filter(id=cat.id).exists()

    def test_delete_unauthenticated(self, api_client, user):
        cat = make_category(user)
        url = reverse("category-detail", args=[cat.id])
        response = api_client.delete(url)
        assert response.status_code == 401

    def test_delete_nonexistent(self, auth_client):
        url = reverse("category-detail", args=[9999])
        response = auth_client.delete(url)
        assert response.status_code == 404
