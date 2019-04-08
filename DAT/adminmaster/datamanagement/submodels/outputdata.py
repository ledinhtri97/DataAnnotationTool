from django.db import models
import os
from simple_history.models import HistoricalRecords
from .dataset import DataSetModel
from django.conf import settings
from django.utils.html import format_html
import django.utils.safestring as safestring

class OutputDataModel(models.Model):

    CSV = 'CSV'
    VOC = 'VOC'

    TYPE_GROUNDTRUTH_CHOICES = (
        (CSV, 'CSV Format'),
        (VOC, 'VOC Format'),
    )

    name = models.CharField(max_length=100, default="Groundtruth Data")
    
    data_set = models.OneToOneField(
        DataSetModel, on_delete=models.CASCADE)

    type_groundtruth = models.CharField(
        max_length=10,
        choices=TYPE_GROUNDTRUTH_CHOICES,
        default=CSV,
    )

    file_path = models.CharField(
        max_length=1000, default=settings.OUTPUT_DIR, verbose_name="Path folder (should not be change")

    history = HistoricalRecords()

    owner = models.ForeignKey('auth.User', on_delete=models.CASCADE, blank=True, null=True)

    description = models.CharField(max_length=100, default="None")
    
    def download(self):
        file_name = self.type_groundtruth+".zip"
        return format_html('<a href="/export-groundtruth/{}/{}">Download {}</a>',
            str(self.data_set),
            file_name,
            self.type_groundtruth)

    download.admin_order_field = 'name'

    def get_save_file(self):
        return os.path.join(self.file_path, self.data_set.get_dir_path(), str(self.data_set))

    def __str__(self):
        return self.name
    

