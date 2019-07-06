# from rest_framework import generics
from adminmaster.datamanagement.submodels.dataset import DataSetModel
from adminmaster.datamanagement.submodels.metadata import MetaDataModel
from adminmaster.datamanagement.submodels.boudingbox import BoundingBoxModel
from adminmaster.datamanagement.submodels.labeldata import LabelDataModel
from usermaster.subviews.request.labeling_view import create_thumbnail
from django.conf import settings
import glob
import os
from django.http import JsonResponse
from PIL import Image


def flagfalse_index(request, id_mtid):
    data = {}
    print(id_mtid)
    meta = MetaDataModel.objects.get(id=id_mtid)
    meta.is_notice_view = 1
    meta.save(update_fields=['is_notice_view'])

    return JsonResponse(data=data)


def import_groundtruth_index(request, id_dataset):
    data = {'status': 'ok'}
    
    try:
        dataset = DataSetModel.objects.get(id=id_dataset)
        for input_data in dataset.input_file.all():
            if (input_data.groundtruth):
                INPUT_FILE = os.path.join(
                    settings.BASE_DIR, str(input_data.groundtruth))
                with open(INPUT_FILE, "r") as f:
                    lines = f.readlines()
                    readlines_to_database(lines, input_data.get_output_path())
                data[input_data.get_zipname()] = {
                    'gt': str(input_data.groundtruth),
                    'import': 'done',
                }
            else:
                data[input_data.get_zipname()] = 'No groundtruth'

    except Exception as e:
        print(e)
        return JsonResponse(data={'e': str(e)})

    return JsonResponse(data=data)


def readlines_to_database(self, lines, path_origin):


    def is_label(v):
        try:
            c = float(v)
            return len(v.split('.')) == 1
        except:
            return True

    for line in lines:
        sline = line.split('\n')[0].split(',')
        path_meta, num_obj = sline[0].split('/'), int(sline[1])
        info_list = sline[2:]
        current_idx = 0

        for no in range(num_obj):
            try:
               label_str = info_list[current_idx]
            except:
               continue
            current_idx += 1
            index_from = current_idx
            num_xy = 0

            while True:
                try:
                    if(is_label(info_list[current_idx])):
                        break
                except:
                    break
                current_idx += 2
                num_xy += 1

            type_label = 'rect' if num_xy == 2 else 'poly'

            position = ','.join(info_list[index_from:current_idx])

            name_file = path_meta[-1]

            full_path_folder = os.path.join(
                path_origin, '/'.join(path_meta[:-1]))

            new_bb, created = BoundingBoxModel.objects.get_or_create(
                label=LabelDataModel.objects.get(
                    tag_label=label_str, type_label=type_label),
                flag=1,
                position=position,
            )

            try:
                current_meta_data = MetaDataModel.objects.get(
                    dataset=self.dataSetModel, name=name_file, full_path=full_path_folder
                )

                if created:
                    current_meta_data.boxes_position.add(new_bb)
            except Exception as e:
                print(e)
