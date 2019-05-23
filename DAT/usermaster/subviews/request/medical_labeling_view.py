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
	for phase in phases_name:
		p_data = getattr(dataset, phase)
		if p_data:
			phases[phase] = p_data.id

	response = []
	dcm_file_url = os.path.join(settings.DICOM_SERVER['BASE_URL'], 'instances', '{}', 'file')
	for instance in instances:
		for phase_name, phase_id in phases.items():
			
			if phase_id == instance.seri_id.id:
				response.append({
					'phase_name': phase_name,
					'instance_url': dcm_file_url.format(instance.instance_uid)
				})

	# serialize data
	return JsonResponse(data=response, safe=False)