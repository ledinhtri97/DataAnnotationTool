from adminmaster.datamanagement.models import DataSetModel
from adminmaster.datamanagement.models import MetaDataModel
from adminmaster.workspacemanagement.models import UserSettingsModel

from rest_framework import generics
from rest_framework.response import Response
from django.http import JsonResponse
import json
from .request import labeling_view

class LabelingView(generics.RetrieveUpdateAPIView):

    lookup_field = 'id'
    template_name = 'usermaster/labeling.html'

     #@Overwrite
    def get_queryset(self):
        dataset_id = self.request.parser_context['kwargs']['id']
        user = self.request.user
        meta_data = labeling_view.get_query_meta_general(dataset_id, user)

        return meta_data

    def retrieve(self, request, *args, **kwargs):
    
        meta_data = self.get_queryset()

        if meta_data:
            data = {
                'id': meta_data.id,
            }
        else:
            data = {
                'id': '-1',
            }

        return Response(data=data)


class EditLabelingView(generics.RetrieveUpdateAPIView):

    lookup_field = 'metaid'
    template_name = 'usermaster/edit.html'

    def retrieve(self, request, *args, **kwargs):
        metaid = request.parser_context['kwargs']['metaid']
        user = request.user
        
        try:
            if user.is_superuser:
                meta = MetaDataModel.objects.get(id=metaid)
            else:
                try:
                    meta = MetaDataModel.objects.get(id=metaid, submitted_by_user=user)
                except MetaDataModel.DoesNotExist:
                    meta = MetaDataModel.objects.get(id=metaid, skipped_by_user=user)

            data = {
                'id': metaid,
            }
        except Exception as e:
            print(e)
            data = {
                'id': '',
            }

        return Response(data=data)
