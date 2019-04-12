from django.http import JsonResponse
from django.conf import settings
from adminmaster.datamanagement.models import MetaDataModel
import os
from .maintaskview import MainTaskView
from usermaster.serializers import MainTaskMetaDataSerializer
from .query import querymeta

def index(request, metaid):
  current_meta_data = MetaDataModel.objects.filter(id=metaid).first()
  #reuser code get query metadata from querymeta
  dataset_id = current_meta_data.dataset.id
  user = request.user

  #now when query data finish -> need to change current onworking status
  current_meta_data.is_onworking = 0
  current_meta_data.is_badmeta = 1
  current_meta_data.onviewing_user='';
  current_meta_data.viewed_by_user.add(user)
  current_meta_data.save(update_fields=['is_onworking', 'onviewing_user', 'is_badmeta'])
  
  queryset = querymeta.get_query_meta_general(dataset_id, user)
  
  datareturn = MainTaskMetaDataSerializer(queryset).data if(queryset) else ''

  return JsonResponse(datareturn)
