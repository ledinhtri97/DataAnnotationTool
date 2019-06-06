from django.db import models
from adminmaster.datamanagement.models import InputDataModel
from simple_history.models import HistoricalRecords
from django.utils.html import format_html

# Create your models here.
class ContributeModel(models.Model):
    
    name = models.CharField(max_length=100, default="contribute", blank=True, null=True)
    
    available = models.BooleanField(default=True, verbose_name="Contribute Available")
    
    user = models.ManyToManyField('auth.user', blank=True)

    description = models.CharField(max_length=200, verbose_name="Add detail description")

    input = models.ManyToManyField(InputDataModel,  blank=True)

    history = HistoricalRecords()

    def manager_contribute(self):
        return format_html('<a target="_blank" href="/gvlab-dat/datadmin/contributes/main-{}/">Manager</a>', str(self.id))

    manager_contribute.admin_order_field = 'name'

    def __str__(self):
        return self.name
