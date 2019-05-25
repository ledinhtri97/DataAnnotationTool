from adminmaster.datamanagement.submodels.metadata import MetaDataModel
from adminmaster.datamanagement.submodels.boudingbox import BoundingBoxModel
from adminmaster.datamanagement.submodels.labeldata import LabelDataModel
from adminmaster.workspacemanagement.models import WorkSpaceUserModel
from django.http import JsonResponse
from django.conf import settings
from .querymeta import query_meta, query_meta_reference

from apimodel.models import ApiReferenceModel

def get_query_meta_general(dataset_id=None, user=None):
	base_request = MetaDataModel.objects.filter(
	dataset_id=dataset_id, is_annotated=False, is_allow_view=True)

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

def next_index(request, metaid):
	data = {}
	current_meta_data = MetaDataModel.objects.get(id=metaid)
	# print(metaid)
	#reuser code get query metadata from querymeta
	dataset_id = current_meta_data.dataset.id
	user = request.user

	current_meta_data.onviewing_user=None
	current_meta_data.skipped_by_user.add(user)
	if(current_meta_data.skipped_by_user.count() == settings.NUM_USER_SKIP_AVAILABLE):
		current_meta_data.is_allow_view = False
		current_meta_data.save(update_fields=['is_allow_view'])
		
		current_meta_data.save(update_fields=['onviewing_user'])
		#print(current_meta_data.skipped_by_user)
		meta = get_query_meta_general(dataset_id, user)
	
		if meta:
			data = query_meta(meta)

	return JsonResponse(data=data)

def savenext_index(request, metaid):
	data = {}

	if request.method == 'POST':
	
		current_meta_data = MetaDataModel.objects.get(id=metaid)
		body_unicode = request.body.decode('utf-8')
		dataset_id = current_meta_data.dataset.id
		user = request.user
	
		for bb in current_meta_data.boxes_position.all():
			print('old: ', bb)
			bb.delete()
		#print(body_unicode)
		for bb in body_unicode.split('\n')[:-1]:
			bb = bb.split(',')
			new_bb, created = BoundingBoxModel.objects.get_or_create(
				label=LabelDataModel.objects.get(tag_label=bb[0], type_label=bb[1]),
				flag=bb[2],
				position=','.join(bb[3:]),
			)
			if created:
				#created new -- 
				current_meta_data.boxes_position.add(new_bb)
			else:
				#existed
				print('existed\n', current_meta_data.boxes_position.all())
	
		current_meta_data.submitted_by_user.add(user)
		current_meta_data.is_annotated = 1
		current_meta_data.onviewing_user=None
	
		current_meta_data.save(update_fields=['is_annotated', 'onviewing_user'])
		
		meta = get_query_meta_general(dataset_id, user)

		#print('meta: ', meta)
		if meta:
			data = query_meta(meta)

	return JsonResponse(data=data)
	

def api_reference_index(request, metaid):
	meta = MetaDataModel.objects.get(id=metaid)
	workspace = WorkSpaceUserModel.objects.get(dataset=meta.dataset)
	api = ApiReferenceModel.objects.all()
	data = query_meta_reference(meta, workspace.api_reference)
	return JsonResponse(data=data)

def outws_index(request, metaid):
	current_meta_data = MetaDataModel.objects.get(id=metaid)
	current_meta_data.onviewing_user =  None
	current_meta_data.save(update_fields=['onviewing_user'])
	return JsonResponse(data={})
