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
from .submodels.medical_studies import MedicalStudiesModel
from .submodels.medical_phase import MedicalPhaseModel
from .submodels.medical_instance import MedicalInstanceModel
from .submodels.medical_studies import MedicalStudiesModel
import os
import shutil
from django.conf import settings
import django.utils.safestring as safestring

import requests
import base64
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
        self.dicomApi = DICOMRESTApi(settings.DICOM_SERVER['BASE_URL'],
                                     settings.DICOM_SERVER['USERNAME'],
                                     settings.DICOM_SERVER['PASSWORD'])

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
            
            for idx, filename in enumerate(glob(os.path.join(dir_path, '**/*'), recursive=True)):
                if os.path.isfile(filename) and not filename.endswith('jpg') and not filename.endswith('VERSION') and not filename.endswith('DICOMDIR'):
                    response = self.dicomApi.send_dicom_file(filename)

            shutil.rmtree(obj.get_output_path(), ignore_errors=True)

            self._create_patients()

        return result

    def _create_patients(self):
        local_patients = MedicalPatientModel.objects.all()
        
        # compare 2 list ids of patients
        local_patients_ids = [p.patient_uid for p in local_patients]
        remote_patient_ids = self.dicomApi.get_patients()        

        for ind, remote_patient_id in enumerate(remote_patient_ids):
            remote_patient = self.dicomApi.get_patient(remote_patient_id)

            if True:
                # create local patients
                patient, is_created = MedicalPatientModel.objects.get_or_create({
                    'patient_name': remote_patient['MainDicomTags']['PatientName'],
                    'patient_birthdate': remote_patient['MainDicomTags']['PatientBirthDate'],
                    'patient_sex': remote_patient['MainDicomTags']['PatientSex'],
                    'patient_uid': remote_patient['MainDicomTags']['PatientID']
                })

                # create studies
                for remote_study_id in remote_patient['Studies']:
                    remote_study = self.dicomApi.get_study(remote_study_id)
                    study, is_created = MedicalStudiesModel.objects.get_or_create({
                        'studies_uid': remote_study_id,
                        'studies_last_update': remote_study['LastUpdate'],
                        'patient_id': patient
                    })

                    # create series
                    for remote_seri_id in remote_study['Series']:
                        remote_seri = self.dicomApi.get_seri(remote_seri_id)
                        
                        phase = MedicalPhaseModel.objects.get(phase_name=remote_seri['MainDicomTags']['SeriesDescription'])
                        seri, is_created = MedicalSeriesModel.objects.get_or_create({
                            'series_name': remote_seri['MainDicomTags']['SeriesDescription'],
                            'series_instance_uid': remote_seri['ID'],
                            'studies_id': study,
                            'series_instance_number': remote_seri['MainDicomTags']['SeriesNumber'],
                            'phase_id': phase
                        })

                        # create instance
                        for remote_instance_id in remote_seri['Instances']:
                            remote_instance = self.dicomApi.get_instance(remote_instance_id)
                            instance, is_created = MedicalInstanceModel.objects.get_or_create({
                                'index_in_series': remote_instance['IndexInSeries'],
                                'instance_uid': remote_instance['ID'],
                                'seri_id': seri
                            })

            else:
                local_patient = local_patients[ind]
                local_studies = MedicalStudiesModel.objects.select_related('patient_id')
                remote_studies = self.dicomApi.get_studies()
                remote_study_ids = [s['']]
                print('Implement later')
                # for remote_study in remote_studies:
                #     if remote_study not in local_studies:
                #         remote


class DICOMRESTApi():
    def __init__(self, url, username='orthanc', password='orthanc'):
        self.url = url
        self.headers = {}
        token = username + ':' + password
        self.headers['authorization'] = 'Basic ' + base64.b64encode(token.encode('utf-8')).decode()

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

    def send_dicom_file(self, filename):
        return requests.post(self.url, files=[('file', open(filename, 'rb'))], headers=self.headers, verify=False)    

    def get_study(self, id):
        study = None
        req = requests.get(os.path.join(self.url, 'studies', id))
        if req.status_code == 200:
            study = req.json()

        return study

    def get_studies(self):
        studies = []
        req = requests.get(os.path.join(self.url, 'studies'))
        if req.status_code == 200:
            studies = req.json()

        return studies
    
    def get_seri(self, id):
        seri = None
        req = requests.get(os.path.join(self.url, 'series', id))
        if req.status_code == 200:
            seri = req.json()

        return seri

    def get_instance(self, id):
        instance = None
        req = requests.get(os.path.join(self.url, 'instances', id))
        if req.status_code == 200:
            instance = req.json()

        return instance

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
    readonly_fields = ('patient_name', 'patient_sex', 'patient_birthdate', 'patient_uid')    
    list_display = ('__str__',)
    save_on_top = True
    
class MedicalSeriesModelAdmin(admin.ModelAdmin):
    list_display = ('__str__',)
    save_on_top = True

class MedicalPhaseModelAdmin(admin.ModelAdmin):
    list_display = ('__str__',)
    save_on_top = True

class MedicalInstanceModelAdmin(admin.ModelAdmin):
    list_display = ('__str__',)
    save_on_top = True

class MedicalStudiesModelAdmin(admin.ModelAdmin):
    list_display = ('__str__',)
    save_on_top = True

# Register your models here.
admin.site.register(DataSetModel, DataSetAdmin)
admin.site.register(InputDataModel, InputDataAdmin)
admin.site.register(LabelDataModel, LabelDataAdmin)
admin.site.register(BoundingBoxModel)
admin.site.register(MetaDataModel)
admin.site.register(OutputDataModel, OutputDataAdmin)
admin.site.register(MedicalPatientModel, MedicalPatientModelAdmin)
admin.site.register(MedicalSeriesModel, MedicalSeriesModelAdmin)
admin.site.register(MedicalPhaseModel, MedicalPhaseModelAdmin)
admin.site.register(MedicalInstanceModel, MedicalInstanceModelAdmin)
admin.site.register(MedicalStudiesModel, MedicalStudiesModelAdmin)