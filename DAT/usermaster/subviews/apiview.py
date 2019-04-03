from django.http import JsonResponse
from django.conf import settings
from adminmaster.datamanagement.models import MetaDataModel
import os
from apimodel.api.facedetector import facedetAPI
from apimodel.api.persondetector import persondetAPI

def f_index(request, metaid):
  meta_data = MetaDataModel.objects.filter(id=metaid).first()
  full_path = os.path.join(
    settings.BASE_DIR,
    settings.STORAGE_DIR,
    meta_data.full_path,
    meta_data.name)
  # print(full_path)
  jsonFaces = facedetAPI(full_path)
  # print(jsonFaces)

  return JsonResponse(data=jsonFaces)

def p_index(request, metaid):
  meta_data = MetaDataModel.objects.filter(id=metaid).first()
  full_path = os.path.join(
    settings.BASE_DIR,
    settings.STORAGE_DIR,
    meta_data.full_path,
    meta_data.name)
  # print(full_path)
  jsonPerson = persondetAPI(full_path)
  # print(jsonPerson)

  return JsonResponse(data=jsonPerson)