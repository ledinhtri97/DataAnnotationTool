from rest_framework import serializers
from adminmaster.workspacemanagement.models import WorkSpaceUserModel
from adminmaster.datamanagement.models import DataSetModel
from adminmaster.datamanagement.models import MetaDataModel

class WorkspaceSerializer(serializers.ModelSerializer):
  class Meta:
    model = WorkSpaceUserModel
    # fields = ('id', 'nameworkspace', 'dataset', 'user')
    fields = '__all__'

class MainTaskDataseteSerializer(serializers.ModelSerializer):
  class Meta:
    model = DataSetModel
    #id-name-input_file-dir_path-labels
    fields = '__all__'

class MainTaskMetaDataSerializer(serializers.ModelSerializer):
  class Meta:
    model = MetaDataModel
    # fiedls = ('dataset','name','full_path','boxes_position','is_annotated','is_onworking','annotated_by_user)'
    fields = '__all__'
    

