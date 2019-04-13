from adminmaster.datamanagement.models import DataSetModel
from adminmaster.datamanagement.models import MetaDataModel
from usermaster.serializers import MainTaskMetaDataSerializer
from rest_framework import generics
from rest_framework.response import Response
from django.http import JsonResponse
# from apimodel.api.ssdpredict import objectdetAPI
# from apimodel import combo_1, combo_2
from .query import querymeta

class MainTaskView(generics.RetrieveUpdateAPIView):
  
  queryset = MetaDataModel.objects.all()
  serializer_class = MainTaskMetaDataSerializer
  lookup_field = 'id'
  template_name = 'usermaster/maintask.html'

  #@Overwrite
  def get_queryset(self):
    dataset_id = self.request.parser_context['kwargs']['id']
    user = self.request.user

    meta_data = querymeta.get_query_meta_general(dataset_id, user)

    return meta_data

  def retrieve(self, request, *args, **kwargs):
    queryset = self.get_queryset()
    newdict = {}
    if (queryset):
      serializer = MainTaskMetaDataSerializer(queryset)

      newdict = {'labels': [
        str(lb) for lb in 
          DataSetModel.objects.filter(id=serializer.data['dataset']).first().labels.all()
      ]}
      newdict.update(serializer.data)

    return Response(data=newdict)