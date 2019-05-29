import os

from django.conf import settings
from django.http import JsonResponse
from .querymeta import query_meta, query_meta_reference
from apimodel.models import ApiReferenceModel
from adminmaster.datamanagement.submodels.boudingbox import BoundingBoxModel
from adminmaster.datamanagement.submodels.labeldata import LabelDataModel
from adminmaster.datamanagement.submodels.medical_dataset import MedicalDataSetModel
from adminmaster.datamanagement.submodels.medical_instance import MedicalInstanceModel


# Should use REST here for clean code
def get_list_instance(request, datasetid):
    instances = MedicalInstanceModel.objects.filter(dataset_id=datasetid)
    dataset = MedicalDataSetModel.objects.get(id=datasetid)
    phases_name = ['non_contrast_phase', 'arterial_phase', 'venous_phase', 'delay_phase']
    phases = {}
    response = {}

    for phase in phases_name:
        p_data = getattr(dataset, phase)
        response[phase] = []
        if p_data:
            phases[phase] = p_data.id

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
    
    for instance in instances:
        for phase_name, phase_id in phases.items():
            
            if phase_id == instance.seri_id.id:
                response[phase_name].append(dcm_file_url.format(instance.instance_uid))

    # serialize data
    return JsonResponse(data=response, safe=False)

def get_query_meta_general(dataset_id=None, user=None):
    base_request = MedicalInstanceModel.objects.filter(
        dataset_id=dataset_id, is_annotated=False, is_allow_view=True
    )

    try:
        query_meta_data = base_request.filter(onviewing_user=user)
        #print("try: ", query_meta_data)
        if(query_meta_data.count() == 0):
              query_meta_data = base_request.exclude(skipped_by_user=user)

          #print("try-again: ", query_meta_data, '\n', query_meta_data.first())

    except Exception as e:
        print(e)
        query_meta_data = base_request.filter(onviewing_user__isnull=True)
        #print("except: ", query_meta_data)

    meta_data = query_meta_data.first()

    if (meta_data):
        handle_metadata_before_release(meta_data, user)

    return meta_data

def handle_metadata_before_release(meta_data, user):
  
  if(not meta_data.onviewing_user):
    #print("no one view, now add", user)
    try:
      meta_data.onviewing_user = user
      meta_data.save(update_fields=['onviewing_user'])
    except:
      meta_orther = MetaDataModel.objects.get(onviewing_user=user)
      meta_orther.onviewing_user = None
      meta_orther.save(update_fields=['onviewing_user'])
      
      meta_data.onviewing_user = user
      meta_data.save(update_fields=['onviewing_user'])

  else:
    print(user, " is on viewing")
