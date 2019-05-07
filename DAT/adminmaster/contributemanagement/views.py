
from rest_framework import generics
from rest_framework.response import Response
from adminmaster.contributemanagement.models import ContributeModel
from adminmaster.datamanagement.submodels.inputdata import InputDataModel
import json
import os
from django.http import JsonResponse
from adminmaster.datamanagement.submodels.utils.ziprar import ZipRarExtractor
#from adminmaster.submodels.utils.scanmeta import ScanMetaToDatabase

class ContributeView(generics.RetrieveAPIView):
    lookup_field = 'id'
    template_name = 'adminmaster/contribute.html'

    def get_queryset(self):
        contrib_id = self.request.parser_context['kwargs']['id_contribute']
        contribute = ContributeModel.objects.filter(id=contrib_id).first()

        review = {
            "name": contribute.name,
            "contribute_request": [
                {
                    "id_file": file.id,
                    "user_name": file.owner.username,
                    "file_name": file.get_zipname(),
                    "date_upload": file.history.last().history_date,
                }
                for file in contribute.input.filter(useful=0)
            ],
            "contribute_accepted": [
                {
                    "id_file": file.id,
                    "user_name": file.owner.username,
                    "file_name": file.get_zipname(),
                    "date_upload": file.history.last().history_date,
                }
                for file in contribute.input.filter(useful=1)
            ],
        }
        #print(review)
        return review
        
    # @Overwrite
    def retrieve(self, request, *args, **kwargs):
        __data__ = self.get_queryset()
        
        return Response(data=__data__)


class ItemContributeView(generics.RetrieveAPIView):
    lookup_field = 'id'
    template_name = 'adminmaster/contrib-items/item.html'

    def lookfiles(self, __folder__, __data__):
        folders = os.listdir(__folder__)
        for __file__ in folders:
            if __file__.split('.')[-1] in ['jpg', 'JPG', 'JPEG', 'jpeg', 'png', 'PNG', 'mp4']:
                __data__['metas'].append('/gvlab-dat/dataset/' + os.path.join(
                    __folder__, __file__).replace('\\', '/'))
            elif (os.path.isdir(os.path.join(__folder__, __file__))):
                self.lookfiles(os.path.join(__folder__, __file__), __data__)


    def get_queryset(self):
        id_file = self.request.parser_context['kwargs']['id_file']
        input_file = InputDataModel.objects.filter(id=id_file)
        
        ext_file = input_file.first().get_zipname().split('.')[-1]
        image_file = ext_file in ['jpg', 'JPG', 'JPEG', 'jpeg', 'png', 'PNG']
        zip_file = ext_file in ['rar', 'zip']
        media_file = ext_file in ['mp4', 'mp3', ]
        
        contribute = ContributeModel.objects.filter(
            input=input_file.first()).first()

        __data__ = {
            'contribute_name': contribute.name,
            'contribute_id': contribute.id,
            'id_file': id_file,
            'accepted': input_file.first().useful,
            'file_name': input_file.first().get_zipname(),
            'type': ext_file,
            'metas': [],
        }

        if zip_file:
            __folder__ = input_file.first().get_output_path()

            if not os.path.exists(__folder__):
                zipRarer = ZipRarExtractor(input_file)
                zipRarer.do_extract_all()
            else:
                print("file was extracted")
                self.lookfiles(__folder__, __data__)

        elif image_file or media_file:
            __data__['metas'].append(
                '/gvlab-dat/upload/'+input_file.first().get_full_path_file().replace('\\', '/'))
        return __data__

    # @Overwrite
    def retrieve(self, request, *args, **kwargs):
        __data__ = self.get_queryset()
        return Response(data=__data__)


def contribute_accept(request, id_file):
    input_ins = InputDataModel.objects.filter(id=id_file).first()
    input_ins.useful = 1
    input_ins.save(update_fields=['useful'])
    print(input_ins)
    return JsonResponse({})

def contribute_save(request, id_file):
    pass
