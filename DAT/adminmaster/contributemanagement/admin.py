from django.contrib import admin
from django import forms

from adminmaster.contributemanagement.models import ContributeModel
# Register your models here.

class ContributeForm(forms.ModelForm):
  class Meta:
    model = ContributeModel
    fields = '__all__'

  def save(self, commit=True):
    instance_dataset = super(ContributeForm, self).save(commit=False)
    
    instance_dataset.save()

    if(commit):
      instance_dataset.save()
         
    return instance_dataset

class ContributeAdmin(admin.ModelAdmin):
   #class Meta will not accept this form custom > find out why
   form = ContributeForm

   readonly_fields = ['user', 'input']  # , 'dir_path'

   fieldsets = [
      (None,
            {
               'fields': ['name', 'available', 'description']
            }
      ),
      ('Users Field',
            {
                'fields': ['user']
            }
      ),
      ('Input Field',
            {
                'fields': ['input']
            }
      ),
   ]

admin.site.register(ContributeModel, ContributeAdmin)