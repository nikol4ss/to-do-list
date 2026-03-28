from django.contrib import admin

from .models import Task, TaskShare


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ("title", "owner", "category", "is_done", "due_date", "created_at")
    list_filter = ("is_done", "category")
    search_fields = ("title", "owner__username", "category__name")


@admin.register(TaskShare)
class TaskShareAdmin(admin.ModelAdmin):
    list_display = ("task", "shared_with", "permission", "task_category", "shared_at")
    list_filter = ("permission",)
    search_fields = ("task__title", "shared_with__username")

    def task_category(self, obj):
        return obj.task.category.name if obj.task.category else "-"

    task_category.short_description = "Category"
