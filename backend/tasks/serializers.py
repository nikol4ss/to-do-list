from rest_framework import serializers

from .models import Task


class TaskReadSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(
      source="owner.username", read_only=True
    )

    class Meta:
        model = Task
        fields = [
          "id", "title", "description",
          "is_done", "due_date",
          "owner_name", "category",
          "created_at", "updated_at"
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class TaskWriteSerializer(serializers.ModelSerializer):

    class Meta:
        model = Task
        fields = ["title", "description", "due_date", "category"]

    def validate_title(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError(
                "Título deve ter ao menos 3 caracteres."
            )
        return value.strip()
