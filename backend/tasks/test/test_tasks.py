import pytest
from categories.models import Category
from django.core import mail
from django.urls import reverse
from rest_framework.pagination import PageNumberPagination
from tasks.models import Task, TaskShare
from tasks.views import TaskViewSet


def make_task(owner, title="Minha tarefa", **kwargs):
    return Task.objects.create(owner=owner, title=title, **kwargs)


def make_share(task, shared_with, permission=TaskShare.Permission.READ):
    return TaskShare.objects.create(
        task=task, shared_with=shared_with, permission=permission
    )


def make_category(owner, name="Cat", color="#AABBCC"):
    return Category.objects.create(owner=owner, name=name, color=color)


class TestPagination(PageNumberPagination):
    page_size = 1


# LIST  —  GET /tasks/
@pytest.mark.django_db
class TestTaskList:
    url = reverse("task-list")

    def test_list_own_tasks(self, auth_client, user):
        make_task(user, "T1")
        make_task(user, "T2")
        response = auth_client.get(self.url)
        assert response.status_code == 200
        assert len(response.json()) == 2

    def test_list_excludes_other_user_tasks(self, auth_client, user, other_user):
        make_task(user, "Mine")
        make_task(other_user, "Theirs")
        response = auth_client.get(self.url)
        titles = [t["title"] for t in response.json()]
        assert "Mine" in titles
        assert "Theirs" not in titles

    def test_list_unauthenticated(self, api_client):
        response = api_client.get(self.url)
        assert response.status_code == 401

    def test_list_empty(self, auth_client):
        response = auth_client.get(self.url)
        assert response.status_code == 200
        assert response.json() == []

    def test_list_response_fields(self, auth_client, user):
        make_task(user)
        data = auth_client.get(self.url).json()[0]
        for f in (
            "id",
            "title",
            "description",
            "isDone",
            "dueDate",
            "ownerId",
            "ownerName",
            "categoryId",
            "categoryName",
            "createdAt",
            "updatedAt",
        ):
            assert f in data, f"Campo ausente na listagem: {f}"

    def test_list_owner_name_matches(self, auth_client, user):
        make_task(user)
        data = auth_client.get(self.url).json()[0]
        assert data["ownerName"] == user.username

    def test_list_filters_by_search(self, auth_client, user):
        make_task(user, "Comprar leite", description="mercado")
        make_task(user, "Estudar python", description="backend")
        response = auth_client.get(self.url, {"search": "leite"})
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["title"] == "Comprar leite"

    def test_list_filters_by_category(self, auth_client, user):
        work = make_category(user, "Work")
        personal = make_category(user, "Personal")
        make_task(user, "A", category=work)
        make_task(user, "B", category=personal)
        response = auth_client.get(self.url, {"category": work.id})
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["categoryId"] == work.id

    def test_list_filters_by_is_done(self, auth_client, user):
        make_task(user, "Done", is_done=True)
        make_task(user, "Open", is_done=False)
        response = auth_client.get(self.url, {"is_done": "true"})
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["title"] == "Done"

    def test_list_is_paginated_when_enabled(self, auth_client, user, monkeypatch):
        monkeypatch.setattr(TaskViewSet, "pagination_class", TestPagination)
        make_task(user, "T1")
        make_task(user, "T2")
        response = auth_client.get(self.url)
        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 2
        assert len(data["results"]) == 1


# CREATE  —  POST /tasks/
@pytest.mark.django_db
class TestTaskCreate:
    url = reverse("task-list")

    def test_create_success(self, auth_client, user):
        payload = {"title": "Nova tarefa", "description": "Desc"}
        response = auth_client.post(self.url, payload, format="json")
        assert response.status_code == 201
        assert Task.objects.filter(owner=user, title="Nova tarefa").exists()

    def test_create_unauthenticated(self, api_client):
        response = api_client.post(self.url, {"title": "X"}, format="json")
        assert response.status_code == 401

    def test_create_sets_owner(self, auth_client, user):
        auth_client.post(self.url, {"title": "Auto Owner"}, format="json")
        task = Task.objects.get(title="Auto Owner")
        assert task.owner == user

    def test_create_title_too_short(self, auth_client):
        response = auth_client.post(self.url, {"title": "AB"}, format="json")
        assert response.status_code == 400
        assert "title" in response.json()

    def test_create_title_strips_whitespace(self, auth_client, user):
        auth_client.post(self.url, {"title": "  Espaços  "}, format="json")
        task = Task.objects.filter(owner=user).first()
        assert task.title.strip() == task.title

    def test_create_missing_title(self, auth_client):
        response = auth_client.post(
            self.url, {"description": "Sem título"}, format="json"
        )
        assert response.status_code == 400

    def test_create_with_due_date(self, auth_client, user):
        payload = {
            "title": "Com prazo",
            "due_date": "2030-12-31T23:59:00Z",
        }
        response = auth_client.post(self.url, payload, format="json")
        assert response.status_code == 201

    def test_create_with_own_category(self, auth_client, user):
        cat = make_category(user)
        payload = {"title": "Com categoria", "category": cat.id}
        response = auth_client.post(self.url, payload, format="json")
        assert response.status_code == 201

    def test_create_with_other_user_category(self, auth_client, other_user):
        cat = make_category(other_user)
        payload = {"title": "Cat errada", "category": cat.id}
        response = auth_client.post(self.url, payload, format="json")
        assert response.status_code == 400

    def test_create_default_is_done_false(self, auth_client, user):
        auth_client.post(self.url, {"title": "Is Done?"}, format="json")
        task = Task.objects.get(owner=user, title="Is Done?")
        assert task.is_done is False


