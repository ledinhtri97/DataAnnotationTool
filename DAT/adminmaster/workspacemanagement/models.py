from django.db import models
from adminmaster.datamanagement.models import DataSetModel
from simple_history.models import HistoricalRecords

# Create your models here.
class WorkSpaceUserModel(models.Model):
   
   nameworkspace = models.CharField(max_length=100, default="workspace", blank=True, null=True)
   
   user = models.ManyToManyField('auth.user', blank=True)

   dataset = models.OneToOneField(DataSetModel,  on_delete=models.CASCADE)

   def __str__(self):
       return self.nameworkspace
