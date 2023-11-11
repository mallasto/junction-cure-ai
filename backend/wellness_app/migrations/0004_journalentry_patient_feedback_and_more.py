# Generated by Django 4.2.7 on 2023-11-11 20:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('wellness_app', '0003_llmresponse'),
    ]

    operations = [
        migrations.AddField(
            model_name='journalentry',
            name='patient_feedback',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='journalentry',
            name='patient_summary',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='journalentry',
            name='therapist_feedback',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='journalentry',
            name='therapist_summary',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.DeleteModel(
            name='LLMResponse',
        ),
    ]