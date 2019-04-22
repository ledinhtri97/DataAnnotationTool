from django.db import models
from adminmaster.datamanagement.models import DataSetModel
from adminmaster.workspacemanagement.models import WorkSpaceUserModel

# Create your models here.

class UserSettingsModel(models.Model):
  
  user = models.ForeignKey('auth.User', on_delete=models.CASCADE)

  dataset = models.ForeignKey(DataSetModel, on_delete=models.CASCADE)

  settings = models.TextField(default='', blank=True, null=True)
  
  def __str__(self):
      return self.user.username + " | " + str(self.dataset)
  

