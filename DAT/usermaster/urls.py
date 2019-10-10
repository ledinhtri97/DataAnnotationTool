from django.urls import path, include
from django.conf import settings

from usermaster.subviews.workspaces import WorkspaceView, get_data_workspaces
from usermaster.subviews.labeling import LabelingView, EditLabelingView
from usermaster.subviews.contribute import ContributeView
from usermaster.subviews.request import labeling_view

from usermaster.subviews.request import contribute_view
# from usermaster.subviews import apiview
from usermaster.subviews.request.overview_all_view import OverViewAllView
from usermaster.subviews.request import working_request as owv

urlpatterns = [
    
    path('', WorkspaceView.as_view(), name='workspace'),
    path(''+settings.SLUG_API_URL, get_data_workspaces),

    path('contribute/', ContributeView.as_view(), name='contribute'),
    path('contribute-upload/<int:contributeid>/', contribute_view.index, name='contribute_upload'),

    path('ws-<int:id>/', LabelingView.as_view(), name='maintask'),
    path('edit_metaid-<int:metaid>/', EditLabelingView.as_view(), name='edittask'),
    

    path('api_reference/<int:metaid>/'+settings.SLUG_API_URL,
         labeling_view.api_reference_index, name='api_reference'),
    path('next/<int:metaid>/', labeling_view.next_index, name='next'),
    path('save/<int:metaid>/', labeling_view.save_index, name='save'),
    path('savenext/<int:metaid>/', labeling_view.savenext_index, name='savenext'),

    path('outworkspace/<int:metaid>/', labeling_view.outws_index, name='outws'),
    
    path('savesettings/', labeling_view.saveseting_index, name='savesettings'),
    path('settings/'+settings.SLUG_API_URL, labeling_view.get_data_settings),

    path('overviewall/', OverViewAllView.as_view(), name='overviewall'),#mark-dev
    
    path('overview/<int:wsid>/', owv.OverViewWorkspaceView.as_view(),
         name='overview-workspace'),
    
    # onworking
    path('overview/<int:wsid>/'+settings.SLUG_API_URL, 
          owv.get_data_overview_workspace),
    path('metaview/<int:mtid>/'+settings.SLUG_API_URL,
         owv.get_meta_detecting),
     path('listmetaview/<int:mtid>/'+settings.SLUG_API_URL,
          owv.get_list_meta_tracking),
]
