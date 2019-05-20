from django.contrib import admin
from django import forms
from .models import DataSetModel
from .submodels.metadata import MetaDataModel
from .submodels.inputdata import InputDataModel
from .submodels.outputdata import OutputDataModel
from .submodels.labeldata import LabelDataModel
from .submodels.boudingbox import BoundingBoxModel
from .submodels.utils.ziprar import ZipRarExtractor
from .submodels.utils.scanmeta import ScanMetaToDatabase
from .submodels.utils.groundtruth import GroundTruther
from .submodels.medical_patient import MedicalPatientModel
from .submodels.medical_series import MedicalSeriesModel
import os
import shutil
from django.conf import settings
import django.utils.safestring as safestring

import requests
from glob import glob


class DataSetForm(forms.ModelForm):
    class Meta:
        model = DataSetModel
        fields = '__all__'
    
    def extract_zip(self, instance_dataset):
        """
            Need to extract file zip
        """
        zipRarer = ZipRarExtractor(self.cleaned_data['input_file'])
        zipRarer.do_extract_all()
        """End of extract, Done!"""

        

    def scanner_database(self, instance_dataset):
        """
            Scanfile was extracted and add to database relationship
        """
        scanner = ScanMetaToDatabase(
            instance_dataset, self.cleaned_data['input_file'])
        scanner.scan_all_into_database()
        """End of scan, Done!!"""
    
    def check_change_filezip(self, old, new):
        if old.count() != new.count():
            return True
        else:
            names_of_new = [i.get_zipname() for i in new]
            for i in old:
                if (not i.get_zipname() in names_of_new):
                    return True
            return False
    
    def save(self, commit=True):
        instance_dataset = super(DataSetForm, self).save(commit=False)
        instance_dataset.save()
        if instance_dataset.id is None:
            self.extract_zip(instance_dataset)
            self.scanner_database(instance_dataset)
        else:
            data = DataSetModel.objects.filter(id=instance_dataset.id).first()
            if (self.check_change_filezip(data.input_file.all(), self.cleaned_data['input_file'])):
                print("has change")
                self.extract_zip(instance_dataset)
                self.scanner_database(instance_dataset)
 
        if(commit):
            instance_dataset.save()

        return instance_dataset

class DataSetAdmin(admin.ModelAdmin):
    #class Meta will not accept this form custom > find out why
    form = DataSetForm

    readonly_fields = ['id', 'dir_path']  # , 'dir_path'

    fieldsets = [
        (None, 
                {
                    'fields': ['name']
                }
        ),
        ('Settings Field',
                {
                     'fields': ['input_file', 'labels']
                }
        ),
        ('More Information',
                {
                    'fields': ['id', 'dir_path']
                }
        ),
    ]

class InputDataAdmin(admin.ModelAdmin):
    change_form_template = 'progressbarupload/change_form.html'
    add_form_template = 'progressbarupload/change_form.html'

    def __init__(self, *args, **kwargs):
        super(InputDataAdmin, self).__init__(*args, **kwargs)
        orthanc_url = 'https://172.28.183.160:10001/orthanc/instances/'  #### HARD CODE
        self.dicomApi = DICOMRESTApi(orthanc_url)

    def save(self, commit=True):
        instance_output = super(OutputDataForm, self).save(commit=False)
        # instance_output.save()
        
        self.compress_zip(self.scanner_meta_annotated(instance_output))

        if(not commit):
            instance_output.save()
        return instance_output  

    # readonly_fields = ['owner', 'description', 'zipfile']

    def save_model(self, request, obj, form, change):
        result = super(InputDataAdmin, self).save_model(request, obj, form, change)
        if obj.is_medical:
            zipRarer = ZipRarExtractor(obj)
            zipRarer.do_extract_all()

            dir_path = obj.get_output_path()
            headers = {
                'authorization': "Basic b3J0aGFuYzpvcnRoYW5j",
                'cache-control': "no-cache",
                'postman-token': "ec4b1786-44e2-eaf3-07db-35e849d18fb2"
            }
            orthanc_url = 'https://172.28.183.160:10001/orthanc/instances/'  #### HARD CODE
            for idx, filename in enumerate(glob(os.path.join(dir_path, '**/*'), recursive=True)):
                if os.path.isfile(filename) and not filename.endswith('jpg') and not filename.endswith('VERSION') and not filename.endswith('DICOMDIR'):
                    response = requests.request("POST", orthanc_url, files=[('file', open(filename, 'rb'))], headers=headers, verify=False)    

            shutil.rmtree(obj.get_output_path(), ignore_errors=True)

            # get patient from dicom server
            patients = dicomApi.get_patients()
            # create patient
            series_1, is_created_1 = MedicalSeriesModel.objects.get_or_create(
                {
                    'series_name': 'Arterial Phase 1.0 B30f',
                    'series_instance_uid': 'saesfsadfas',
                    'patient_id': patient
                }
            )
            series_2, is_created_2 = MedicalSeriesModel.objects.get_or_create(
                {
                    'series_name': 'Delay Phase 1.0 B30f',
                    'series_instance_uid': 'fsdfsdfrsdf',
                    'patient_id': patient
                }
            )

        return result

    def _filter_patients(self):
        local_patients = MedicalSeriesModel.objects.all()
        remote_patients = self.dicomApi.get_patients()

        for remote_patient in remote_patients:
            if not remote_patient in local_patients:
                remote_patient = self.get_patient(remote_patient)

                # create local patients
                patient, is_created = MedicalPatientModel.objects.get_or_create({
                    'patient_name': remote_patient['PatientName'],
                    'patient_birthdate': remote_patient['PatientBirthDate'],
                    'patient_sex': remote_patient['PatientSex'],
                    'patient_uid': remote_patient['PatientID']
                })


