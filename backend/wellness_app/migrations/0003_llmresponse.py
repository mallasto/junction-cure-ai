# Generated by Django 4.2.7 on 2023-11-11 19:35

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('wellness_app', '0002_alter_journalentry_id'),
    ]

    operations = [
        migrations.CreateModel(
            name='LLMResponse',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('patient_summary', models.TextField()),
                ('patient_feedback', models.JSONField()),
                ('therapist_summary', models.TextField()),
                ('therapist_feedback', models.JSONField()),
                ('entry', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='wellness_app.journalentry')),
            ],
        ),
    ]
