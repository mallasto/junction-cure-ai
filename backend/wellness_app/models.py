from django.db import models

# Create your models here.
class JournalEntry(models.Model):
    id = models.AutoField(primary_key=True)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    
    
class Meta:
    app_label = 'wellness_app'