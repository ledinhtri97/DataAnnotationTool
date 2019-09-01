from adminmaster.datamanagement.submodels.metadata import MetaDataModel
from adminmaster.datamanagement.submodels.boudingbox import BoundingBoxModel
from adminmaster.datamanagement.submodels.labeldata import LabelDataModel
from adminmaster.workspacemanagement.models import WorkSpaceUserModel
from adminmaster.workspacemanagement.models import UserSettingsModel
from django.http import JsonResponse
from django.conf import settings
from .querymeta import query_meta, query_meta_reference, query_list_meta
import json
import os
from apimodel.models import ApiReferenceModel
from adminmaster.datamanagement.tasks import create_thumbnail, tracking_handle

def get_query_meta_general(dataset_id=None, user=None, type_labeling='de'):
	base_request = MetaDataModel.objects.filter(
        dataset_id=dataset_id, is_annotated=False, is_allow_view=True)
	if type_labeling == 'de':
		try:
			query_meta_data = base_request.filter(onviewing_user=user)
			if(query_meta_data.count() == 0):
				query_meta_data = base_request.filter(onviewing_user__isnull=True).exclude(
					skipped_by_user=user)
		except Exception as e:
			print(e)
			query_meta_data = base_request.filter(onviewing_user__isnull=True)
	elif type_labeling == 'tr':
		try:
			query_meta_data = base_request.filter(onviewing_user=user)
			if(query_meta_data.count() == 0):
				query_meta_data = base_request.filter(
					onviewing_user__isnull=True, is_head=1)
			if(query_meta_data.count() == 0):
				#merger time
				query_meta_data = base_request.filter(
						onviewing_user__isnull=True, is_tail_merger=1)
		except Exception as e:
			print('[ERROR] tracking mode: ', e)

	meta_data = query_meta_data.first()
	if (meta_data):
		handle_metadata_before_release(meta_data, user)
	
	return meta_data

def handle_metadata_before_release(meta_data, user):
	if(not meta_data.onviewing_user):
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
	type_labeling = current_meta_data.dataset.type_labeling
	user = request.user

	current_meta_data.onviewing_user=None
	current_meta_data.skipped_by_user.add(user)
	if(current_meta_data.skipped_by_user.count() == settings.NUM_USER_SKIP_AVAILABLE):
		current_meta_data.is_allow_view = False
		current_meta_data.save(update_fields=['is_allow_view'])
		
	current_meta_data.save(update_fields=['onviewing_user'])
	create_thumbnail.delay(metaid)
	meta = get_query_meta_general(dataset_id, user, type_labeling)
	
	if meta:
		data = query_meta(meta)

	print("next:", data)
	return JsonResponse(data=data)

def save_index(request, metaid):
	data = {}

	if request.method == 'POST':
		current_meta_data = MetaDataModel.objects.get(id=metaid)
		body_unicode = json.loads(request.body.decode('utf-8'))
		dataset_id = current_meta_data.dataset.id
		user = request.user
		for bb in current_meta_data.boxes_position.all():
			bb.delete()
		for bb in body_unicode['data']:
			new_bb, created = BoundingBoxModel.objects.get_or_create(
					label=LabelDataModel.objects.get(
						tag_label=bb['tag_label'], type_label=bb['type_label']),
					flag=bb['flag'], position=bb['position'])
			if created:
				current_meta_data.boxes_position.add(new_bb)
			else:
				print('existed\n', current_meta_data.id)


		current_meta_data.submitted_by_user.add(user)

		current_meta_data.skipped_by_user.remove(user)
		
		current_meta_data.is_annotated = 1
		current_meta_data.onviewing_user = None
		current_meta_data.is_notice_view = 0

		current_meta_data.save(
		    update_fields=['is_annotated', 'onviewing_user', 'is_notice_view'])

		#here we will create thumbnail with drawing boxes to display
		create_thumbnail.delay(metaid)

	return JsonResponse(data=data)

