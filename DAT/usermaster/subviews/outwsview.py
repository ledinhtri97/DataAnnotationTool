from django.http import JsonResponse
from django.conf import settings
from adminmaster.datamanagement.models import MetaDataModel
import os
from .maintaskview import MainTaskView
from usermaster.serializers import MainTaskMetaDataSerializer
from .query import querymeta

def index(request, metaid):
  current_meta_data = MetaDataModel.objects.filter(id=metaid).first()
  #now when query data finish -> need to change current onworking status
  current_meta_data.is_onworking=0
  current_meta_data.save(update_fields=['is_onworking'])
  return JsonResponse({})