# RETRIEVE  —  GET /tasks/{id}/
@pytest.mark.django_db
class TestTaskRetrieve:

    def test_retrieve_own_task(self, auth_client, user):
        task = make_task(user, "Mine")
        url = reverse("task-detail", args=[task.id])
        response = auth_client.get(url)
        assert response.status_code == 200
        assert response.json()["id"] == task.id

    def test_retrieve_other_user_task(self, auth_client, other_user):
        task = make_task(other_user, "Theirs")
        url = reverse("task-detail", args=[task.id])
        response = auth_client.get(url)
        assert response.status_code == 404

    def test_retrieve_unauthenticated(self, api_client, user):
        task = make_task(user)
        url = reverse("task-detail", args=[task.id])
        response = api_client.get(url)
        assert response.status_code == 401

    def test_retrieve_nonexistent(self, auth_client):
        url = reverse("task-detail", args=[9999])
        response = auth_client.get(url)
        assert response.status_code == 404


# UPDATE  —  PUT /tasks/{id}/
@pytest.mark.django_db
class TestTaskUpdate:

    def test_put_success(self, auth_client, user):
        task = make_task(user, "Antiga")
        url = reverse("task-detail", args=[task.id])
        response = auth_client.put(url, {"title": "Nova"}, format="json")
        assert response.status_code == 200
        task.refresh_from_db()
        assert task.title == "Nova"

    def test_put_other_user_task(self, auth_client, other_user):
        task = make_task(other_user, "NotMine")
        url = reverse("task-detail", args=[task.id])
        response = auth_client.put(url, {"title": "Hacked"}, format="json")
        assert response.status_code in (403, 404)

    def test_put_unauthenticated(self, api_client, user):
        task = make_task(user)
        url = reverse("task-detail", args=[task.id])
        response = api_client.put(url, {"title": "Hack"}, format="json")
        assert response.status_code == 401


# PARTIAL UPDATE  —  PATCH /tasks/{id}/
@pytest.mark.django_db
class TestTaskPartialUpdate:

    def test_patch_title(self, auth_client, user):
        task = make_task(user, "Old Title")
        url = reverse("task-detail", args=[task.id])
        response = auth_client.patch(url, {"title": "New Title"}, format="json")
        assert response.status_code == 200
        task.refresh_from_db()
        assert task.title == "New Title"

    def test_patch_description(self, auth_client, user):
        task = make_task(user)
        url = reverse("task-detail", args=[task.id])
        auth_client.patch(url, {"description": "Desc atualizada"}, format="json")
        task.refresh_from_db()
        assert task.description == "Desc atualizada"

    def test_patch_other_user(self, auth_client, other_user):
        task = make_task(other_user, "NotMine")
        url = reverse("task-detail", args=[task.id])
        response = auth_client.patch(url, {"title": "Hacked"}, format="json")
        assert response.status_code in (403, 404)


# DELETE  —  DELETE /tasks/{id}/
@pytest.mark.django_db
class TestTaskDelete:

    def test_delete_success(self, auth_client, user):
        task = make_task(user)
        url = reverse("task-detail", args=[task.id])
        response = auth_client.delete(url)
        assert response.status_code == 204
        assert not Task.objects.filter(id=task.id).exists()

    def test_delete_other_user_task(self, auth_client, other_user):
        task = make_task(other_user, "NotMine")
        url = reverse("task-detail", args=[task.id])
        response = auth_client.delete(url)
        assert response.status_code in (403, 404)
        assert Task.objects.filter(id=task.id).exists()

    def test_delete_unauthenticated(self, api_client, user):
        task = make_task(user)
        url = reverse("task-detail", args=[task.id])
        response = api_client.delete(url)
        assert response.status_code == 401

    def test_delete_nonexistent(self, auth_client):
        url = reverse("task-detail", args=[9999])
        response = auth_client.delete(url)
        assert response.status_code == 404


