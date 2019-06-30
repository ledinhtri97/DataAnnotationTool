from django.db import models
from simple_history.models import HistoricalRecords
from django.core.validators import FileExtensionValidator
from django.conf import settings
from colorfield.fields import ColorField
import os

class LabelDataModel(models.Model):

     RECT = "rect"
     POLY = "poly"
     ATTR = "attr"
     TYPE_LABEL_CHOICES = (
        (RECT, 'Rectangle'),
        (POLY, 'Polygon'),
        (ATTR, 'Attribute'),
     )

     id = models.AutoField(primary_key=True)

     tag_label = models.CharField(max_length=100, default='label', verbose_name="Name label")

     type_label = models.CharField(
          max_length=20,
          choices=TYPE_LABEL_CHOICES,
          default=RECT,
     )

     color = ColorField(default='#58D68D')
     
     description = models.CharField(max_length=1000, blank=True, null=True)

     history = HistoricalRecords()

     def __str__(self):
          return self.tag_label+"-"+self.type_label
