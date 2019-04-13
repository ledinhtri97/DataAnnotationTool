from rest_framework import serializers
from adminmaster.workspacemanagement.models import WorkSpaceUserModel
from adminmaster.datamanagement.models import DataSetModel
from adminmaster.datamanagement.models import MetaDataModel

# from apimodel.api.ssdpredict import objectdetAPI
# from apimodel import combo_1, combo_2
# import cv2

class WorkspaceSerializer(serializers.ModelSerializer):

  num_allmeta = serializers.SerializerMethodField('def_num_allmeta')
  num_annotated_meta = serializers.SerializerMethodField('def_num_annotated_meta')

  def def_num_allmeta(self, wsum):
    return MetaDataModel.objects.filter(dataset=wsum.dataset).count()

  def def_num_annotated_meta(self, wsum):
    return MetaDataModel.objects.filter(dataset=wsum.dataset, is_annotated=1).count()

  class Meta:
    model = WorkSpaceUserModel
    fields = ('nameworkspace', 'user', 'dataset', 'num_allmeta', 'num_annotated_meta')

class MainTaskDataseteSerializer(serializers.ModelSerializer):
  class Meta:
    model = DataSetModel
    fields = '__all__'

class MainTaskMetaDataSerializer(serializers.ModelSerializer):
  # predict_bbs = serializers.SerializerMethodField('def_predict_bbs')

  # def def_predict_bbs(self, meta):
  #   if (not meta.boxes_position):
  #     meta = cv2.imread(meta.get_full_origin())
  #     pr1 = objectdetAPI(meta, ['person'], combo_2[0], combo_2[1], combo_2[2])
  #     pr2 = objectdetAPI(meta, ['face'], combo_1[0], combo_1[1], combo_1[2])
  #     return pr1+ pr2
  #   else:
  #     return meta.boxes_position

  class Meta:
    model = MetaDataModel
    fields = ['id', 'dataset', 'name', 'full_path',
      'boxes_position', 'extfile', 'is_annotated',
      'is_onworking', 'is_badmeta', 'onviewing_user',
      'annotated_by_user', 'viewed_by_user',]
    # fields.append('predict_bbs')
    

