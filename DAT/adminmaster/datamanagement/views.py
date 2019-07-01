# from rest_framework import generics

from adminmaster.datamanagement.submodels.metadata import MetaDataModel
from usermaster.subviews.request.labeling_view import create_thumbnail
from django.conf import settings
import glob
import os
from django.http import JsonResponse
from PIL import Image


def flagfalse_index(request, id_mtid):
    data = {}
    print(id_mtid)
    meta = MetaDataModel.objects.get(id=id_mtid)
    meta.is_notice_view = 1
    meta.save(update_fields=['is_notice_view'])

    return JsonResponse(data=data)

def create_thumbnail_index(request, id_dataset):
    data = {}
    
    try:
        metadata = MetaDataModel.objects.filter(dataset=id_dataset)
        thumb_height = 100

        for meta in metadata.all():
            create_thumbnail(meta)

    except Exception as e:
        print(e)
        return JsonResponse(data={'e': str(e), 'mode': str(im.mode)})

    return JsonResponse(data=data)
