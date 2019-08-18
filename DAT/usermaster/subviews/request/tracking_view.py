from adminmaster.datamanagement.submodels.metadata import MetaDataModel
from adminmaster.datamanagement.submodels.boudingbox import BoundingBoxModel
from adminmaster.datamanagement.submodels.labeldata import LabelDataModel
from adminmaster.workspacemanagement.models import WorkSpaceUserModel
from adminmaster.workspacemanagement.models import UserSettingsModel
from django.http import JsonResponse
from django.conf import settings
from usermaster.subviews.request.querymeta import query_meta, query_meta_reference
import json
import os
from apimodel.models import ApiReferenceModel
from PIL import Image, ImageFont, ImageDraw, ImageEnhance

def savenext_index(request, metaid):
	data = {}

	if request.method == 'POST':
	
		current_meta_data = MetaDataModel.objects.get(id=metaid)
		body_unicode = json.loads(request.body.decode('utf-8'))
		print(body_unicode)
		print(body_unicode['_tl'])
		dataset_id = current_meta_data.dataset.id
		user = request.user
	
		# for bb in current_meta_data.boxes_position.all():
		# 	# print('old: ', bb)
		# 	bb.delete()
		# #print(body_unicode)
		# for bb in body_unicode.split('\n')[:-1]:
		# 	bb = bb.split(',')
		# 	new_bb, created = BoundingBoxModel.objects.get_or_create(
		# 		label=LabelDataModel.objects.get(tag_label=bb[0], type_label=bb[1]),
		# 		flag=bb[2],
		# 		position=','.join(bb[3:]),
		# 	)
		# 	if created:
		# 		#created new -- 
		# 		current_meta_data.boxes_position.add(new_bb)
		# 	else:
		# 		#existed
		# 		print('existed\n', current_meta_data.boxes_position.all())
	
		# current_meta_data.submitted_by_user.add(user)
		# current_meta_data.is_annotated = 1
		# current_meta_data.is_notice_view = 0
		# current_meta_data.onviewing_user=None
	
		# current_meta_data.save(
		#     update_fields=['is_annotated', 'onviewing_user', 'is_notice_view'])
		
		# #here we will create thumbnail with drawing boxes to display
		# create_thumbnail(current_meta_data)

		# meta = get_query_meta_general(dataset_id, user)

		# #print('meta: ', meta)
		# if meta:
		# 	data = query_meta(meta)

	return JsonResponse(data=data)
