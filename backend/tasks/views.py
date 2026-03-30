from django.db.models import Q
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Task, TaskShare
from .notifications import send_task_completed_email, send_task_shared_email
from .permissions import IsOwner
from .serializers import (
    TaskReadSerializer,
    TaskShareReadSerializer,
    TaskShareWriteSerializer,
    TaskWriteSerializer,
)


def _task_with_prefetch(pk):
    return Task.objects.prefetch_related("shares__shared_with").get(pk=pk)


class TaskViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def _apply_filters(self, queryset):
        params = self.request.query_params
        search = params.get("search", "").strip()
        category = params.get("category")
        is_done = params.get("is_done")
        ordering = params.get("ordering", "-created_at")

        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )

        if category:
            queryset = queryset.filter(category_id=category)

        if is_done in {"true", "false"}:
            queryset = queryset.filter(is_done=is_done == "true")

        allowed_ordering = {
            "created_at",
            "-created_at",
            "due_date",
            "-due_date",
            "title",
            "-title",
            "updated_at",
            "-updated_at",
        }
        if ordering in allowed_ordering:
            queryset = queryset.order_by(ordering)

        return queryset

    def get_queryset(self):
        queryset = (
            Task.objects.filter(owner=self.request.user)
            .prefetch_related("shares__shared_with")
            .select_related("owner", "category")
        )
        return self._apply_filters(queryset)

    def get_serializer_class(self):
        if self.action in ["list", "retrieve"]:
            return TaskReadSerializer
        return TaskWriteSerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=["patch"], url_path="toggle")
    def toggle_done(self, request, pk=None):
        task = self.get_object()
        was_done = task.is_done
        task.is_done = not task.is_done
        task.save(update_fields=["is_done", "updated_at"])

        if not was_done and task.is_done:
            shares = TaskShare.objects.filter(task=task).select_related("shared_with")
            for share in shares:
                send_task_completed_email(
                    task=task,
                    actor=request.user,
                    recipient=share.shared_with,
                )

        refreshed = _task_with_prefetch(task.pk)
        return Response(TaskReadSerializer(refreshed, context={"request": request}).data)

    @action(detail=True, methods=["get", "post"], url_path="shares")
    def shares(self, request, pk=None):
        task = self.get_object()

        if request.method == "GET":
            shares = TaskShare.objects.filter(task=task).select_related("shared_with")
            serializer = TaskShareReadSerializer(shares, many=True)
            return Response(serializer.data)

        serializer = TaskShareWriteSerializer(
            data=request.data,
            context={"request": request, "task": task},
        )
        serializer.is_valid(raise_exception=True)
        share = serializer.save()
        send_task_shared_email(
            task=task,
            sender=request.user,
            recipient=share.shared_with,
            permission=share.permission,
        )

        refreshed = _task_with_prefetch(task.pk)
        return Response(
            TaskReadSerializer(refreshed, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["delete"], url_path="unshare")
    def unshare(self, request, pk=None):
        task = self.get_object()
        username = request.query_params.get("username", "").strip()

        if not username:
            return Response(
                {"detail": "Parâmetro 'username' obrigatório."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        share = TaskShare.objects.filter(
            task=task, shared_with__username=username
        ).first()

        if not share:
            return Response(
                {"detail": "Compartilhamento não encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        share.delete()

        refreshed = _task_with_prefetch(task.pk)
        return Response(TaskReadSerializer(refreshed, context={"request": request}).data)

    @action(
        detail=True,
        methods=["delete"],
        url_path=r"shares/(?P<share_pk>\d+)",
    )
    def remove_share(self, request, pk=None, share_pk=None):
        task = self.get_object()
        share = TaskShare.objects.filter(pk=share_pk, task=task).first()

        if not share:
            return Response(
                {"detail": "Compartilhamento não encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        share.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(
        detail=False,
        methods=["get"],
        url_path="shared-with-me",
        permission_classes=[permissions.IsAuthenticated],
    )
    def shared_with_me(self, request):
        task_ids = TaskShare.objects.filter(
            shared_with=request.user
        ).values_list("task_id", flat=True)

        tasks = self._apply_filters(
            Task.objects.filter(id__in=task_ids)
            .prefetch_related("shares__shared_with")
            .select_related("owner", "category")
        )
        page = self.paginate_queryset(tasks)
        serializer = TaskReadSerializer(
            page if page is not None else tasks,
            many=True,
            context={"request": request},
        )
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return Response(serializer.data)

    @action(
        detail=True,
        methods=["patch"],
        url_path="shared-edit",
        permission_classes=[permissions.IsAuthenticated],
    )
    def shared_edit(self, request, pk=None):
        task = Task.objects.filter(pk=pk).first()

        if not task:
            return Response(
                {"detail": "Tarefa não encontrada."},
                status=status.HTTP_404_NOT_FOUND,
            )

        share = TaskShare.objects.filter(
            task=task,
            shared_with=request.user,
            permission=TaskShare.Permission.EDIT,
        ).first()

        if not share:
            return Response(
                {"detail": "Você não tem permissão para editar esta tarefa."},
                status=status.HTTP_403_FORBIDDEN,
            )

        allowed_fields = {"title", "description", "due_date", "is_done"}
        data = {k: v for k, v in request.data.items() if k in allowed_fields}
        was_done = task.is_done

        serializer = TaskWriteSerializer(
            task,
            data=data,
            partial=True,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        if not was_done and task.is_done and task.owner_id != request.user.id:
            send_task_completed_email(
                task=task,
                actor=request.user,
                recipient=task.owner,
            )

        refreshed = _task_with_prefetch(task.pk)
        return Response(TaskReadSerializer(refreshed, context={"request": request}).data)
