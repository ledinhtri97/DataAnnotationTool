from adminmaster.datamanagement.submodels.metadata import MetaDataModel
from adminmaster.datamanagement.submodels.boudingbox import BoundingBoxModel
from adminmaster.datamanagement.submodels.labeldata import LabelDataModel
from adminmaster.workspacemanagement.models import WorkSpaceUserModel
from adminmaster.workspacemanagement.models import UserSettingsModel
from django.http import JsonResponse
from django.conf import settings
from .querymeta import query_meta, query_meta_reference
import json
import os
from apimodel.models import ApiReferenceModel
from PIL import Image, ImageFont, ImageDraw, ImageEnhance

def create_thumbnail(meta):
	thumb_height = 100

	path_mt = meta.get_full_origin()
	file, ext = os.path.splitext(path_mt)
	thumb = file.replace('storage_data', 'thumbnail')

	im = Image.open(path_mt)
	draw = ImageDraw.Draw(im)
	for bb in meta.boxes_position.all():
		positions = bb.position.split(',')
		if(len(positions)==4):
			draw.rectangle(
				(
                    (float(positions[0])*im.size[0], float(positions[1])*im.size[1]),
                    (float(positions[2])*im.size[0], float(positions[3])*im.size[1])),
					outline=bb.label.color
				)
		else:
			poly = []
			for i in range(0, len(positions), 2):
				poly.append((float(positions[i])*im.size[0], float(positions[i+1])*im.size[1]))
			
			draw.polygon(poly, outline=bb.label.color)
	del draw
	im.thumbnail((im.size[0]*thumb_height/im.size[1], thumb_height), Image.ANTIALIAS)

	try:
		folder = os.path.dirname(thumb)
		os.makedirs(folder)
	except FileExistsError:
		print("Directory ", folder,  " already exists")
	if im.mode in ('RGBA', 'LA', 'P'):
		im = im.convert("RGB")
		im.save(thumb + ".thumbnail", "PNG")
	else:
		im.save(thumb + ".thumbnail", "JPEG")


def get_query_meta_general(dataset_id=None, user=None):
	base_request = MetaDataModel.objects.filter(
            dataset_id=dataset_id, is_annotated=False, is_allow_view=True)

	try:
		query_meta_data = base_request.filter(onviewing_user=user)
		# print("try: ", query_meta_data)
		if(query_meta_data.count() == 0):
			# print('a', query_meta_data)
			query_meta_data = base_request.filter(onviewing_user__isnull=True).exclude(
				skipped_by_user=user)

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

	print("next:", data)
	return JsonResponse(data=data)


def save_index(request, metaid):
	data = {}

	if request.method == 'POST':

		current_meta_data = MetaDataModel.objects.get(id=metaid)
		body_unicode = request.body.decode('utf-8')
		dataset_id = current_meta_data.dataset.id
		user = request.user

		for bb in current_meta_data.boxes_position.all():
			print('old: ', bb)
			bb.delete()
			print('new: ', bb)
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

		current_meta_data.skipped_by_user.remove(user)
		
		current_meta_data.is_annotated = 1

		current_meta_data.save(update_fields=['is_annotated', 'onviewing_user'])

		#here we will create thumbnail with drawing boxes to display
		create_thumbnail(current_meta_data)

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
		
		#here we will create thumbnail with drawing boxes to display
		create_thumbnail(current_meta_data)

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
