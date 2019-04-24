
from rest_framework import generics
from rest_framework.response import Response
from adminmaster.contributemanagement.models import ContributeModel
from usermaster.serializers import ContributeSerializer

import json
from django.http import JsonResponse

class ContributeView(generics.RetrieveAPIView):
  queryset = ContributeModel.objects.all()
  serializer_class = ContributeSerializer
  lookup_field = 'id'
  template_name = 'usermaster/contribute.html'
  
  #@Overwrite
  def get_queryset(self):
    user = self.request.user
    return ContributeModel.objects.filter(available=1).all()

  #@Overwrite
  def retrieve(self, request, *args, **kwargs):
    
    queryset = self.get_queryset()

    serializer = ContributeSerializer(queryset, many=True)

    data = JsonResponse(serializer.data, safe=False)

    data = json.loads(data.content.decode('utf8').replace("'", '"'))


    # print(data)
    
    return Response(data={'data': data, 'user_contrib': 'user'})