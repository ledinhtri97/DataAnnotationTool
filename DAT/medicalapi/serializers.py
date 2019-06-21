from rest_framework import serializers
from adminmaster.datamanagement.submodels.medical_patient import  MedicalPatientModel
from adminmaster.datamanagement.submodels.medical_instance import MedicalInstanceModel


class MedicalPatientSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = MedicalPatientModel
        fields = ('patient_name', 'patient_birthdate', 'patient_sex', 'patient_uid')

class MedicalInstanceSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = MedicalInstanceModel
        fields = ('instance_uid', 'index_in_series')
