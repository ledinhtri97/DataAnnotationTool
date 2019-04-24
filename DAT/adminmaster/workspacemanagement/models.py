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

# Create your models here.

class UserSettingsModel(models.Model):
  
  user = models.ForeignKey('auth.User', on_delete=models.CASCADE)

  dataset = models.ForeignKey(DataSetModel, on_delete=models.CASCADE)

  settings = models.TextField(default='', blank=True, null=True)
  
  def __str__(self):
      return self.user.username + " | " + str(self.dataset)