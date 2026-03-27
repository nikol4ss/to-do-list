from django.contrib import admin

from .models import Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "user", "color", "created_at")
    list_filter = ("user",)
    search_fields = ("name", "user__username")
    search_fields = ("name", "user__username")
