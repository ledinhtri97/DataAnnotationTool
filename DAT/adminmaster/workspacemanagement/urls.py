from django.urls import path, include
from django.views.generic.base import TemplateView
from .views import WorkspaceView
from .views import wsm_index
from .views import unblock_index
urlpatterns = [path('main-<int:id_workspace>/', WorkspaceView.as_view(), name='workspacemanage'),
               path('main-<int:id_workspace>/api-get-data/',
                    wsm_index, name='wsm_api_data'),
               path('unblock_metaid-<int:metaid>/',
                    unblock_index, name='unblock'), 
]
