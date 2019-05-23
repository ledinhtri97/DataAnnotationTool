import os

from django.db import models
from django.conf import settings
from .labeldata import LabelDataModel
from .medical_patient import MedicalPatientModel
from .medical_studies import MedicalStudiesModel
from .medical_series import MedicalSeriesModel


class MedicalDataSetModel(models.Model):

   id = models.AutoField(primary_key=True)

   name = models.CharField(max_length=100, default='dataset name', blank=True, verbose_name="Name of data set")
   
   study_id = models.ForeignKey(MedicalStudiesModel, on_delete=models.CASCADE, blank=True, null=True, verbose_name="Study ID")

   non_contrast_phase = models.ForeignKey(MedicalSeriesModel, on_delete=models.CASCADE, blank=True, null=True, related_name='non_contrast_phase', verbose_name="Non Constrast Phase")

   arterial_phase = models.ForeignKey(MedicalSeriesModel, on_delete=models.CASCADE, blank=True, null=True, related_name='arterial_phase', verbose_name="Arterial Phase")

   venous_phase = models.ForeignKey(MedicalSeriesModel, on_delete=models.CASCADE, blank=True, null=True, related_name='venous_phase', verbose_name="Venous Phase")

   delay_phase = models.ForeignKey(MedicalSeriesModel, on_delete=models.CASCADE, blank=True, null=True, related_name='delay_phase', verbose_name="Delay Phase")

   labels = models.ManyToManyField(LabelDataModel, blank=True)

   user = models.ManyToManyField('auth.user', blank=True)

   def get_dir_path(self):
      return os.path.join(str(self.id)) #../id/..

   def get_full_path(self):
      return os.path.join(settings.BASE_DIR, self.get_dir_path()) #/home/../id/..

   def __str__(self):
      return str(self.id) + "_" + self.name.replace(' ','_')