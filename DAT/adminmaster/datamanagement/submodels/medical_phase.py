from django.db  import models
from simple_history.models import HistoricalRecords
from django.core.validators import FileExtensionValidator
from django.conf import settings
import os

class MedicalPhaseModel(models.Model):

    id = models.AutoField(primary_key=True)

    phase_name = models.CharField(max_length=100, verbose_name="Phase Name")

    phase_number = models.IntegerField(verbose_name="Phase Number")
    
    def __str__(self):
        return self.phase_name + '(' + str(self.phase_number) + ')'

    
    