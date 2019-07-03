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

    def generate_settings(self, users):

        setts = json.dumps({
            'show_popup': 'true',
            'show_label': 'true',
            'auto_hidden': 'false',
            'ask_dialog': 'true',
            'color_background': 'true',
            'size_icon': 8,
            'width_stroke': 3,
        })

        for u in users.all():
            if (not UserSettingsModel.objects.filter(user=u).first()):
                    UserSettingsModel.objects.get_or_create(user=u, settings=setts)

    def save(self, commit=True):
        instance = super(WorkSpaceUserForm, self).save(commit=False)
        instance.save()

        self.generate_settings(self.cleaned_data['user'])

        if(commit):
            instance.save()

        return instance

class WorkSpaceUserAdmin(admin.ModelAdmin):
    #class Meta will not accept this form custom > find out why
    form = WorkSpaceUserForm
    list_display = ('nameworkspace', 'manage',)
    fieldsets = [
        (None,
                {
                'fields': ['nameworkspace', 'type_labeling']
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
        ('APIS Reference Field',
                {
                'fields': ['api_reference']
                }
        ),
    ]

class UserSettingsAdmin(admin.ModelAdmin):
    #class Meta will not accept this form custom > find out why

    readonly_fields = ['settings', 'user']
        
    fieldsets = [
        (None,
                {
                'fields': ['settings']
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
