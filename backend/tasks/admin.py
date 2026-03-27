from django.contrib import admin

from .models import Task


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ("title", "owner", "category", "is_done", "due_date",
                    "created_at")
    list_filter = ("is_done", "category")
    search_fields = ("title", "owner__username", "category__name")
    search_fields = ("title", "owner__username", "category__name")
