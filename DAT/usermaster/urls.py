from django.urls import path, include
from django.conf import settings

from usermaster.subviews.workspaces import WorkspaceView, get_data_settings, saveseting_index
from usermaster.subviews.labeling import LabelingView
from usermaster.subviews.contribute import ContributeView
from usermaster.subviews.request import labeling_view

from usermaster.subviews.request import contribute_view
from usermaster.subviews import apiview
from usermaster.subviews.request.overview_all_view import OverViewAllView
from usermaster.subviews.request import overview_workspcae_view as owv

urlpatterns = [
    
    path('', WorkspaceView.as_view(), name='workspace'),
    
    path('contribute/', ContributeView.as_view(), name='contribute'),
    path('contribute-upload/<int:contributeid>/', contribute_view.index, name='contribute_upload'),

    path('ws-<int:id>/', LabelingView.as_view(), name='maintask'),
    path('next/<int:metaid>/', labeling_view.next_index, name='next'),
    path('savenext/<int:metaid>/', labeling_view.savenext_index, name='savenext'),
    
    path('outworkspace/<int:metaid>/', labeling_view.outws_index, name='outws'),

    path('savesettings/', saveseting_index, name='savesettings'),
    path('settings/'+settings.SLUG_API_URL, get_data_settings),

    path('overviewall/', OverViewAllView.as_view(), name='overviewall'),#mark-dev
    
    path('overview/<int:wsid>/', owv.OverViewWorkspaceView.as_view(),
         name='overview-workspace'),
    
    # onworking
    path('overview/<int:wsid>/'+settings.SLUG_API_URL, 
          owv.get_data_overview_workspace),
    path('metaview/<int:mtid>/'+settings.SLUG_API_URL,
         owv.get_meta_overview),


     # path('objdet/', apiview.o_index, name='objdet'),
     # path('facedet/<int:metaid>/', apiview.f_index, name='facedet'),
     # path('persondet/<int:metaid>/', apiview.p_index, name='persondet'),
]
