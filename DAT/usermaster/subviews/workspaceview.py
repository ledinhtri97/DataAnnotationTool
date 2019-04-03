from adminmaster.workspacemanagement.models import WorkSpaceUserModel
# from adminmaster.datamanagement.models import DataSetModel
from usermaster.serializers import WorkspaceSerializer
from rest_framework import generics
from rest_framework.response import Response
# from rest_framework.renderers import TemplateHTMLRenderer
from django.http import JsonResponse
import json

class WorkspaceView(generics.RetrieveAPIView):
  queryset = WorkSpaceUserModel.objects.all()
  serializer_class = WorkspaceSerializer
  lookup_field = 'id'
  template_name='usermaster/workspace.html'
  
  #@Overwrite
  def get_queryset(self):
    user = self.request.user
    return WorkSpaceUserModel.objects.filter(user=user)

  #@Overwrite
  def retrieve(self, request, *args, **kwargs):
    
    queryset = self.get_queryset()

    serializer = WorkspaceSerializer(queryset, many=True)

    data = JsonResponse(serializer.data, safe=False)
    data = json.loads(data.content.decode('utf8').replace("'", '"'))

    """More features will be implement later:
      Dataresponse : {
        Workspace: {
          Name: 'name',
          custom: {'labeled-by-user', 'labeled-by-orther', 'non-labeled'}
        },
        Info: {
          dataset: 'name',
          numberuser: '100',
          labeltag: {'face',...},
          numbermeta: '10000',
          numberdonebyuser: '100',
        }
      }
    """
    #data = []
    # for wp in serializer.data:
    #   info = {}
    #   ds = DataSetModel.objects.filter(id=wp['dataset']).first()
    #   info['namedata'] = ds.name

    # print({'data': data})
    return Response(data={'data': data})
    # return JsonResponse(serializer.data, safe=False)

