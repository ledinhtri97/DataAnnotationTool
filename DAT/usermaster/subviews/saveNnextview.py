from django.http import JsonResponse
from django.conf import settings
from adminmaster.datamanagement.models import MetaDataModel
import os
import json
from .maintaskview import MainTaskView
from usermaster.serializers import MainTaskMetaDataSerializer
from .query import querymeta

def index(request, metaid):

  if request.method == 'POST':
    current_meta_data = MetaDataModel.objects.filter(id=metaid).first()

    dataset_id = current_meta_data.dataset.id
    user = request.user
    queryset = querymeta.get_query_meta_general(dataset_id, user)
    serializer = MainTaskMetaDataSerializer(queryset)

    body_unicode = request.body.decode('utf-8')
    # print(body_unicode) 
    
  #now when query data finish -> need to change current onworking status
  current_meta_data.boxes_position = body_unicode
  current_meta_data.is_onworking = 0
  current_meta_data.is_annotated = 1
  current_meta_data.annotated_by_user.add(user)
  
  current_meta_data.save(update_fields=[
    'boxes_position', 'is_onworking',
    'is_annotated'
  ])
  
  return JsonResponse(serializer.data)
  # return JsonResponse({})
