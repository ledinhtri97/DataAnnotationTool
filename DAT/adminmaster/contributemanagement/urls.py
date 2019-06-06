from django.urls import path, include
from django.views.generic.base import TemplateView

from .views import ContributeView, ItemContributeView, contribute_accept, contribute_save

urlpatterns = [path('main-<int:id_contribute>/', ContributeView.as_view(), name='contributes'),
    path('view/<int:id_file>/',
        ItemContributeView.as_view(), name='contribute_view'),
    path('contribute-accept/<int:id_file>/',
        contribute_accept, name='contribute_accept'),
    path('contribute-save/<int:id_file>/',
        contribute_save, name='contribute_save'), 
]
