from django.db  import models
from simple_history.models import HistoricalRecords
from django.core.validators import FileExtensionValidator
from django.conf import settings
from .medical_studies import MedicalStudiesModel
from .medical_phase import MedicalPhaseModel
import os

class MedicalSeriesModel(models.Model):

    id = models.AutoField(primary_key=True)

    series_name = models.CharField(max_length=100, verbose_name="Series Name")

    series_instance_uid = models.CharField(max_length=100, verbose_name="Series Instance UID")

    studies_id = models.ForeignKey(MedicalStudiesModel, on_delete=models.CASCADE, blank=True, null=True, verbose_name="Study ID")

    series_instance_number = models.IntegerField(verbose_name="Series Instance Number")

    phase_id = models.ForeignKey(MedicalPhaseModel, on_delete=models.CASCADE, blank=True, null=True, verbose_name="Phase ID")

    def __str__(self):
        return self.series_name + '(' + self.series_instance_uid + ')'

    
    