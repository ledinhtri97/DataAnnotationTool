from rest_framework import generics
import json
import os
from django.http import JsonResponse
from adminmaster.datamanagement.models import DataSetModel
from adminmaster.datamanagement.submodels.metadata import MetaDataModel
from adminmaster.workspacemanagement.models import WorkSpaceUserModel
from rest_framework.response import Response

class OverViewWorkspaceView(generics.RetrieveAPIView):
    lookup_field = 'id'
    template_name = 'usermaster/overview-workspace/overview.html'

    def retrieve(self, request, *args, **kwargs):
        return Response()


def get_meta_overview(request, mtid):
    meta = MetaDataModel.objects.filter(id=mtid).first()
    data = {}
    if meta:
        data = {
            'name': meta.get_abs_origin(),
            'url_meta': meta.get_url_meta(),
            'boxes_position': [
                {
                    'tag_label': bb.label.tag_label,
                    'type_label': bb.label.type_label,
                    'color': bb.label.color,
                    'flag': bb.flag,
                    'accept_report_flag': bb.accept_report_flag,
                    'position': bb.position,
                } for bb in meta.boxes_position.all()
            ] 
        }
    
    return JsonResponse(data=data)

def get_data_overview_workspace(request, wsid):
    workspace = WorkSpaceUserModel.objects.filter(id=wsid).first()
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
            'total': {
                'submitted': metadatas.filter(is_annotated=True).count(),
                'remaining': remaining,
                'skipped': metadatas.exclude(skipped_by_user__isnull=True).count(),
                'labels_created': metadatas.filter(boxes_position__flag=-1).count(),
                'complete': round((total - remaining) * 100 / total, 2),
            },
            'user': {
                'submitted': metadatas.filter(submitted_by_user=user).count(),
                'available': not_submitted + needreview,
                'skipped': metadatas.filter(skipped_by_user=user).count(),
                'labels_created': metadatas.filter(submitted_by_user=user, boxes_position__flag=-1).count(),
                'flag_false_predict': {
                    'mark': metadatas.filter(submitted_by_user=user, boxes_position__flag=0).count(),
                    'accepted': metadatas.filter(submitted_by_user=user, boxes_position__flag=0, boxes_position__accept_report_flag=1).count(),
                }
            },
            'objects': [
                {
                    'name': label.tag_label,
                    'total': metadatas.filter(boxes_position__label=label).count(),
                    'user': metadatas.filter(submitted_by_user=user, boxes_position__label=label, boxes_position__flag=-1).count(),
                    'predict': metadatas.filter(boxes_position__label=label, boxes_position__flag=1).count(),
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
                    'flag_count': 'sss',
                    'label_count': meta.boxes_position.count(),
                    'view': meta.is_allow_view,
                } for meta in metadatas.filter(submitted_by_user=user, boxes_position__flag=0).all()
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
        
    return JsonResponse(data=data)