# TOGGLE DONE  —  PATCH /tasks/{id}/toggle/
@pytest.mark.django_db
class TestToggleDone:

    def test_toggle_false_to_true(self, auth_client, user):
        task = make_task(user, is_done=False)
        url = reverse("task-toggle-done", args=[task.id])
        response = auth_client.patch(url)
        assert response.status_code == 200
        task.refresh_from_db()
        assert task.is_done is True

    def test_toggle_true_to_false(self, auth_client, user):
        task = make_task(user, is_done=True)
        url = reverse("task-toggle-done", args=[task.id])
        response = auth_client.patch(url)
        assert response.status_code == 200
        task.refresh_from_db()
        assert task.is_done is False

    def test_toggle_twice_restores_state(self, auth_client, user):
        task = make_task(user, is_done=False)
        url = reverse("task-toggle-done", args=[task.id])
        auth_client.patch(url)
        auth_client.patch(url)
        task.refresh_from_db()
        assert task.is_done is False

    def test_toggle_response_has_is_done_field(self, auth_client, user):
        task = make_task(user)
        url = reverse("task-toggle-done", args=[task.id])
        data = auth_client.patch(url).json()
        assert "isDone" in data

    def test_toggle_sends_completion_email_to_shared_users(
        self, auth_client, user, other_user
    ):
        task = make_task(user, is_done=False)
        other_user.notifications_enabled = True
        other_user.notify_on_task_completed = True
        other_user.save(
            update_fields=["notifications_enabled", "notify_on_task_completed"]
        )
        make_share(task, other_user)
        url = reverse("task-toggle-done", args=[task.id])
        response = auth_client.patch(url)
        assert response.status_code == 200
        assert len(mail.outbox) == 1
        assert other_user.email in mail.outbox[0].to

    def test_toggle_other_user_task(self, auth_client, other_user):
        task = make_task(other_user)
        url = reverse("task-toggle-done", args=[task.id])
        response = auth_client.patch(url)
        assert response.status_code in (403, 404)

    def test_toggle_unauthenticated(self, api_client, user):
        task = make_task(user)
        url = reverse("task-toggle-done", args=[task.id])
        response = api_client.patch(url)
        assert response.status_code == 401


# SHARES LIST  —  GET /tasks/{id}/shares/
@pytest.mark.django_db
class TestSharesList:

    def test_list_shares_success(self, auth_client, user, other_user):
        task = make_task(user)
        make_share(task, other_user)
        url = reverse("task-shares", args=[task.id])
        response = auth_client.get(url)
        assert response.status_code == 200
        assert len(response.json()) == 1

    def test_list_shares_empty(self, auth_client, user):
        task = make_task(user)
        url = reverse("task-shares", args=[task.id])
        response = auth_client.get(url)
        assert response.status_code == 200
        assert response.json() == []

    def test_list_shares_other_user_task(self, auth_client, other_user):
        task = make_task(other_user)
        url = reverse("task-shares", args=[task.id])
        response = auth_client.get(url)
        assert response.status_code in (403, 404)

    def test_list_shares_response_fields(self, auth_client, user, other_user):
        task = make_task(user)
        make_share(task, other_user)
        url = reverse("task-shares", args=[task.id])
        data = auth_client.get(url).json()[0]
        for f in (
            "id",
            "task",
            "task_title",
            "shared_with",
            "shared_with_username",
            "permission",
            "shared_at",
        ):
            assert f in data, f"Campo ausente: {f}"


