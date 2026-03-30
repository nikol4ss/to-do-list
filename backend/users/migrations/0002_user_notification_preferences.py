from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="notifications_enabled",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="user",
            name="notify_on_task_shared",
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name="user",
            name="notify_on_task_completed",
            field=models.BooleanField(default=True),
        ),
    ]
