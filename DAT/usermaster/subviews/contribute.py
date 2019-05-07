
from rest_framework import generics
from rest_framework.response import Response
from adminmaster.contributemanagement.models import ContributeModel
from usermaster.serializers import ContributeSerializer
from adminmaster.datamanagement.submodels.inputdata import InputDataModel
import json
from django.http import JsonResponse

class ContributeView(generics.RetrieveAPIView):
  queryset = ContributeModel.objects.all()
  serializer_class = ContributeSerializer
  lookup_field = 'id'
  template_name = 'usermaster/contribute.html'
  
  def get_queryset(self):
    user = self.request.user
    return ContributeModel.objects.filter(available=1).all()

  def get_queryset_user_contrib(self):
    user_contrib = []
    inputs = InputDataModel.objects.filter(owner=self.request.user)
    for ip in inputs.all():
      contrib_temp = ContributeModel.objects.filter(user=self.request.user, input=ip).first() 
      user_contrib.append({
      'contribute_name': contrib_temp.name,
      'activate': contrib_temp.available,
      'file_name': ip.get_zipname(),
      'date_upload': ip.history.last().history_date,
      'validate': ip.useful,
    })
    #print(user_contrib)
    return user_contrib

  #@Overwrite
  def retrieve(self, request, *args, **kwargs):
    
    queryset = self.get_queryset()

    serializer = ContributeSerializer(queryset, many=True)

    data = JsonResponse(serializer.data, safe=False)

    data = json.loads(data.content.decode('utf8').replace("'", '"'))

    user_contrib = self.get_queryset_user_contrib()

    #print(user_contrib)
    
    return Response(data={'data': data, 'user_contrib': user_contrib})
