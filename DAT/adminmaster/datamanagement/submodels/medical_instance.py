import os

from django.db  import models
from django.conf import settings
from .medical_series import MedicalSeriesModel
from .medical_dataset import MedicalDataSetModel
from simple_history.models import HistoricalRecords
from django.core.validators import FileExtensionValidator
from adminmaster.datamanagement.submodels.boudingbox import BoundingBoxModel


class MedicalInstanceModel(models.Model):

    id = models.AutoField(primary_key=True)

    index_in_series = models.IntegerField(verbose_name="Index In Series")

    instance_uid = models.CharField(max_length=100, verbose_name="Instance UID")

    seri_id = models.ForeignKey(MedicalSeriesModel, on_delete=models.CASCADE, blank=True, null=True, verbose_name="Seri ID")
    
    dataset_id = models.ForeignKey(MedicalDataSetModel, on_delete=models.CASCADE, blank=True, null=True)

    boxes_position = models.ManyToManyField(
        BoundingBoxModel, blank=True, related_name="medical_boxes_position")

    is_annotated = models.BooleanField(
       default=False, verbose_name="is annotated?")

    is_allow_view = models.BooleanField(default=True, verbose_name="allow view?")
   
    is_notice_view = models.BooleanField(default=False, verbose_name="notice view?")

    is_reference_api = models.BooleanField(
        default=False, verbose_name="using reference api?")

    onviewing_user = models.OneToOneField(
       'auth.User', blank=True, null=True, verbose_name="User Viewing", on_delete=models.CASCADE)

    submitted_by_user = models.ManyToManyField('auth.User', blank=True, related_name="medical_submitted_by_user")

    #field a.k.a skip file
    skipped_by_user = models.ManyToManyField('auth.User', blank=True, related_name="medical_skipped_by_user")

    history = HistoricalRecords()

    sop_instance_uid = models.CharField(max_length=100, verbose_name="SOP Instance UID")

    def __str__(self):
        return self.instance_uid + '(' + str(self.index_in_series) + ')'