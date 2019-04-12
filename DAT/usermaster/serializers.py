from rest_framework import serializers
from adminmaster.workspacemanagement.models import WorkSpaceUserModel
from adminmaster.datamanagement.models import DataSetModel
from adminmaster.datamanagement.models import MetaDataModel

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
  class Meta:
    model = MetaDataModel
    fields = '__all__'
    

