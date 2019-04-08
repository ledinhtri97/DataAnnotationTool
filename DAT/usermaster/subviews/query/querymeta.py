from adminmaster.datamanagement.models import MetaDataModel

def get_query_meta_general(dataset_id=None, user=None):
  try:
    query_meta_data = MetaDataModel.objects.filter(
      dataset_id=dataset_id,
      is_onworking=1,
      is_annotated=0,
      onviewing_user=user.username)
    # print("try: ", query_meta_data.first())
    if(query_meta_data.count()==0):
      query_meta_data = MetaDataModel.objects.filter(
        dataset_id=dataset_id,
        is_onworking=0,
        is_annotated=0).exclude(viewed_by_user=user)
      # print("try-again: ", query_meta_data.first())
    
  except Exception as e:
    print(e)
    query_meta_data = MetaDataModel.objects.filter(
      dataset_id=dataset_id,
      is_onworking=0,
      is_annotated=0)
    # print("except: ", query_meta_data)

  # try:
  #   #viewed
  #   meta_data = query_meta_data.exclude(viewed_by_user=user).first()
  # except AttributeError:
  
  meta_data = query_meta_data.first()  
  handle_metadata_before_release(meta_data, user)
  return meta_data

def handle_metadata_before_release(meta_data, user):
    meta_data.is_onworking = 1
    # print(meta_data.onviewing_user)
    if(meta_data.onviewing_user == ''):
      # print('new metadata', meta_data)
      meta_data.onviewing_user=user.username
      meta_data.save(update_fields=['is_onworking', 'onviewing_user'])
    else:
      # print('old metadata', meta_data)
      meta_data.save(update_fields=['is_onworking',])