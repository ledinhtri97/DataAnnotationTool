from django.urls import path, include
from django.views.generic.base import TemplateView
from django.contrib import admin

urlpatterns = [path('', TemplateView.as_view(
    template_name='adminmaster/index.html'), name='datadmin'),
    path('dataman/', include('adminmaster.datamanagement.urls')),
    path('admin/', admin.site.urls, name='admin'),
]
