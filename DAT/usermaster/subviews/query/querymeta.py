from adminmaster.datamanagement.models import MetaDataModel

def get_query_meta_general(dataset_id=None, user=None):
  query_meta_data = MetaDataModel.objects.filter(
      dataset_id=dataset_id,
      is_onworking=0,
      is_annotated=0)
  
  try:
    #viewed
    meta_data = query_meta_data.exclude(viewed_by_user=user).first()
  except AttributeError:
    meta_data = query_meta_data.first()
    pass
  
  handle_metadata_before_release(meta_data, user)

  return meta_data

def handle_metadata_before_release(meta_data, user):
    meta_data.is_onworking = 1
    meta_data.save(update_fields=['is_onworking'])