def savenext_v2index(request, metaid):
	data = {}
	if request.method == 'POST':
		current_meta_data = MetaDataModel.objects.get(id=metaid)
		body_unicode = json.loads(request.body.decode('utf-8'))
		dataset_id = current_meta_data.dataset.id
		type_labeling = current_meta_data.dataset.type_labeling
		user = request.user
		
		if type_labeling == 'de':
			for bb in current_meta_data.boxes_position.all():
				bb.delete()
			for bb in body_unicode['data']:
				new_bb, created = BoundingBoxModel.objects.get_or_create(
                        label=LabelDataModel.objects.get(
                        	tag_label=bb['tag_label'], type_label=bb['type_label']),
						flag=bb['flag'], position=bb['position'])
				if created:
					current_meta_data.boxes_position.add(new_bb)
				else:
					print('existed\n', current_meta_data.id)
			
			current_meta_data.submitted_by_user.add(user)
			current_meta_data.is_annotated=1
			current_meta_data.is_notice_view=0
			current_meta_data.onviewing_user=None
			current_meta_data.save(update_fields=['is_annotated', 'onviewing_user', 'is_notice_view'])
			create_thumbnail.delay(metaid)

			meta = get_query_meta_general(dataset_id, user, type_labeling)
			if meta:
				data = query_meta(meta)

		elif type_labeling == 'tr':
			for id_meta in body_unicode:
				try:
					cur_meta = MetaDataModel.objects.get(id=id_meta)
				except Exception as e:
					continue
				
				tracking_handle.delay(id_meta, body_unicode[id_meta])
				
				cur_meta.submitted_by_user.add(user)
				cur_meta.is_annotated = 0 if (current_meta_data.is_head and cur_meta.is_tail_merger) else 1
				cur_meta.is_notice_view = 0
				cur_meta.onviewing_user = None
				cur_meta.save(
			    	update_fields=['is_annotated', 'onviewing_user', 'is_notice_view'])
			
			meta = get_query_meta_general(dataset_id, user, type_labeling)
			if meta:
				data = query_list_meta(meta)
	
	try:
		metadatas = MetaDataModel.objects.filter(dataset=dataset_id)
		data['annotated_number'] = metadatas.filter(submitted_by_user=user).count()
	except Exception as e:
		print(e)
		data['annotated_number'] = '...'

	return JsonResponse(data=data)

# def savenext_index(request, metaid):
# 	data = {}
# 	if request.method == 'POST':
# 		current_meta_data = MetaDataModel.objects.get(id=metaid)
# 		body_unicode = request.body.decode('utf-8')
# 		#body_unicode = json.loads(request.body.decode('utf-8'))
# 		dataset_id = current_meta_data.dataset.id
# 		type_labeling = current_meta_data.dataset.type_labeling
# 		user = request.user
# 		for bb in current_meta_data.boxes_position.all():
# 			# print('old: ', bb)
# 			bb.delete()
# 		#print(body_unicode)
# 		for bb in body_unicode.split('\n')[:-1]:
# 			bb = bb.split(',')
# 			new_bb, created = BoundingBoxModel.objects.get_or_create(
# 				label=LabelDataModel.objects.get(tag_label=bb[0], type_label=bb[1]),
# 				flag=bb[2],
# 				position=','.join(bb[3:]),
# 			)
# 			if created:
# 				#created new -- 
# 				current_meta_data.boxes_position.add(new_bb)
# 			else:
# 				#existed
# 				print('existed\n', current_meta_data.boxes_position.all())
# 		current_meta_data.submitted_by_user.add(user)
# 		current_meta_data.is_annotated = 1
# 		current_meta_data.is_notice_view = 0
# 		current_meta_data.onviewing_user=None
# 		current_meta_data.save(
# 		    update_fields=['is_annotated', 'onviewing_user', 'is_notice_view'])
# 		#here we will create thumbnail with drawing boxes to display
# 		create_thumbnail.delay(metaid)
# 		meta = get_query_meta_general(dataset_id, user, type_labeling)
# 		#print('meta: ', meta)
# 		if meta:
# 			data = query_meta(meta)
# 	return JsonResponse(data=data)
	
def api_reference_index(request, metaid):
	meta = MetaDataModel.objects.get(id=metaid)
	workspace = WorkSpaceUserModel.objects.get(dataset=meta.dataset)
	api = ApiReferenceModel.objects.all()
	data = query_meta_reference(meta, workspace.api_reference)
	return JsonResponse(data=data)

def outws_index(request, metaid):
	current_meta_data = MetaDataModel.objects.get(id=metaid)
	#print("==============>", request.user == current_meta_data.onviewing_user)
	if(request.user == current_meta_data.onviewing_user):
		current_meta_data.onviewing_user =  None
		current_meta_data.save(update_fields=['onviewing_user'])
	return JsonResponse(data={})

def get_data_settings(request):
    data = {}
    try:
        setts = UserSettingsModel.objects.get(user=request.user)
        data = json.loads(setts.settings)
    except Exception as e:
        data['Error'] = 'Data is not available'
        data['Messenger'] = str(e)

    return JsonResponse(data=data)

def saveseting_index(request):
    if request.method == 'POST':
        try:

            __body__ = json.loads(request.body.decode('utf-8'))

            setts = UserSettingsModel.objects.filter(user=request.user).first()
            setts.settings = json.dumps(__body__['sett'])
            print(setts.settings)
            setts.save(update_fields=['settings'])

        except Exception as e:
            print(e)

    return JsonResponse({})
