from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings

# Create your models here.

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)

class Document(models.Model):
    agent_name = models.CharField(max_length=80)
    doc_name = models.CharField(max_length=120)
    doc_content = models.TextField()
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    def __str__(self):
        return self.doc_name