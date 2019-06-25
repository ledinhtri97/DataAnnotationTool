from django.db  import models
from simple_history.models import HistoricalRecords
from django.core.validators import FileExtensionValidator
from django.conf import settings
from .medical_patient import MedicalPatientModel
import os

class MedicalStudiesModel(models.Model):

    id = models.AutoField(primary_key=True)

    studies_uid = models.CharField(max_length=100, verbose_name="Studies UID")
    studies_last_update = models.DateTimeField(auto_now_add=True, blank=True, null=True, verbose_name="Studies Last Update")
    patient_id = models.ForeignKey(MedicalPatientModel, on_delete=models.CASCADE, blank=True, null=True)
    studies_instance_uid = models.CharField(max_length=100, verbose_name="Studies Instance UID")

    def __str__(self):
        return self.studies_uid

    
    