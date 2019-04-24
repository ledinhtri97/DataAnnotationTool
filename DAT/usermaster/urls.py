from django.urls import path, include

from usermaster.subviews.workspaces import WorkspaceView, saveseting_index
from usermaster.subviews.labeling import LabelingView
from usermaster.subviews.contribute import ContributeView
from usermaster.subviews.request import labeling_view
from usermaster.subviews.request import contribute_view
from usermaster.subviews import apiview

urlpatterns = [
    
    path('', WorkspaceView.as_view(), name='workspace'),
    
    path('contribute/', ContributeView.as_view(), name='contribute'),
    path('contribute-upload/<int:contributeid>/', contribute_view.index, name='contribute_upload'),

    path('ws-<int:id>/', LabelingView.as_view(), name='maintask'),
    path('next/<int:metaid>/', labeling_view.next_index, name='next'),
    path('savenext/<int:metaid>/', labeling_view.savenext_index, name='savenext'),
    path('badnext/<int:metaid>/', labeling_view.badnext_index, name='badnext'),
    path('outworkspace/<int:metaid>/', labeling_view.outws_index, name='outws'),

    path('savesettings/', saveseting_index, name='savesettings'),

    # path('objdet/', apiview.o_index, name='objdet'),
    # path('facedet/<int:metaid>/', apiview.f_index, name='facedet'),
    # path('persondet/<int:metaid>/', apiview.p_index, name='persondet'),

]