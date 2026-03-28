from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Task, TaskShare

User = get_user_model()


class TaskReadSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source="owner.username", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "is_done",
            "due_date",
            "owner_name",
            "category",
            "category_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class TaskWriteSerializer(serializers.ModelSerializer):

    class Meta:
        model = Task
        fields = ["title", "description", "due_date", "category"]

    def validate_title(self, value):
        value = value.strip()
        if len(value) < 3:
            raise serializers.ValidationError("Título deve ter ao menos 3 caracteres.")
        return value

    def validate_category(self, value):
        if value and value.owner != self.context["request"].user:
            raise serializers.ValidationError("Categoria inválida.")
        return value


class TaskShareReadSerializer(serializers.ModelSerializer):
    shared_with_username = serializers.CharField(
        source="shared_with.username", read_only=True
    )
    task_title = serializers.CharField(source="task.title", read_only=True)

    class Meta:
        model = TaskShare
        fields = [
            "id",
            "task",
            "task_title",
            "shared_with",
            "shared_with_username",
            "permission",
            "shared_at",
        ]
        read_only_fields = ["id", "shared_at"]


class TaskShareWriteSerializer(serializers.ModelSerializer):
    shared_with_username = serializers.CharField(write_only=True)

    class Meta:
        model = TaskShare
        fields = ["shared_with_username", "permission"]

    def validate_shared_with_username(self, value):
        try:
            user = User.objects.get(username=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("Usuário não encontrado.")

        if user == self.context["request"].user:
            raise serializers.ValidationError(
                "Você não pode compartilhar uma tarefa consigo mesmo."
            )
        return user

    def create(self, validated_data):
        shared_with = validated_data.pop("shared_with_username")
        task = self.context["task"]

        if TaskShare.objects.filter(task=task, shared_with=shared_with).exists():
            raise serializers.ValidationError(
                {"shared_with_username": "Tarefa já compartilhada com este usuário."}
            )

        return TaskShare.objects.create(
            task=task,
            shared_with=shared_with,
            **validated_data,
        )
