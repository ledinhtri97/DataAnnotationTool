from django.db import models
from simple_history.models import HistoricalRecords

class LabelDataModel(models.Model):

   RECT = 'rect'
   QUAD = 'quad'

   TYPE_LABEL_CHOICES = (
        (RECT, 'Rectangle'),
        (QUAD, 'Quadrilateral'),
   )

   tag_label = models.CharField(max_length=100)

   type_label = models.CharField(
        max_length=10,
        choices=TYPE_LABEL_CHOICES,
        default=RECT,
   )

   description = models.CharField(max_length=1000, blank=True, null=True)

   history = HistoricalRecords()

   def __str__(self):
      return self.tag_label
