from django.urls import path, include
from django.views.generic.base import TemplateView
from .views import import_groundtruth_index
from .views import flagfalse_index

urlpatterns = [path('import-groudtruth/ds-<int:id_dataset>/',
                    import_groundtruth_index, name='create-thumbnail'),
        path('flagfalse-accept/mt-<int:id_mtid>/',
             flagfalse_index, name='flagfalse-accept'),
]
