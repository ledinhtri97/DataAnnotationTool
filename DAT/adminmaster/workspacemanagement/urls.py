from django.urls import path, include
from django.views.generic.base import TemplateView
from .views import WorkspaceView
urlpatterns = [path('main-<int:id_workspace>/', WorkspaceView.as_view(), name='workspacemanage'),
]
