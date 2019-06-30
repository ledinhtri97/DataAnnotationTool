from adminmaster.workspacemanagement.models import WorkSpaceUserModel
from usermaster.serializers import WorkspaceSerializer
from rest_framework import generics
from rest_framework.response import Response
from django.http import JsonResponse


class WorkspaceView(generics.RetrieveAPIView):
    queryset = WorkSpaceUserModel.objects.all()
    serializer_class = WorkspaceSerializer
    lookup_field = 'id'
    template_name='usermaster/workspaces.html'
  
    #@Overwrite
    def retrieve(self, request, *args, **kwargs):
        return Response({})

def get_data_workspaces(request):
    ws = WorkSpaceUserModel.objects.filter(user=request.user)
    serializer = WorkspaceSerializer(ws, many=True)
    return JsonResponse(serializer.data, safe=False)
