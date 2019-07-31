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

    def get_queryset(self):
        dataset_id = self.request.parser_context['kwargs']['id']
        type_labeling = DataSetModel.objects.get(id=dataset_id).type_labeling

        user = self.request.user
        meta_data = labeling_view.get_query_meta_general(
            dataset_id, user, type_labeling)
            
        return meta_data, type_labeling

    def retrieve(self, request, *args, **kwargs):
        meta_data, type_labeling = self.get_queryset()
        if meta_data:
            data = {'id': meta_data.id, 'tl': type_labeling}
        else:
            data = {'id': '-1', 'tl': type_labeling}

        return Response(data=data)


class EditLabelingView(generics.RetrieveUpdateAPIView):

    lookup_field = 'metaid'
    template_name = 'usermaster/edit.html'

    def retrieve(self, request, *args, **kwargs):
        metaid = request.parser_context['kwargs']['metaid']
        user = request.user
        
        try:
            meta = MetaDataModel.objects.get(id=metaid)
    
            user_submited = user in meta.submitted_by_user.all()
            user_skipped = user in meta.skipped_by_user.all()
            allow_view = user_submited or user_skipped or meta.is_notice_view or user.is_superuser

            if allow_view and not meta.onviewing_user:
                data = {'id': metaid, }
                labeling_view.handle_metadata_before_release(meta, user)
            else:
                data = {'id': '-1', }

        except Exception as e:
            print(e)
            data = { 'id': '-1', }

        return Response(data=data)
