from django.db  import models
from simple_history.models import HistoricalRecords
from django.core.validators import FileExtensionValidator
from django.conf import settings
import os

def user_upload_directory_path(instance, filename):
    return os.path.join(settings.UPLOAD_DIR, 'user_{0}_{1}/{2}'.format(
       instance.owner.id, instance.owner.username, filename))

def user_output_directory_path(instance, filename):
    return os.path.join(settings.OUTPUT_DIR, 'user_{0}_{1}/{2}'.format(
       instance.owner.id, instance.owner.username, filename))

class InputDataModel(models.Model):

   TYPE_DATA_VALIDATION = ['zip', 'rar', 'mp4', 'avi', 'gif', 'jpg', 'png', 'JPG', 'PNG', 'JPEG']

   id = models.AutoField(primary_key=True)

   zipfile = models.FileField(upload_to=user_upload_directory_path,
         validators=[FileExtensionValidator(
             allowed_extensions=TYPE_DATA_VALIDATION)]
   )

   groundtruth = models.FileField(upload_to=user_output_directory_path, 
         blank=True, null=True,
         validators=[FileExtensionValidator(
             allowed_extensions=TYPE_DATA_VALIDATION[:2])]
   )

   useful = models.BooleanField(default=False, verbose_name="Usefull data")

   history = HistoricalRecords()

   owner = models.ForeignKey('auth.User', 
      on_delete=models.CASCADE)

   description = models.CharField(max_length=1000, default="None")

   def __str__(self):
      return self.zipfile.name.split('/')[-1]

   def get_zipname(self):
      return self.zipfile.name.split('/')[-1]
   
   def get_full_path_file(self):
      return os.path.join(settings.BASE_DIR, settings.UPLOAD_DIR, self.get_zipname())

   def get_gtname(self):
      # return (groundtruth)
      print(self.groundtruth)
      if (self.groundtruth):
         # print("have base groundtruth")
         return self.groundtruth.name.split('/')[-1] 
      else:
         # print("no base groundtruth")
         return None

