from django.db  import models
from simple_history.models import HistoricalRecords
from django.core.validators import FileExtensionValidator
from django.conf import settings
from .medical_patient import MedicalPatientModel
import os

class MedicalSeriesModel(models.Model):

    id = models.AutoField(primary_key=True)

    series_name = models.CharField(max_length=100, verbose_name="Series Name")

    series_instance_uid = models.CharField(max_length=100, verbose_name="Series Instance UID")

    patient_id = models.ForeignKey(MedicalPatientModel, on_delete=models.CASCADE)
    # , on_delete=models.CASCADE, blank=True, null=True

    def __str__(self):
        return self.series_name + '(' + self.series_instance_uid + ')'

    
    