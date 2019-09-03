from rest_framework import generics
from rest_framework.response import Response
from adminmaster.workspacemanagement.models import WorkSpaceUserModel
from adminmaster.datamanagement.submodels.metadata import MetaDataModel
import json
import os
from django.http import JsonResponse


class WorkspaceView(generics.RetrieveAPIView):
    lookup_field = 'id'
    template_name = 'adminmaster/workspace_view.html'

    # @Overwrite
    def retrieve(self, request, *args, **kwargs):
        __data__ = {
            'id_ws': request.parser_context['kwargs']['id_workspace']
        }

        return Response(data=__data__)


def unblock_index(request, metaid):
    data = {}
    try:
        meta = MetaDataModel.objects.get(id=metaid)
        meta.is_allow_view = 1
        meta.is_notice_view = 1
        meta.save(update_fields=['is_allow_view', 'is_notice_view'])
        data['status'] = 'OK!'
    except Exception as e:
        data['error'] = str(e)

    return JsonResponse(data=data)

def unnoticed_index(request, metaid):
    data = {}
    try:
        meta = MetaDataModel.objects.get(id=metaid)
        meta.is_notice_view = 0
        meta.save(update_fields=['is_notice_view'])
        data['status'] = 'OK!'
    except Exception as e:
        data['error'] = str(e)

    return JsonResponse(data=data)

def wsm_index(request, id_workspace):
    data = {
        'namews': '',
        'users': [],
        'metadata': {
            'submitted': [],
            'skipped': [],
            'flaged': [],
            'notice_review': [],
        },
    }
    
    try:
        ws = WorkSpaceUserModel.objects.get(id=id_workspace)

        metadata = MetaDataModel.objects.filter(dataset=ws.dataset)
        
        data['namews'] = ws.nameworkspace

        for user in ws.user.all():
            submitted = metadata.filter(submitted_by_user=user)
            skipped = metadata.filter(skipped_by_user=user)
            data['users'].append(
                {
                    'username': user.username,
                    'submitted': submitted.count(),
                    'skipped': skipped.count(),
                    'flaged': submitted.filter(boxes_position__flag='0').count(),
                    'label_count': submitted.filter(boxes_position__flag='-1').count(),
                }
            )
        mSubmitted = metadata.exclude(submitted_by_user=None)
        for meta in mSubmitted.distinct():
            data['metadata']['submitted'].append(
                {
                    'url_thumb': meta.get_url_thumbnail(),
                    'url_meta': meta.get_url_api(),
                    'meta_id': meta.id,
                    'meta_user': meta.get_submitted_by_user(),
                    'last_date_update': meta.history.first().history_date,
                    'label_count': meta.boxes_position.count(),
                    'view': meta.is_allow_view,
                }
            )

        mSkipped = metadata.exclude(skipped_by_user=None)
        for meta in mSkipped.distinct():
            data['metadata']['skipped'].append(
                {
                    'url_thumb': meta.get_url_thumbnail(),
                    'url_meta': meta.get_url_api(),
                    'meta_id': meta.id,
                    'meta_user': meta.get_skip_by_user(),
                    'last_date_update': meta.history.first().history_date,
                    'reason_skipped': 'Unknown',
                    'label_count': meta.boxes_position.count(),
                    'view': meta.is_allow_view,
                }
            )

        for meta in mSubmitted.filter(boxes_position__flag='0', is_notice_view=0).distinct():
            data['metadata']['flaged'].append(
                {
                    'url_thumb': meta.get_url_thumbnail(),
                    'url_accept': meta.get_url_accept(),
                    'url_meta': meta.get_url_api(),
                    'meta_id': meta.id,
                    'last_date_update': meta.history.first().history_date,
                    'flag_count': meta.boxes_position.filter(flag='0').count(),
                    'label_count': meta.boxes_position.count(),
                    'view': meta.is_allow_view,
                }
            )
            
        for meta in metadata.filter(is_notice_view=1).all():
            data['metadata']['notice_review'].append(
                {
                    'url_thumb': meta.get_url_thumbnail(),
                    'url_meta': meta.get_url_api(),
                    'meta_id': meta.id,
                    'last_date_update': meta.history.first().history_date,
                    'message': 'sss',
                    'flag_count': 'sss',
                    'label_count': meta.boxes_position.count(),
                    'view': meta.is_allow_view,
                    'notice_review': meta.is_notice_view,
                }
            )

    except Exception as e:
        data['error'] = str(e)

    return JsonResponse(data=data)

