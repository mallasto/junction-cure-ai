# Generated by Django 4.2.7 on 2023-11-11 11:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('wellness_app', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='journalentry',
            name='id',
            field=models.AutoField(primary_key=True, serialize=False),
        ),
    ]