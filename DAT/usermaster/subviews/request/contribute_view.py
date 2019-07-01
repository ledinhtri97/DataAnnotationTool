from django.http import JsonResponse
from adminmaster.contributemanagement.models import ContributeModel
from adminmaster.datamanagement.submodels.inputdata import InputDataModel
from django.http import HttpResponseRedirect
from django.urls import reverse
import os

def index(request, contributeid):
    if request.method == "POST":
        uploaded_file = request.FILES['contribute_uploaded_file']
        # print(contributeid)
        # print(uploaded_file)
        input = None
        try:
            input = InputDataModel.objects.get_or_create(
                zipfile=uploaded_file, 
                owner=request.user,
                description="User {} upload file contribute data".format(request.user.username)
                )[0]

            contrib = ContributeModel.objects.filter(id=contributeid).first()
            contrib.user.add(request.user)
            contrib.input.add(input)
            contrib.save()
      
        except Exception as e:
            print(e)
            if(input):
                os.remove(input.get_full_path_file())
                InputDataModel.objects.filter(pk=input.id).delete()
        return HttpResponseRedirect(reverse('contribute'))
    else:
        return JsonResponse({})