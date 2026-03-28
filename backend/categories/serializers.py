import re

from rest_framework import serializers

from .models import Category


class CategoryReadSerializer(serializers.ModelSerializer):

    class Meta:
        model = Category
        fields = [
            "id",
            "owner",
            "name",
            "color",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "owner", "created_at", "updated_at"]


class CategoryWriteSerializer(serializers.ModelSerializer):

    class Meta:
        model = Category
        fields = ["name", "color"]

    def validate_name(self, value):
        value = value.strip()

        if len(value) < 3:
            raise serializers.ValidationError("Nome deve ter ao menos 3 caracteres.")

        user = self.context["request"].user
        queryset = Category.objects.filter(owner=user, name__iexact=value)

        if self.instance:
            queryset = queryset.exclude(id=self.instance.id)

        if queryset.exists():
            raise serializers.ValidationError(
                "Você já possui uma categoria com esse nome."
            )

        return value

    def validate_color(self, value):
        value = value.strip().upper()

        if not re.match(r"^#[0-9A-F]{6}$", value):
            raise serializers.ValidationError(
                "Cor deve estar no formato hexadecimal (#RRGGBB)."
            )

        return value
