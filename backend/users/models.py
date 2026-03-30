from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    notifications_enabled = models.BooleanField(default=False)
    notify_on_task_shared = models.BooleanField(default=True)
    notify_on_task_completed = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Usuário"
        verbose_name_plural = "Usuários"
