from django.contrib import admin

from .models import Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "owner", "color", "created_at")
    list_filter = ("owner",)
    search_fields = ("name", "owner__username")
    search_fields = ("name", "owner__username")
