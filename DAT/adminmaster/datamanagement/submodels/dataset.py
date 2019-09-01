from django.db import models
from django.conf import settings
import os
from .inputdata import InputDataModel
from .labeldata import LabelDataModel
from django.utils.html import format_html

class DataSetModel(models.Model):
    DETECTING = "de"
    TRACKING = "tr"
    CLASSIFICATION = "cl"
    TYPE_LABELING_CHOICES = (
        (DETECTING, 'Detecting'),
        (TRACKING, 'Tracking'),
        (CLASSIFICATION, 'Classification'),
    )

    id = models.AutoField(primary_key=True)

    type_labeling = models.CharField(
        max_length=50,
        choices=TYPE_LABELING_CHOICES,
        default=DETECTING,
    )

    name = models.CharField(max_length=100, default='dataset name', blank=True,verbose_name="Name of data set")

    input_file = models.ManyToManyField(InputDataModel, blank=True)

    num_fps = models.IntegerField(default=5, blank=True, verbose_name="Number Frame per second")

    dir_path = models.CharField(max_length=200, 
        default=settings.STORAGE_DIR,
        verbose_name="Path folder (should not be change)"
    )

    labels = models.ManyToManyField(LabelDataModel, blank=True)

    def import_groundtruth(self):
        return format_html('<a href="/gvlab-dat/datadmin/dataman/import-groudtruth/ds-{}/">Import Groundtruth - {}</a>',
            str(self.id),
            str(self.name))

    import_groundtruth.admin_order_field = 'name'

    def get_dir_path(self):
        return os.path.join(str(self.id)) #../id/..

    def get_full_path(self):
        return os.path.join(settings.BASE_DIR, self.get_dir_path()) #/home/../id/..

    def __str__(self):
        return str(self.id) + "_" + self.name.replace(' ','_')
    
      
         

