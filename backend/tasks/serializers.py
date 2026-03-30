from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Task, TaskShare

User = get_user_model()


class TaskReadSerializer(serializers.ModelSerializer):
    ownerId = serializers.IntegerField(source="owner_id")
    categoryId = serializers.IntegerField(
        source="category_id", allow_null=True, required=False
    )
    isDone = serializers.BooleanField(source="is_done")
    dueDate = serializers.DateTimeField(source="due_date", allow_null=True)
    createdAt = serializers.DateTimeField(source="created_at")
    updatedAt = serializers.DateTimeField(source="updated_at")

    ownerName = serializers.CharField(source="owner.username", read_only=True)
    categoryName = serializers.CharField(
        source="category.name", read_only=True, allow_null=True
    )

    shared = serializers.SerializerMethodField()
    sharedWith = serializers.SerializerMethodField()
    sharePermission = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "isDone",
            "dueDate",
            "ownerId",
            "ownerName",
            "categoryId",
            "categoryName",
            "shared",
            "sharedWith",
            "sharePermission",
            "createdAt",
            "updatedAt",
        ]

    def get_shared(self, obj) -> bool:
        return obj.shares.all().exists()

    def get_sharedWith(self, obj) -> list[str]:
        return [share.shared_with.username for share in obj.shares.all()]

    def get_sharePermission(self, obj):
        request = self.context.get("request")
        if not request or not getattr(request, "user", None):
            return None

        if obj.owner_id == request.user.id:
            return "owner"

        share = obj.shares.filter(shared_with=request.user).first()
        return share.permission if share else None


class TaskWriteSerializer(serializers.ModelSerializer):

    class Meta:
        model = Task
        fields = ["title", "description", "due_date", "category", "is_done"]

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
