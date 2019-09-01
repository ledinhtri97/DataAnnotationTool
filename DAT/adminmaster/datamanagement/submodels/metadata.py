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

    is_head = models.BooleanField(
        default=False, verbose_name="[tracking] is head meta?")
    
    is_tail_merger = models.BooleanField(
        default=False, verbose_name="[tracking] is tail_merger meta?")

    onviewing_user = models.OneToOneField(
       'auth.User', blank=True, null=True, verbose_name="User Viewing", on_delete=models.CASCADE)

    submitted_by_user = models.ManyToManyField('auth.User', blank=True, related_name="submitted_by_user")

    #field a.k.a skip file
    skipped_by_user = models.ManyToManyField('auth.User', blank=True, related_name="skipped_by_user")

    history = HistoricalRecords()

    def get_submitted_by_user(self):
        return ', '.join([user.username for user in self.submitted_by_user.all()])
    
    def get_skip_by_user(self):
        return ', '.join([user.username for user in self.skipped_by_user.all()])

    def get_rel_path(self):
        return os.path.relpath(
            os.path.join(self.full_path, self.name), 
            os.path.join(settings.BASE_DIR, settings.STORAGE_DIR))
   
    def get_full_origin(self):
        return os.path.join(self.full_path, self.name)

    def get_thumbnail_path(self):
        file, ext = os.path.splitext(self.get_full_origin())
        thumb = file.replace('storage_data', 'thumbnail') + ".thumbnail"

        return os.path.relpath(
            os.path.join(thumb),
            os.path.join(settings.BASE_DIR, settings.THUMBNAIL_DIR))
    
    def get_url_api(self):
        return '/gvlab-dat/workspace/metaview/{}/api-get-data/'.format(self.id)
    
    def get_url_meta(self):
        return "/gvlab-dat/dataset/{}".format(self.get_rel_path()).replace('\\', '/')
    
    def get_url_thumbnail(self):
        return "/gvlab-dat/imagethumb/{}".format(self.get_thumbnail_path()).replace('\\', '/')
    
    def get_url_accept(self):
        return "/gvlab-dat/datadmin/dataman/flagfalse-accept/mt-{}".format(self.id)

    def __str__(self):
        return self.get_rel_path()
