from rest_framework import generics
from rest_framework.response import Response
import json
import os
from django.http import JsonResponse

class OverViewAllView(generics.RetrieveAPIView):
    lookup_field = 'id'
    template_name = 'usermaster/overview-all.html'

    def get_queryset(self):
        
        return {}

    # @Overwrite
    def retrieve(self, request, *args, **kwargs):
        __data__ = self.get_queryset()
        return Response(data=__data__)
