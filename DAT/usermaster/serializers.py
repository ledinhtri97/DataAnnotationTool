from rest_framework import serializers
from adminmaster.workspacemanagement.models import WorkSpaceUserModel
from adminmaster.datamanagement.models import DataSetModel
from adminmaster.datamanagement.models import MetaDataModel
from adminmaster.contributemanagement.models import ContributeModel

class ContributeSerializer(serializers.ModelSerializer):
  users_count = serializers.SerializerMethodField('def_users_count')
  contribute_count = serializers.SerializerMethodField('def_contribute_count')

  def def_users_count(self, contribute):
    return contribute.user.count()

  def def_contribute_count(self, contribute):
    return contribute.input.count()

  class Meta:
    model = ContributeModel
    fields = ('id', 'available', 'description', 'name', 'users_count', 'contribute_count')

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

    