# SHARES CREATE  —  POST /tasks/{id}/shares/
@pytest.mark.django_db
class TestShareCreate:

    def test_share_success(self, auth_client, user, other_user):
        other_user.notifications_enabled = True
        other_user.notify_on_task_shared = True
        other_user.save(update_fields=["notifications_enabled", "notify_on_task_shared"])
        task = make_task(user)
        url = reverse("task-shares", args=[task.id])
        payload = {
            "shared_with_username": other_user.username,
            "permission": "read",
        }
        response = auth_client.post(url, payload, format="json")
        assert response.status_code == 201
        assert TaskShare.objects.filter(task=task, shared_with=other_user).exists()
        assert len(mail.outbox) == 1
        assert other_user.email in mail.outbox[0].to

    def test_share_edit_permission(self, auth_client, user, other_user):
        task = make_task(user)
        url = reverse("task-shares", args=[task.id])
        payload = {
            "shared_with_username": other_user.username,
            "permission": "edit",
        }
        response = auth_client.post(url, payload, format="json")
        assert response.status_code == 201
        share = TaskShare.objects.get(task=task, shared_with=other_user)
        assert share.permission == TaskShare.Permission.EDIT

    def test_share_nonexistent_user(self, auth_client, user):
        task = make_task(user)
        url = reverse("task-shares", args=[task.id])
        payload = {"shared_with_username": "nobody", "permission": "read"}
        response = auth_client.post(url, payload, format="json")
        assert response.status_code == 400

    def test_share_with_self(self, auth_client, user):
        task = make_task(user)
        url = reverse("task-shares", args=[task.id])
        payload = {"shared_with_username": user.username, "permission": "read"}
        response = auth_client.post(url, payload, format="json")
        assert response.status_code == 400

    def test_share_duplicate(self, auth_client, user, other_user):
        task = make_task(user)
        make_share(task, other_user)
        url = reverse("task-shares", args=[task.id])
        payload = {
            "shared_with_username": other_user.username,
            "permission": "read",
        }
        response = auth_client.post(url, payload, format="json")
        assert response.status_code == 400

    def test_share_other_user_task(self, auth_client, other_user, create_user):
        task = make_task(other_user)
        third = create_user()
        url = reverse("task-shares", args=[task.id])
        payload = {"shared_with_username": third.username, "permission": "read"}
        response = auth_client.post(url, payload, format="json")
        assert response.status_code in (403, 404)

    def test_share_unauthenticated(self, api_client, user, other_user):
        task = make_task(user)
        url = reverse("task-shares", args=[task.id])
        response = api_client.post(
            url,
            {"shared_with_username": other_user.username, "permission": "read"},
            format="json",
        )
        assert response.status_code == 401


# REMOVE SHARE  —  DELETE /tasks/{id}/shares/{share_id}/
@pytest.mark.django_db
class TestRemoveShare:

    def test_remove_share_success(self, auth_client, user, other_user):
        task = make_task(user)
        share = make_share(task, other_user)
        url = reverse("task-remove-share", args=[task.id, share.id])
        response = auth_client.delete(url)
        assert response.status_code == 204
        assert not TaskShare.objects.filter(id=share.id).exists()

    def test_remove_share_nonexistent(self, auth_client, user):
        task = make_task(user)
        url = reverse("task-remove-share", args=[task.id, 9999])
        response = auth_client.delete(url)
        assert response.status_code == 404

    def test_remove_share_other_user_task(self, auth_client, other_user, create_user):
        task = make_task(other_user)
        third = create_user()
        share = make_share(task, third)
        url = reverse("task-remove-share", args=[task.id, share.id])
        response = auth_client.delete(url)
        assert response.status_code in (403, 404)
        assert TaskShare.objects.filter(id=share.id).exists()

    def test_remove_share_unauthenticated(self, api_client, user, other_user):
        task = make_task(user)
        share = make_share(task, other_user)
        url = reverse("task-remove-share", args=[task.id, share.id])
        response = api_client.delete(url)
        assert response.status_code == 401


# SHARED WITH ME  —  GET /tasks/shared-with-me/
@pytest.mark.django_db
class TestSharedWithMe:
    url = reverse("task-shared-with-me")

    def test_shared_with_me_returns_shared_tasks(self, auth_client, user, other_user):
        task = make_task(other_user, "Shared Task")
        make_share(task, user)
        response = auth_client.get(self.url)
        assert response.status_code == 200
        assert any(t["title"] == "Shared Task" for t in response.json())

    def test_shared_with_me_empty(self, auth_client):
        response = auth_client.get(self.url)
        assert response.status_code == 200
        assert response.json() == []

    def test_shared_with_me_excludes_own_tasks(self, auth_client, user):
        make_task(user, "My Own")
        response = auth_client.get(self.url)
        titles = [t["title"] for t in response.json()]
        assert "My Own" not in titles

    def test_shared_with_me_excludes_other_users_shares(
        self, auth_client, user, other_user, create_user
    ):
        third = create_user()
        task = make_task(third, "Shared with Other")
        make_share(task, other_user)
        response = auth_client.get(self.url)
        assert response.json() == []

    def test_shared_with_me_unauthenticated(self, api_client):
        response = api_client.get(self.url)
        assert response.status_code == 401

    def test_shared_with_me_multiple(self, auth_client, user, other_user, create_user):
        third = create_user()
        task1 = make_task(other_user, "T1")
        task2 = make_task(third, "T2")
        make_share(task1, user)
        make_share(task2, user)
        response = auth_client.get(self.url)
        assert len(response.json()) == 2

    def test_shared_with_me_filters_by_search(self, auth_client, user, other_user):
        make_share(make_task(other_user, "Planejar viagem"), user)
        make_share(make_task(other_user, "Organizar docs"), user)
        response = auth_client.get(self.url, {"search": "viagem"})
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["title"] == "Planejar viagem"

    def test_shared_with_me_is_paginated_when_enabled(
        self, auth_client, user, other_user, create_user, monkeypatch
    ):
        monkeypatch.setattr(TaskViewSet, "pagination_class", TestPagination)
        third = create_user()
        make_share(make_task(other_user, "T1"), user)
        make_share(make_task(third, "T2"), user)
        response = auth_client.get(self.url)
        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 2
        assert len(data["results"]) == 1


