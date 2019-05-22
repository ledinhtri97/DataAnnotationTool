from django.db  import models
from simple_history.models import HistoricalRecords
from django.core.validators import FileExtensionValidator
from django.conf import settings
from .medical_series import MedicalSeriesModel
import os

class MedicalInstanceModel(models.Model):

    id = models.AutoField(primary_key=True)

    index_in_series = models.IntegerField(verbose_name="Index In Series")

    instance_uid = models.CharField(max_length=100, verbose_name="Instance UID")

    seri_id = models.ForeignKey(MedicalSeriesModel, on_delete=models.CASCADE, blank=True, null=True, verbose_name="Seri ID")
    
    def __str__(self):
        return self.instance_uid + '(' + str(self.index_in_series) + ')'