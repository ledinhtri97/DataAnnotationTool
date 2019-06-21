import os

from django.db  import models
from django.conf import settings
from .medical_instance import MedicalInstanceModel
from .labeldata import LabelDataModel
from django.core.validators import FileExtensionValidator
from adminmaster.datamanagement.submodels.boudingbox import BoundingBoxModel


class MedicalPredictedInstanceModel(models.Model):

    id = models.AutoField(primary_key=True)

    instance_id = models.ForeignKey(MedicalInstanceModel, on_delete=models.CASCADE, blank=True, null=True, verbose_name="Instance ID")

    label_id = models.ForeignKey(LabelDataModel, on_delete=models.CASCADE, blank=True, null=True)

    def __str__(self):
        return self.instance_id.instance_uid + '(' + str(self.label_id.tag_label) + ')'