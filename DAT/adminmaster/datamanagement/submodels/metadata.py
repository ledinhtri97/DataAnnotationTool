from django.db import models
from adminmaster.datamanagement.models import DataSetModel
from simple_history.models import HistoricalRecords
from adminmaster.datamanagement.submodels.boudingbox import BoundingBoxModel
from django.conf import settings
import os
#meta data model {image}
class MetaDataModel(models.Model):
   
    dataset = models.ForeignKey(DataSetModel, on_delete=models.CASCADE)
   
    name = models.CharField(max_length=1000, verbose_name="File image name")

    full_path = models.CharField(max_length=1000, verbose_name="Path File")

    boxes_position = models.ManyToManyField(
        BoundingBoxModel, blank=True, related_name="boxes_position")

    is_annotated = models.BooleanField(
       default=False, verbose_name="is annotated?")

    is_allow_view = models.BooleanField(default=True, verbose_name="allow view?")
   
    is_notice_view = models.BooleanField(default=False, verbose_name="notice view?")

    is_reference_api = models.BooleanField(
        default=False, verbose_name="using reference api?")

    onviewing_user = models.OneToOneField(
       'auth.User', blank=True, null=True, verbose_name="User Viewing", on_delete=models.CASCADE)

    submitted_by_user = models.ManyToManyField('auth.User', blank=True, related_name="submitted_by_user")

    #field a.k.a skip file
    skipped_by_user = models.ManyToManyField('auth.User', blank=True, related_name="skipped_by_user")

    history = HistoricalRecords()

    def get_abs_origin(self):
        return os.path.relpath(
            os.path.join(self.full_path, self.name), 
            os.path.join(settings.BASE_DIR, settings.STORAGE_DIR))
   
    def get_full_origin(self):
        return os.path.join(self.full_path, self.name)

    def get_full_path__annotated_path(self):
        return 'fullpath/anno'
    
    def get_url_api(self):
        return '/gvlab-dat/workspace/metaview/{}/api-get-data/'.format(self.id)
    
    def get_url_meta(self):
        return "/gvlab-dat/dataset/{}".format(self.get_abs_origin())
    
    def __str__(self):
        return self.get_abs_origin()
