from rest_framework import permissions, viewsets

from .models import Category
from .permissions import IsOwner
from .serializers import CategoryReadSerializer, CategoryWriteSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return Category.objects.filter(owner=self.request.user)

    def get_serializer_class(self):
        if self.action in ["list", "retrieve"]:
            return CategoryReadSerializer
        return CategoryWriteSerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
        serializer.save(owner=self.request.user)
