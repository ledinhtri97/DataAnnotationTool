from rest_framework import generics
import json
import os
from django.http import JsonResponse
from adminmaster.datamanagement.models import DataSetModel
from adminmaster.datamanagement.submodels.metadata import MetaDataModel
from adminmaster.workspacemanagement.models import WorkSpaceUserModel
from rest_framework.response import Response
from .querymeta import query_meta

class OverViewWorkspaceView(generics.RetrieveAPIView):
    lookup_field = 'id'
    template_name = 'usermaster/overview-workspace/overview.html'

    def retrieve(self, request, *args, **kwargs):
        return Response()


def get_meta_overview(request, mtid):

    label_select = request.GET.get('label_select', '')
    #only_view = request.GET.get('only_view', '')

    meta = MetaDataModel.objects.filter(id=mtid).first()
    
    data = {}

    if meta:
        data = query_meta(meta)
        
        if label_select == 'true':
            data['label_select'] = [
                    {
                        'id': lb.id,
                        'tag_label': lb.tag_label,
                        'type_label': lb.type_label,
                        'color': lb.color,
                    } for lb in
                    DataSetModel.objects.filter(
                        id=meta.dataset.id).first().labels.all()
                ]
    
    return JsonResponse(data=data)

def get_data_overview_workspace(request, wsid):

    workspace = WorkSpaceUserModel.objects.get(dataset=wsid)
    
    data = {}
    if workspace:
        dataset = workspace.dataset
        user = request.user
        metadatas = MetaDataModel.objects.filter(dataset=dataset)

        #total - filter
        total = metadatas.count()
        remaining = metadatas.filter(
            is_annotated=False).exclude(skipped_by_user__isnull=False).count()

        not_submitted = metadatas.filter(
            is_annotated=False, is_allow_view=True).exclude(skipped_by_user=user).count()
        needreview = metadatas.filter(is_notice_view=True).count()

        #if normal user blabla else if admin blabla
        data = {
            'url_join': '/gvlab-dat/workspace/ws-{}/'.format(dataset.id),
            'total': {
                'submitted': metadatas.filter(is_annotated=True).count(),
                'remaining': remaining,
                'skipped': metadatas.exclude(skipped_by_user__isnull=True).count(),
                'labels_created': metadatas.filter(boxes_position__flag='-1').count(),
                'complete': round((total - remaining) * 100 / total, 2),
            },
            'user': {
                'submitted': metadatas.filter(submitted_by_user=user).count(),
                'available': not_submitted + needreview,
                'skipped': metadatas.filter(skipped_by_user=user).count(),
                'labels_created': metadatas.filter(submitted_by_user=user, boxes_position__flag='-1').count(),
                'flag_false_predict': {
                    'mark': metadatas.filter(submitted_by_user=user, boxes_position__flag='0').count(),
                    'accepted': metadatas.filter(submitted_by_user=user, boxes_position__flag='0', boxes_position__accept_report_flag=1).count(),
                }
            },
            'objects': [
                {
                    'name': label.tag_label,
                    'total': metadatas.filter(boxes_position__label=label).count(),
                    'user': metadatas.filter(submitted_by_user=user, boxes_position__label=label, boxes_position__flag='-1').count(),
                    'predict': 0,
                } for label in dataset.labels.all()
            ],
            'submitted': [
                {
                    'url_meta': meta.get_url_api(),
                    'meta_name': meta.get_abs_origin(),
                    'last_date_update': meta.history.first().history_date,
                    'label_count': meta.boxes_position.count(),
                    'view': meta.is_allow_view,
                } for meta in metadatas.filter(submitted_by_user=user).all()
            ],
            'skipped': [
                {
                    'url_meta': meta.get_url_api(),
                    'meta_name': meta.get_abs_origin(),
                    'last_date_update': meta.history.first().history_date,
                    'reason_skipped': 'sss',
                    'label_count': meta.boxes_position.count(),
                    'view': meta.is_allow_view,
                } for meta in metadatas.filter(skipped_by_user=user).all()
            ],
            'flaged': [
                {
                    'url_meta': meta.get_url_api(),
                    'meta_name': meta.get_abs_origin(),
                    'last_date_update': meta.history.first().history_date,
                    'flag_count': meta.boxes_position.filter(flag='0').count(),
                    'label_count': meta.boxes_position.count(),
                    'view': meta.is_allow_view,
                } for meta in metadatas.filter(submitted_by_user=user, boxes_position__flag='0').distinct()
            ],
            'notice_review': [
                {
                    'url_meta': meta.get_url_api(),
                    'meta_name': meta.get_abs_origin(),
                    'last_date_update': meta.history.first().history_date,
                    'message': 'sss',
                    'flag_count': 'sss',
                    'label_count': meta.boxes_position.count(),
                    'notice_review': meta.is_notice_view,
                } for meta in metadatas.filter(is_notice_view=1).all()
            ],
        }
        
        for obj in data['objects']:
            obj['predict'] = obj['total']-metadatas.filter(boxes_position__flag='-1').count(),

    return JsonResponse(data=data)

