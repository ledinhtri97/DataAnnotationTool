from django.db import models
from django.conf import settings
import os
from .inputdata import InputDataModel
from .labeldata import LabelDataModel
from django.utils.html import format_html

class DataSetModel(models.Model):

    id = models.AutoField(primary_key=True)

    name = models.CharField(max_length=100, default='dataset name', blank=True,verbose_name="Name of data set")

    input_file = models.ManyToManyField(InputDataModel, blank=True)

    dir_path = models.CharField(max_length=200, 
        default=settings.STORAGE_DIR,
        verbose_name="Path folder (should not be change)"
    )

    labels = models.ManyToManyField(LabelDataModel, blank=True)

    def create_thumbnail(self):
        return format_html('<a href="/gvlab-dat/datadmin/dataman/create-thumbnail/ds-{}/">Create Thumbnail - {}</a>',
            str(self.id),
            str(self.name))

    create_thumbnail.admin_order_field = 'name'

    def get_dir_path(self):
        return os.path.join(str(self.id)) #../id/..

    def get_full_path(self):
        return os.path.join(settings.BASE_DIR, self.get_dir_path()) #/home/../id/..

    def __str__(self):
        return str(self.id) + "_" + self.name.replace(' ','_')
    
      
         