# SHARED EDIT  —  PATCH /tasks/{id}/shared-edit/
@pytest.mark.django_db
class TestSharedEdit:

    def test_shared_edit_with_edit_permission(self, auth_client, user, other_user):
        task = make_task(other_user, "Original")
        make_share(task, user, permission=TaskShare.Permission.EDIT)
        url = reverse("task-shared-edit", args=[task.id])
        response = auth_client.patch(url, {"title": "Editado"}, format="json")
        assert response.status_code == 200
        task.refresh_from_db()
        assert task.title == "Editado"

    def test_shared_edit_with_read_permission_denied(
        self, auth_client, user, other_user
    ):
        task = make_task(other_user)
        make_share(task, user, permission=TaskShare.Permission.READ)
        url = reverse("task-shared-edit", args=[task.id])
        response = auth_client.patch(url, {"title": "Hack"}, format="json")
        assert response.status_code == 403

    def test_shared_edit_not_shared_at_all(self, auth_client, user, other_user):
        task = make_task(other_user, "Private")
        url = reverse("task-shared-edit", args=[task.id])
        response = auth_client.patch(url, {"title": "Hack"}, format="json")
        assert response.status_code == 403

    def test_shared_edit_nonexistent_task(self, auth_client):
        url = reverse("task-shared-edit", args=[9999])
        response = auth_client.patch(url, {"title": "X"}, format="json")
        assert response.status_code == 404

    def test_shared_edit_unauthenticated(self, api_client, user, other_user):
        task = make_task(other_user)
        make_share(task, user, permission=TaskShare.Permission.EDIT)
        url = reverse("task-shared-edit", args=[task.id])
        response = api_client.patch(url, {"title": "Hack"}, format="json")
        assert response.status_code == 401

    def test_shared_edit_only_allowed_fields(self, auth_client, user, other_user):
        task = make_task(other_user, "Original")
        make_share(task, user, permission=TaskShare.Permission.EDIT)
        url = reverse("task-shared-edit", args=[task.id])
        auth_client.patch(
            url,
            {"title": "OK", "owner": user.id},
            format="json",
        )
        task.refresh_from_db()
        assert task.owner == other_user

    def test_shared_edit_response_fields(self, auth_client, user, other_user):
        task = make_task(other_user, "Resp Fields")
        make_share(task, user, permission=TaskShare.Permission.EDIT)
        url = reverse("task-shared-edit", args=[task.id])
        data = auth_client.patch(url, {"title": "Updated"}, format="json").json()
        for f in ("id", "title", "isDone", "ownerId", "ownerName"):
            assert f in data, f"Campo ausente: {f}"

    def test_shared_edit_sends_completion_email_to_owner(
        self, auth_client, user, other_user
    ):
        other_user.notifications_enabled = True
        other_user.notify_on_task_completed = True
        other_user.save(
            update_fields=["notifications_enabled", "notify_on_task_completed"]
        )
        task = make_task(other_user, "Shared completion", is_done=False)
        make_share(task, user, permission=TaskShare.Permission.EDIT)
        url = reverse("task-shared-edit", args=[task.id])
        response = auth_client.patch(url, {"is_done": True}, format="json")
        assert response.status_code == 200
        assert len(mail.outbox) == 1
        assert other_user.email in mail.outbox[0].to

    def test_shared_edit_own_task_forbidden(self, auth_client, user):
        task = make_task(user, "Own Task")
        url = reverse("task-shared-edit", args=[task.id])
        response = auth_client.patch(url, {"title": "Edit via shared"}, format="json")
        assert response.status_code == 403
