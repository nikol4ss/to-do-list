from rest_framework import permissions, viewsets

from .models import Task
from .permissions import IsOwner
from .serializers import TaskReadSerializer, TaskWriteSerializer


class TaskViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return Task.objects.filter(owner=self.request.user)

    def get_serializer_class(self):
        if self.action in ["list", "retrieve"]:
            return TaskReadSerializer
        return TaskWriteSerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
