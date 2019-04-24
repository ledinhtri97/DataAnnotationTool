from adminmaster.datamanagement.models import MetaDataModel
from usermaster.serializers import MainTaskMetaDataSerializer
from usermaster.subviews.query import querymeta
from django.http import JsonResponse

def next_index(request, metaid):
  current_meta_data = MetaDataModel.objects.filter(id=metaid).first()
  # print(metaid)
  #reuser code get query metadata from querymeta
  dataset_id = current_meta_data.dataset.id
  user = request.user
  
  # print(serializer.data)
  #now when query data finish -> need to change current onworking status
  current_meta_data.is_onworking = 0
  current_meta_data.onviewing_user='';
  current_meta_data.viewed_by_user.add(user)
  current_meta_data.save(update_fields=['is_onworking', 'onviewing_user'])
  
  queryset = querymeta.get_query_meta_general(dataset_id, user)
  
  datareturn = MainTaskMetaDataSerializer(queryset).data if(queryset) else ''

  return JsonResponse(datareturn)

def savenext_index(request, metaid):

  if request.method == 'POST':
    current_meta_data = MetaDataModel.objects.filter(id=metaid).first()
    body_unicode = request.body.decode('utf-8')
    # print(body_unicode) 
  
  dataset_id = current_meta_data.dataset.id
  user = request.user
  #now when query data finish -> need to change current onworking status
  current_meta_data.boxes_position = body_unicode
  current_meta_data.is_onworking = 0
  current_meta_data.is_annotated = 1
  current_meta_data.onviewing_user='';
  current_meta_data.annotated_by_user.add(user)
  
  current_meta_data.save(update_fields=[
    'boxes_position', 'is_onworking',
    'is_annotated', 'onviewing_user'
  ])
  
  queryset = querymeta.get_query_meta_general(dataset_id, user)
  
  datareturn = MainTaskMetaDataSerializer(queryset).data if(queryset) else {}

  return JsonResponse(datareturn)
  # return JsonResponse({})

def badnext_index(request, metaid):
  current_meta_data = MetaDataModel.objects.filter(id=metaid).first()
  #reuser code get query metadata from querymeta
  dataset_id = current_meta_data.dataset.id
  user = request.user

  #now when query data finish -> need to change current onworking status
  current_meta_data.is_onworking = 0
  current_meta_data.is_badmeta = 1
  current_meta_data.onviewing_user='';
  current_meta_data.viewed_by_user.add(user)
  current_meta_data.save(update_fields=['is_onworking', 'onviewing_user', 'is_badmeta'])
  
  queryset = querymeta.get_query_meta_general(dataset_id, user)
  
  datareturn = MainTaskMetaDataSerializer(queryset).data if(queryset) else ''

  return JsonResponse(datareturn)

def outws_index(request, metaid):
  current_meta_data = MetaDataModel.objects.filter(id=metaid).first()
  #now when query data finish -> need to change current onworking status
  current_meta_data.is_onworking=0
  current_meta_data.save(update_fields=['is_onworking'])
  return JsonResponse({})