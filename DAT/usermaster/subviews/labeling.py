from adminmaster.datamanagement.models import DataSetModel
from adminmaster.datamanagement.models import MetaDataModel
from adminmaster.workspacemanagement.models import UserSettingsModel
from usermaster.serializers import MainTaskMetaDataSerializer
from rest_framework import generics
from rest_framework.response import Response
from django.http import JsonResponse
import json
from .request import labeling_view
# from apimodel.api.ssdpredict import objectdetAPI
# from apimodel import combo_1, combo_2

class LabelingView(generics.RetrieveUpdateAPIView):
  
  queryset = MetaDataModel.objects.all()
  serializer_class = MainTaskMetaDataSerializer
  lookup_field = 'id'
  template_name = 'usermaster/labeling.html'

  #@Overwrite
  def get_queryset(self):
    dataset_id = self.request.parser_context['kwargs']['id']
    user = self.request.user
    meta_data = labeling_view.get_query_meta_general(dataset_id, user)

    return meta_data

  def get_settings(self):
    dataset_id = self.request.parser_context['kwargs']['id']
    user = self.request.user

    sett = UserSettingsModel.objects.filter(dataset=dataset_id, user=user).first()

    return sett.settings if sett else ''


  def retrieve(self, request, *args, **kwargs):
    
    queryset = self.get_queryset()
    sett = self.get_settings()

    newdict = {}

    if (queryset):
      serializer = MainTaskMetaDataSerializer(queryset)

      newdict = {'labels': [
          {
            'id': str(lb),
            'color': lb.color,
          } for lb in 
            DataSetModel.objects.filter(id=serializer.data['dataset']).first().labels.all()
        ],
        'settings': json.loads(sett),
      }

      newdict.update(serializer.data)

    return Response(data=newdict)
