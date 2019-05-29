import json

from rest_framework import generics
from django.http import JsonResponse
from rest_framework.response import Response

from adminmaster.datamanagement.submodels.medical_dataset import MedicalDataSetModel
from usermaster.serializers import MedicalWorkspaceSerializer
from adminmaster.workspacemanagement.models import UserSettingsModel


class MedicalWorkspaceView(generics.RetrieveAPIView):
  queryset = MedicalDataSetModel.objects.all()
  serializer_class = MedicalWorkspaceSerializer
  lookup_field = 'id'
  template_name='usermaster/medical_workspaces.html'
  
  #@Overwrite
  def get_queryset(self):
    user = self.request.user
    return MedicalDataSetModel.objects.filter(user=user)

  #@Overwrite
  def retrieve(self, request, *args, **kwargs):
    queryset = self.get_queryset()

    serializer = MedicalWorkspaceSerializer(queryset, many=True)

    data = JsonResponse(serializer.data, safe=False)
    data = json.loads(data.content.decode('utf8').replace("'", '"'))

    return Response(data={'data': data})


def get_data_settings(request):
  setts = UserSettingsModel.objects.filter(user=request.user).first()
  return JsonResponse(data=json.loads(setts.settings))

def saveseting_index(request):
  if request.method == 'POST':

    try:

      __body__ = json.loads(request.body.decode('utf-8'))

      setts = UserSettingsModel.objects.filter(user=request.user).first()
      setts.settings = json.dumps(__body__['sett'])
      print(setts.settings)
      setts.save(update_fields=['settings'])
    
    except Exception as e:
      print(e)

  return JsonResponse({})
