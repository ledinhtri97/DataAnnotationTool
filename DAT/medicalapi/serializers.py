from rest_framework import serializers
from adminmaster.datamanagement.submodels.medical_patient import  MedicalPatientModel
from adminmaster.datamanagement.submodels.medical_instance import MedicalInstanceModel
from adminmaster.datamanagement.submodels.medical_studies import MedicalStudiesModel
from adminmaster.datamanagement.submodels.medical_series import MedicalSeriesModel
from adminmaster.datamanagement.submodels.medical_predicted_instance import MedicalPredictedInstanceModel
from adminmaster.datamanagement.submodels.labeldata import LabelDataModel


class MedicalPatientSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = MedicalPatientModel
        fields = ('patient_name', 'patient_birthdate', 'patient_sex', 'patient_uid')

class MedicalStudiesSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = MedicalStudiesModel
        fields = ('studies_uid', 'studies_last_update', 'patient_id')

class MedicalSeriesSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = MedicalSeriesModel
        fields = ('patient_name', 'patient_birthdate', 'patient_sex', 'patient_uid')

class MedicalInstanceSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = MedicalInstanceModel
        fields = ('instance_uid', 'index_in_series')

class MedicalPredictedInstanceSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = MedicalPredictedInstanceModel
        fields = ('instance_id', 'label_id', 'predict_type')

class LabelDataSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = LabelDataModel
        fields = ('tag_label', 'type_label', 'description')