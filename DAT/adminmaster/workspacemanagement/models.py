from django.db import models
from adminmaster.datamanagement.models import DataSetModel
from simple_history.models import HistoricalRecords
from apimodel.models import ApiReferenceModel

from django.utils.html import format_html

# Create your models here.
class WorkSpaceUserModel(models.Model):

    nameworkspace = models.CharField(max_length=100, default="workspace", blank=True, null=True)
    
    user = models.ManyToManyField('auth.user', blank=True)

    dataset = models.OneToOneField(DataSetModel, on_delete=models.CASCADE)

    api_reference = models.ManyToManyField(ApiReferenceModel, blank=True)

    def manage(self):
        return format_html('<a href="/gvlab-dat/datadmin/workspace/main-{}/">Manage - {}</a>',
            str(self.id),
            str(self.nameworkspace))

    manage.admin_order_field = 'nameworkspace'

    def __str__(self):
        return self.nameworkspace

# Create your models here.

class UserSettingsModel(models.Model):
    user = models.OneToOneField('auth.User', on_delete=models.CASCADE)

    settings = models.TextField(default='', blank=True, null=True)
      
    def __str__(self):
        return "Settings: " + self.user.username
