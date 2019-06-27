from django.db  import models
from django.conf import settings

class MedicalDicomServerModel(models.Model):
    id = models.AutoField(primary_key=True)

    dicom_adapter_host = models.CharField(max_length=100, blank=True, null=True, verbose_name='Dicom Adapter Host')
    dicom_anno_tool_host = models.CharField(max_length=100, blank=True, null=True, verbose_name='Dicom Annotation Tool Host')
    dicom_host = models.CharField(max_length=100, blank=True, null=True, verbose_name='Dicom Server Host')
    
    def __str__(self):
        return self.dicom_anno_tool_host