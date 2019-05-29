import json

from rest_framework import generics
from rest_framework.response import Response
from django.http import JsonResponse

from .request import medical_labeling_view
from adminmaster.datamanagement.models import DataSetModel
from adminmaster.datamanagement.models import MetaDataModel
from adminmaster.workspacemanagement.models import UserSettingsModel


class MedicalLabelingView(generics.RetrieveUpdateAPIView):

  lookup_field = 'id'
  template_name = 'usermaster/medical_labeling.html'

  #@Overwrite
  def get_queryset(self):
    dataset_id = self.request.parser_context['kwargs']['id']
    user = self.request.user
    meta_data = medical_labeling_view.get_query_meta_general(dataset_id, user)

    return meta_data

  def retrieve(self, request, *args, **kwargs):
    
    meta_data = self.get_queryset()

    data = {
      'id': meta_data.id,
    }

    return Response(data=data)