class DICOMRESTApi():
    def __init__(self, url):
        self.url = url

    def get_patients(self):
        patients = []
        req = requests.get(os.path.join(self.url, 'patients'))
        if req.status_code == 200:
            patients = req.json()

        return patients

    def get_patient(self, id):
        patient = None
        req = requests.get(os.path.join(self.url, 'patients', id))
        if req.status_code == 200:
            patient = req.json()

        return patient


class OutputDataForm(forms.ModelForm):
    class Meta:
        model = OutputDataModel
        fields = '__all__'

    def compress_zip(self, path_file_export):
        shutil.make_archive(path_file_export, 'zip', path_file_export)

    def scanner_meta_annotated(self, instance_output):
        query_meta = MetaDataModel.objects.filter(
            dataset=instance_output.data_set,
            is_annotated=1
        )
        groundTruther = GroundTruther(instance_output, query_meta)
        return groundTruther.run()


    def save(self, commit=True):
        instance_output = super(OutputDataForm, self).save(commit=False)
        # instance_output.save()
        
        self.compress_zip(self.scanner_meta_annotated(instance_output))

        if(not commit):
            instance_output.save()

        return instance_output  

class OutputDataAdmin(admin.ModelAdmin):
    #class Meta will not accept this form custom > find out why

    list_display = ('name', 'download',)
    readonly_fields = ['id', 'file_path']

    fieldsets = [
        (None, 
                {
                    'fields': ['name']
                }
        ),
        ('Settings Field',
                {
                     'fields': ['data_set', 'type_groundtruth', 'description']
                }
        ),
        ('More Information',
                {
                    'fields': ['id', 'file_path']
                }
        ),
    ]

    form = OutputDataForm

    def get_readonly_fields(self, request, obj=None):
        if obj: # editing an existing object
            return self.readonly_fields + ['data_set',]
        return self.readonly_fields


class LabelDataForm(forms.ModelForm):
    class Meta:
        model = LabelDataModel
        fields = '__all__'

    def save(self, commit=True):
        instance_label = super(LabelDataForm, self).save(commit=False)
        instance_label.tag_label = self.cleaned_data['tag_label'].replace(' ', '_')
        if(not commit):
            instance_label.save()
        return instance_label


class LabelDataAdmin(admin.ModelAdmin):
    #class Meta will not accept this form custom > find out why

    fieldsets = [
         (None,
          {
                'fields': ['tag_label']
          }
          ),
         ('Settings Field',
              {
                    'fields': ['type_label', 'color', ]
              }
          ),
         ('More Information',
              {
                    'fields': ['description',]
              }
          ),
    ]

    form = LabelDataForm

class MedicalPatientModelAdmin(admin.ModelAdmin):
    # readonly_fields = ('path', 'number_of_attributes', 'owner')    
    list_display = ('__str__',)
    # search_fields = ['path']
    # change_list_template = "admin/obj_labeling/ImageSet/change_list.html"
    # form = ImageSetForm
    #filter_horizontal = ('labels', 'attributes', 'inputzip_ids', 'labeled_by',)
    # filter_horizontal = ('series_id',)
    # actions = ['export_groundtruth_voc_pascal', 'export_groundtruth_custom_txt']
    save_on_top = True
    """inlines = [
        ImageInline
    ]"""
    # list_filter = ['owner', ]

class MedicalSeriesModelAdmin(admin.ModelAdmin):
    # readonly_fields = ('path', 'number_of_attributes', 'owner')    
    list_display = ('__str__',)
    # search_fields = ['path']
    # change_list_template = "admin/obj_labeling/ImageSet/change_list.html"
    # form = ImageSetForm
    #filter_horizontal = ('labels', 'attributes', 'inputzip_ids', 'labeled_by',)
    # filter_horizontal = ('series_instance_uid')
    # actions = ['export_groundtruth_voc_pascal', 'export_groundtruth_custom_txt']
    save_on_top = True
    """inlines = [
        ImageInline
    ]"""
    # list_filter = ['owner', ]


# Register your models here.
admin.site.register(DataSetModel, DataSetAdmin)
admin.site.register(InputDataModel, InputDataAdmin)
admin.site.register(LabelDataModel, LabelDataAdmin)
admin.site.register(BoundingBoxModel)
admin.site.register(MetaDataModel)
admin.site.register(OutputDataModel, OutputDataAdmin)
admin.site.register(MedicalPatientModel, MedicalPatientModelAdmin)
admin.site.register(MedicalSeriesModel, MedicalSeriesModelAdmin)