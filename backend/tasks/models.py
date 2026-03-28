from django.conf import settings
from django.db import models


class Task(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="tasks",
    )
    category = models.ForeignKey(
        "categories.Category",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="tasks",
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    is_done = models.BooleanField(default=False)
    due_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Tarefa"
        verbose_name_plural = "Tarefas"

    def __str__(self):
        return self.title

    def mark_done(self):
        self.is_done = True
        self.save(update_fields=["is_done"])


class TaskShare(models.Model):

    class Permission(models.TextChoices):
        READ = "read", "Leitura"
        EDIT = "edit", "Edição"

    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name="shares",
    )
    shared_with = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="received_shares",
    )
    permission = models.CharField(
        max_length=4,
        choices=Permission.choices,
        default=Permission.READ,
    )
    shared_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("task", "shared_with")
        verbose_name = "Compartilhamento"
        verbose_name_plural = "Compartilhamentos"

    def __str__(self):
        return f"{self.task} → {self.shared_with} ({self.permission})"
