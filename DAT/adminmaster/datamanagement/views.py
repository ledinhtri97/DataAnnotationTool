# from rest_framework import generics

from adminmaster.datamanagement.submodels.metadata import MetaDataModel
from django.conf import settings
import glob
import os
from django.http import JsonResponse
from PIL import Image

def create_thumbnail_index(request, id_dataset):
    data = {}
    
    try:
        metadata = MetaDataModel.objects.filter(dataset=id_dataset)
        thumb_height = 100

        for meta in metadata.all():

            
            path_mt = meta.get_full_origin()
            file, ext = os.path.splitext(path_mt)
            thumb = file.replace('storage_data', 'thumbnail')

            if(os.path.isfile(thumb + ".thumbnail")):
                continue

            im = Image.open(path_mt)
            im.thumbnail((im.size[0]*100/im.size[1], 100), Image.ANTIALIAS)
            try:
                folder = os.path.dirname(thumb)
                os.makedirs(folder)
            except FileExistsError:
                # print("Directory ", folder,  " already exists")
                pass
            if im.mode in ('RGBA', 'LA', 'P'):
                im = im.convert("RGB")
                im.save(thumb + ".thumbnail", "PNG")
            else:
                im.save(thumb + ".thumbnail", "JPEG")

    except Exception as e:
        print(e)
        return JsonResponse(data={'e': str(e), 'mode': str(im.mode)})

    return JsonResponse(data=data)
