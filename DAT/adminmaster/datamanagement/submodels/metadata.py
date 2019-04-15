from django.db import models
from adminmaster.datamanagement.models import DataSetModel
from django.conf import settings
import os
#meta data model {image}
class MetaDataModel(models.Model):
   
   dataset = models.ForeignKey(DataSetModel, on_delete=models.CASCADE)
   
   name = models.CharField(max_length=1000, verbose_name="File image name")

   full_path = models.CharField(max_length=1000, verbose_name="Path File")
   
   # title = models.CharField(max_length=100, verbose_name="Title")
   
   boxes_position = models.TextField(verbose_name="Bounding boxes", blank=True, null=True)  # {(xmin, ymin, xmax, ymax),(..), ...}
   
   extfile = models.CharField(max_length=100, default = 'jpg', verbose_name="Extend File image")

   is_annotated = models.BooleanField(default=False, verbose_name="Check data whether is annotated or not")

   is_onworking = models.BooleanField(default=False, verbose_name="File image is on busy or not")

   is_badmeta = models.BooleanField(default=False, verbose_name="File image is bad or not")

   onviewing_user = models.CharField(max_length=1000, default='', blank=True, null=True ,verbose_name="User Viewing")

   annotated_by_user = models.ManyToManyField('auth.User', blank=True, related_name="annotated_by_user")

   viewed_by_user = models.ManyToManyField('auth.User', blank=True, related_name="viewed_by_user")

   def get_abs_origin(self):
      folder_path = '/'.join(self.full_path.split('/')[1:])
      return os.path.join(folder_path, self.name+'.'+self.extfile)
   
   def get_full_origin(self):
      return os.path.join(settings.BASE_DIR, settings.STORAGE_DIR, self.full_path, self.name+'.'+self.extfile)

   def get_full_path__annotated_path(self):
      return 'fullpath/anno'
   
   def __str__(self):
      return self.name
