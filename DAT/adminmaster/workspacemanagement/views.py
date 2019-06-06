from rest_framework import generics
from rest_framework.response import Response
from adminmaster.workspacemanagement.models import WorkSpaceUserModel
import json
import os
from django.http import JsonResponse


class WorkspaceView(generics.RetrieveAPIView):
    lookup_field = 'id'
    template_name = 'adminmaster/workspace_view.html'

    def get_queryset(self):
        id_workspace = self.request.parser_context['kwargs']['id_workspace']
        contribute = WorkSpaceUserModel.objects.get(id=id_workspace)

        review = {}
        
        return review

    # @Overwrite
    def retrieve(self, request, *args, **kwargs):
        __data__ = self.get_queryset()

        return Response(data=__data__)
