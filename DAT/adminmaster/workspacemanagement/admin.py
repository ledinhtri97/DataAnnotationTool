from django.contrib import admin
from django import forms
import json
from adminmaster.workspacemanagement.models import UserSettingsModel
from adminmaster.workspacemanagement.models import WorkSpaceUserModel
from adminmaster.datamanagement.models import DataSetModel
# Register your models here.

class WorkSpaceUserForm(forms.ModelForm):
    class Meta:
      model = WorkSpaceUserModel
      fields = '__all__'

    def generate_settings(self, dataset, users):
      
      sett_wdata = UserSettingsModel.objects.filter(dataset=dataset)

      labels = DataSetModel.objects.filter(id=dataset.id).first().labels.all()

      colors_map = {
        str(lb):lb.color for lb in labels
      }

      setts = json.dumps({
        'show_popup': 'false',
        'auto_hidden': 'false',
        'auto_predict': 'false',
        'ask_dialog': 'true',
        'color_background': 'true',
        'size_icon': 8,
        'width_stroke': 3,
      })

      for u in users.all():
        if (not sett_wdata.filter(user=u).first()):
          UserSettingsModel.objects.get_or_create(dataset=dataset, user=u, settings=setts)

    def save(self, commit=True):
      instance = super(WorkSpaceUserForm, self).save(commit=False)
      instance.save()
      
      self.generate_settings(
        self.cleaned_data['dataset'],
        self.cleaned_data['user']
      )

      if(commit):
         instance.save()

      return instance

class WorkSpaceUserAdmin(admin.ModelAdmin):
   #class Meta will not accept this form custom > find out why
   form = WorkSpaceUserForm

   fieldsets = [
      (None,
            {
               'fields': ['nameworkspace']
            }
      ),
      ('DATASET Field',
            {
                'fields': ['dataset']
            }
      ),
      ('USERS Field',
            {
                'fields': ['user']
            }
      ),
   ]

class UserSettingsAdmin(admin.ModelAdmin):
   #class Meta will not accept this form custom > find out why

  readonly_fields = ['settings', 'dataset', 'user']
   
  fieldsets = [
      (None,
            {
               'fields': ['settings']
            }
      ),
      ('DATASET Field',
            {
                'fields': ['dataset']
            }
      ),
      ('USERS Field',
            {
                'fields': ['user']
            }
      ),
   ]

  def has_delete_permission(self, request, obj=None):
    return True

admin.site.register(WorkSpaceUserModel, WorkSpaceUserAdmin)
admin.site.register(UserSettingsModel, UserSettingsAdmin)