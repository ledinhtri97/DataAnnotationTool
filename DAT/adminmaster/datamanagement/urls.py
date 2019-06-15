from django.urls import path, include
from django.views.generic.base import TemplateView
from .views import create_thumbnail_index
from .views import flagfalse_index

urlpatterns = [path('create-thumbnail/ds-<int:id_dataset>/',
    create_thumbnail_index, name='create-thumbnail'),
        path('flagfalse-accept/mt-<int:id_mtid>/',
             flagfalse_index, name='flagfalse-accept'),
]
