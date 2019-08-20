from django.db import models
from simple_history.models import HistoricalRecords
from django.conf import settings
import os
from adminmaster.datamanagement.submodels.labeldata import LabelDataModel

#                           |      Predicted |         Predicted    |
#                           |    as Positive |      as Negative     |
# ------------------ | --------------------- | ---------------------|
# Actual: Positive   |  True Positive(TP)    | False Negative(FN)   |
# ------------------ | --------------------- | ---------------------|
# Actual: Negative   |  False Positive(FP)   | True Negative(TN)    |
# ------------------ | --------------------- | ---------------------|

class BoundingBoxModel(models.Model):

    CREATED = '-1'
    FALSE_POSITIVE = '0'
    TRUE_POSITIVE = '1'

    TYPE_FLAG_CHOICES = (
        (CREATED, 'User created'), #alway FALSE_NEGATIVE
        (FALSE_POSITIVE, 'False Positive'),
        (TRUE_POSITIVE, 'True Positive'),
    )
    id = models.AutoField(primary_key=True)

    label = models.ForeignKey(LabelDataModel, on_delete=models.CASCADE)

    position = models.TextField(blank=True, null=True, verbose_name="position label")

    flag = models.CharField(
        max_length=20,
        choices=TYPE_FLAG_CHOICES,
        default=CREATED,
    )

    from_id = models.CharField(max_length=100, default='',
        blank=True, verbose_name="From")

    to_id = models.CharField(max_length=100, default='',
        blank=True, verbose_name="To")

    accept_report_flag = models.BooleanField(
        default=False, verbose_name="accept report flag false positive?")

    history = HistoricalRecords()

    def __str__(self):
        return self.label.tag_label + ' - [' + self.position + ']'

    def get_groundtruth(self):
        return self.label.tag_label + ',' + self.position + '\n'
