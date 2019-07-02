import os
import requests
from adminmaster.datamanagement.submodels.medical_patient import MedicalPatientModel
from adminmaster.datamanagement.submodels.medical_instance import MedicalInstanceModel
from adminmaster.datamanagement.submodels.medical_dataset import MedicalDataSetModel
from adminmaster.datamanagement.submodels.labeldata import LabelDataModel
from medicalapi.serializers import *
from rest_framework import viewsets, renderers, response, pagination
from django.conf import settings
from django.http import JsonResponse
from adminmaster.dicom_api import DICOMRESTApi
from rest_framework.decorators import action


class MedicalPatientViewSet(viewsets.ModelViewSet):
    renderer_classes = (renderers.JSONRenderer, renderers.TemplateHTMLRenderer)
    queryset = MedicalPatientModel.objects.all()
    serializer_class = MedicalPatientSerializer

class MedicalInstanceViewSet(viewsets.ModelViewSet):
    renderer_classes = (renderers.JSONRenderer, renderers.TemplateHTMLRenderer)
    queryset = MedicalInstanceModel.objects.all()
    serializer_class = MedicalInstanceSerializer
    dicom_api = DICOMRESTApi(settings.DICOM_SERVER['BASE_URL'])

    def list(self, request):
        datasetid = request.query_params.get('datasetid', None)
        
        if not datasetid:
            page = self.paginate_queryset(self.queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            
            return response.Response({
                'results': self.get_serializer(self.queryset, many=True).data
            })

        instances = MedicalInstanceModel.objects.filter(dataset_id=datasetid).order_by('index_in_series')
        dataset = MedicalDataSetModel.objects.get(id=datasetid)
        phases_name = ['non_contrast_phase', 'arterial_phase', 'venous_phase', 'delay_phase']
        phases = {}
        response1 = {}

        for phase in phases_name:
            p_data = getattr(dataset, phase)
            response1[phase] = []
            if p_data:
                phases[phase] = (p_data.id, p_data.series_instance_uid)

        dcm_file_url = os.path.join(settings.DICOM_SERVER['BASE_URL'], 'instances', '{}', 'file')
        
        # support cornerstone viewport
        replace_str = None
        
        if 'http://' in dcm_file_url:
            replace_str = 'http'
        elif 'https://' in dcm_file_url:
            replace_str = 'https'
        
        if replace_str:
            dcm_file_url = dcm_file_url.replace(replace_str, 'dicomweb')
        dcm_file_url = dcm_file_url.replace(':8042', '/orthanc')
        
        print(phases)
        for instance in instances:
            for phase_name, phase_item in phases.items():
                phase_id, phase_uid = phase_item
                # get seri tag
                seri_tag = instance.seri_id.series_instance_uid
                
                # get instance tag
                inst_tag = instance.sop_instance_uid

                if phase_id == instance.seri_id.id:
                    predicted_liver_url = os.path.join(
                        settings.DICOM_ANALYSIS_SERVER['STORAGE_URL'],
                        seri_tag,
                        'liver',
                        'predict',
                        inst_tag + '.png'
                    )
                    
                    predicted_vessel_url  = predicted_liver_url.replace('liver', 'blood_vessel')
                    groundtruth_liver_url = predicted_liver_url.replace('predict', 'groundtruth')
                    groundtruth_vessel_url = groundtruth_liver_url.replace('liver', 'blood_vessel')
                    
                    response1[phase_name].append({
                            'slice_id': instance.index_in_series,
                            'url': dcm_file_url.format(instance.instance_uid),
                            'predicts': [
                                {
                                    'label': 'liver',
                                    'url': predicted_liver_url
                                },
                                {
                                    'label': 'blood_vessel',
                                    'url': predicted_vessel_url
                                }
                            ],
                            'groundtruths': [
                                {
                                    'label': 'liver',
                                    'url': groundtruth_liver_url
                                },
                                {
                                    'label': 'blood_vessel',
                                    'url': groundtruth_vessel_url
                                }
                            ]
                        })

        # serialize data
        
        return JsonResponse(data=response1, safe=False)
        # return self.get_paginated_response(response1)

class MedicalStudiesViewSet(viewsets.ModelViewSet):
    renderer_classes = (renderers.JSONRenderer, renderers.TemplateHTMLRenderer)
    queryset = MedicalStudiesModel.objects.all()
    serializer_class = MedicalStudiesSerializer

class MedicalSeriesViewSet(viewsets.ModelViewSet):
    renderer_classes = (renderers.JSONRenderer, renderers.TemplateHTMLRenderer)
    queryset = MedicalSeriesModel.objects.all()
    serializer_class = MedicalSeriesSerializer

class MedicalPredictedInstanceViewSet(viewsets.ModelViewSet):
    renderer_classes = (renderers.JSONRenderer, renderers.TemplateHTMLRenderer)
    queryset = MedicalPredictedInstanceModel.objects.all()
    serializer_class = MedicalPredictedInstanceSerializer

    @action(detail=False, method=['post'])
    def upload(self, request):
        pass

class LabelDataViewSet(viewsets.ModelViewSet):
    renderer_classes = (renderers.JSONRenderer, renderers.TemplateHTMLRenderer)
    queryset = LabelDataModel.objects.all()
    serializer_class = LabelDataSerializer