from django.db  import models
from simple_history.models import HistoricalRecords
from django.core.validators import FileExtensionValidator
from django.conf import settings
import os


class MedicalPatientModel(models.Model):
    MALE = 'male'
    FEMALE = 'female'
    OTHER = 'other'
    TYPE_SEX_CHOICES = (
        (MALE, 'M'),
        (FEMALE, 'F'),
        (OTHER, 'O'),
    )

    id = models.AutoField(primary_key=True)

    patient_name = models.CharField(max_length=100, blank=True, null=True, verbose_name="Patient Name")

    patient_birthdate = models.DateTimeField(auto_now_add=True, blank=True, null=True, verbose_name="Patient Birthdate")

    patient_sex = models.CharField(max_length=1, choices=TYPE_SEX_CHOICES, default=MALE, verbose_name="Patient Sex")

    patient_uid = models.CharField(max_length=100, verbose_name="Patient UID")
    
    
    def __str__(self):
        return self.patient_name

