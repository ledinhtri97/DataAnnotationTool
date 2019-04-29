
from rest_framework import generics
from rest_framework.response import Response
from adminmaster.contributemanagement.models import ContributeModel
from adminmaster.datamanagement.submodels.inputdata import InputDataModel
import json
from django.http import JsonResponse


class ContributeView(generics.RetrieveAPIView):
    lookup_field = 'id'
    template_name = 'adminmaster/contribute.html'

    def get_queryset(self):
        contrib_id = self.request.parser_context['kwargs']['id_contribute']
        contribute = ContributeModel.objects.filter(id=contrib_id).first()
        

        review = {
            "name": contribute.name,
            "contribute_request": [
                {
                    "id_file": file.id,
                    "user_name": file.owner.username,
                    "file_name": file.get_zipname(),
                    "date_upload": file.history.last().history_date,
                }
                for file in contribute.input.filter(useful=0)
            ],
            "contribute_accepted": [
                {
                    "id_file": file.id,
                    "user_name": file.owner.username,
                    "file_name": file.get_zipname(),
                    "date_upload": file.history.last().history_date,
                }
                for file in contribute.input.filter(useful=1)
            ],
        }
        print(review)
        return review
        
  # @Overwrite
    def retrieve(self, request, *args, **kwargs):
        __data__ = self.get_queryset()
        return Response(data=__data__)


def contribute_view(request, id_file):
    pass


def contribute_accept(request, id_file):
    pass


def contribute_save(request, id_file):
    pass
