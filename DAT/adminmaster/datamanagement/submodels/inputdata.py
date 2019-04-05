from django.db  import models
from simple_history.models import HistoricalRecords
from django.core.validators import FileExtensionValidator
from django.conf import settings

class InputDataModel(models.Model):

   TYPE_DATA_VALIDATION = ['zip', 'rar', 'mp4', 'avi', 'gif']

   zipfile = models.FileField(upload_to=settings.UPLOAD_DIR,
         validators=[FileExtensionValidator(
             allowed_extensions=TYPE_DATA_VALIDATION)]
   )

   groundtruth = models.FileField(upload_to=settings.UPLOAD_DIR,
         validators=[FileExtensionValidator(
             allowed_extensions=TYPE_DATA_VALIDATION)]
   )

   history = HistoricalRecords()

   owner = models.ForeignKey('auth.User', 
      on_delete=models.CASCADE, blank=True, null=True)

   description = models.CharField(max_length=1000, default="None")

   def __str__(self):
      return self.zipfile.name.split('/')[-1]

   def get_name(self):
      return self.zipfile.name.split('/')[-1]

