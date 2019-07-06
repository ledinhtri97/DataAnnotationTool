# Create your tasks here
from __future__ import absolute_import, unicode_literals

from celery import shared_task
import os
from django.conf import settings


def is_label(v):
    try:
        c = float(v)
        return len(v.split('.')) == 1
    except:
        return True

@shared_task
def scanner_dataset(datasetid):
    from adminmaster.datamanagement.submodels.metadata import MetaDataModel
    from adminmaster.datamanagement.submodels.dataset import DataSetModel

    is_done = False
    while not is_done:
        try:
            dataSetModel = DataSetModel.objects.get(id=datasetid)
            is_done = True
        except:
            print('still not found dataset')
            is_done = False
    inputFileQuery = dataSetModel.input_file

    def lookfiles(full_path_folder):
        folders = os.listdir(os.path.join(settings.STORAGE_DIR, full_path_folder))
        for xxxfile in folders:
            if xxxfile.split('.')[-1] in ['jpeg', 'jpg', 'png', 'JPG', 'PNG', 'tif']:
                
                temp = MetaDataModel.objects.get_or_create(
                    dataset=dataSetModel, name=xxxfile, full_path=full_path_folder
                )
            elif (os.path.isdir(os.path.join(settings.STORAGE_DIR, full_path_folder, xxxfile))):
                lookfiles(os.path.join(full_path_folder, xxxfile))
    
    def readlines_to_database(lines, path_origin):
        
        for line in lines:
            sline = line.split('\n')[0].split(',')
            path_meta, num_obj = sline[0].split('/'), int(sline[1])
            info_list = sline[2:]
            current_idx = 0

            for no in range(num_obj):
                try:
                    label_str = info_list[current_idx]
                    name_file = path_meta[-1]
                    full_path_folder = os.path.join(
                        path_origin, '/'.join(path_meta[:-1]))
                    print(label_str, name_file, full_path_folder)

                    current_meta_data = MetaDataModel.objects.get(
                        dataset=dataSetModel, name=name_file, full_path=full_path_folder
                    )
                    if (current_meta_data.boxes_position.count() > 0):
                        continue

                except Exception as e:
                    print(e)
                    continue
                current_idx += 1
                index_from = current_idx
                num_xy = 0

                while True:
                    try: 
                        if(is_label(info_list[current_idx])): break
                    except: break
                    current_idx += 2
                    num_xy += 1

                type_label = 'rect' if num_xy == 2 else 'poly'
                position = ','.join(info_list[index_from:current_idx])
                new_bb, created = BoundingBoxModel.objects.get_or_create(
                    label=LabelDataModel.objects.get(
                        tag_label=label_str, type_label=type_label),
                    flag=1,
                    position=position,
                )

                if created:
                    current_meta_data.boxes_position.add(new_bb)

    try:
        for input_data in inputFileQuery.all():
            lookfiles(input_data.get_output_path())
            if (input_data.groundtruth):
                INPUT_FILE = os.path.join(settings.BASE_DIR, str(input_data.groundtruth))
                with open(INPUT_FILE, "r") as f:
                    lines = f.readlines()
                    readlines_to_database(lines, input_data.get_output_path())
        return True
    except:
        return False
   
