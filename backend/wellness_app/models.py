from django.db import models

# Create your models here.
class JournalEntry(models.Model):
    id = models.AutoField(primary_key=True)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    
    
class LLMResponse(models.Model):
    entry = models.OneToOneField(JournalEntry, on_delete=models.CASCADE)
    patient_summary = models.TextField()
    patient_feedback = models.JSONField()
    therapist_summary = models.TextField()
    therapist_feedback = models.JSONField()
    
    
class Meta:
    app_label = 'wellness_app'