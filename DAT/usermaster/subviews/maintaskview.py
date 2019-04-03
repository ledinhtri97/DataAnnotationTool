from adminmaster.datamanagement.models import DataSetModel
from adminmaster.datamanagement.models import MetaDataModel
from usermaster.serializers import MainTaskMetaDataSerializer
from rest_framework import generics
from rest_framework.response import Response
from django.http import JsonResponse

from .query import querymeta

class MainTaskView(generics.RetrieveUpdateAPIView):
  
  queryset = MetaDataModel.objects.all()
  serializer_class = MainTaskMetaDataSerializer
  lookup_field = 'id'
  template_name = 'usermaster/maintask.html'

  def handle_metadata_before_release(self, meta_data, user):
    meta_data.is_onworking = 1
    meta_data.viewed_by_user.add(user)
    meta_data.save()


  #@Overwrite
  def get_queryset(self):
    dataset_id = self.request.parser_context['kwargs']['id']
    user = self.request.user

    meta_data = querymeta.get_query_meta_general(dataset_id, user)

    return meta_data

  def retrieve(self, request, *args, **kwargs):
    queryset = self.get_queryset()
    serializer = MainTaskMetaDataSerializer(queryset)
    newdict = {'labels': [
        lb.tag_label for lb in 
          DataSetModel.objects.filter(id=serializer.data['dataset']).first().labels.all()
      ]}
    newdict.update(serializer.data)
    
    return Response(data=newdict)