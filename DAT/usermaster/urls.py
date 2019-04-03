from django.urls import path, include
from django.views.generic.base import TemplateView
from usermaster.subviews.workspaceview import WorkspaceView
from usermaster.subviews.maintaskview import MainTaskView
from usermaster.subviews import apiview, nextview, saveNnextview, outwsview

urlpatterns = [
    path('', WorkspaceView.as_view(), name='workspace'),
    path('ws-<int:id>/', MainTaskView.as_view(), name='maintask'),
    path('facedet/<int:metaid>/', apiview.f_index, name='facedet'),
    path('persondet/<int:metaid>/', apiview.p_index, name='persondet'),
    path('next/<int:metaid>/', nextview.index, name='next'),
    path('saveNnext/<int:metaid>/', saveNnextview.index, name='next'),
    path('outworkspace/<int:metaid>/', outwsview.index, name='outws'),
]