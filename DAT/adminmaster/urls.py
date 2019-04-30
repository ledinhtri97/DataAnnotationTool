from django.urls import path, include
from django.views.generic.base import TemplateView
from django.contrib import admin
from adminmaster.contributemanagement.views import ContributeView, ItemContributeView, contribute_accept, contribute_save

urlpatterns = [path('', TemplateView.as_view(
    template_name='adminmaster/index.html'), name='datadmin'),
    path('dataman/', include('adminmaster.datamanagement.urls')),
    path('admin/', admin.site.urls, name='admin'),
    path('contributes/<int:id_contribute>/', ContributeView.as_view(), name='contributes'),
    path('contribute-view/<int:id_file>/',
         ItemContributeView.as_view(), name='contribute_view'),
    path('contribute-accept/<int:id_file>/',
         contribute_accept, name='contribute_accept'),
    path('contribute-save/<int:id_file>/',
         contribute_save, name='contribute_save'),
]
