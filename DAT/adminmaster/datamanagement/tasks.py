# Create your tasks here
from __future__ import absolute_import, unicode_literals

from celery import shared_task
import os
from django.conf import settings
from PIL import Image, ImageFont, ImageDraw, ImageEnhance
from adminmaster.datamanagement.submodels.metadata import MetaDataModel
from adminmaster.datamanagement.submodels.boudingbox import BoundingBoxModel
from adminmaster.datamanagement.submodels.labeldata import LabelDataModel
from adminmaster.datamanagement.submodels.dataset import DataSetModel
from adminmaster.datamanagement.submodels.utils.ziprar import ZipRarExtractor

@shared_task
def scanner_dataset(datasetid):

    is_done = False
    while not is_done:
        try:
            dataSetModel = DataSetModel.objects.get(id=datasetid)
            is_done = True
        except:
            print('still not found dataset')
            is_done = False
    inputFileQuery = dataSetModel.input_file
    zipRarer = ZipRarExtractor(inputFileQuery)
    zipRarer.do_extract_all()

    def is_label(v):
        try:
            c = float(v)
            return len(v.split('.')) == 1
        except:
            return True

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
            valid_num_object = 0

            name_file = path_meta[-1]
            full_path_folder = os.path.join(path_origin, '/'.join(path_meta[:-1]))
            try:
                current_meta_data = MetaDataModel.objects.get(
                    dataset=dataSetModel, name=name_file, full_path=full_path_folder
                )
            except:
                continue

            if (current_meta_data.is_reference_api):
                continue

            for no in range(num_obj):
                try:
                    label_str = info_list[current_idx]
                except Exception as e:
                    continue
                current_idx += 1
                index_from = current_idx
                num_xy = 0

                while True:
                    try:
                        if(is_label(info_list[current_idx])):
                            break
                    except Exception as e:
                        break
                    current_idx += 2
                    num_xy += 1

                type_label = 'rect' if num_xy == 2 else 'poly'
                position = ','.join(info_list[index_from:current_idx])
                new_bb, created = BoundingBoxModel.objects.get_or_create(
                     label=LabelDataModel.objects.get(tag_label=label_str, type_label=type_label),
                     flag=1,
                     position=position,
                )
                valid_num_object += 1
                current_meta_data.boxes_position.add(new_bb)
            current_meta_data.is_reference_api = 1
            current_meta_data.save(update_fields=['is_reference_api'])
            if(valid_num_object != num_obj):
                print('{} miss {} objects'.format(path_meta[-1], str(num_obj-valid_num_object)))
    try:
        for input_data in inputFileQuery.all():
            lookfiles(input_data.get_output_path())
            if (input_data.groundtruth):
                INPUT_FILE = os.path.join(settings.BASE_DIR, str(input_data.groundtruth))
                with open(INPUT_FILE, "r") as f:
                    lines = f.readlines()
                    readlines_to_database(lines, input_data.get_output_path())
        print("all file is import successful")
        return True
    except Exception as e:
        print(e)
        return False


@shared_task
def extract_seqframevideo(datasetid):
    is_done = False
    while not is_done:
        try:
            dataSetModel = DataSetModel.objects.get(id=datasetid)
            is_done = True
        except:
            is_done = False

    inputFileQuery = dataSetModel.input_file

    def create_folder(folder_out):
           #check exist then remove
        if (os.path.exists(folder_out)):
            import shutil
            try:
                shutil.rmtree(folder_out)
            except Exception as e:
                print("delete folder error: ", e)
        os.makedirs(folder_out, exist_ok=True)
        return True
    
    def do_extract(videofile, folder_out):
        print(videofile)
        import cv2
        vidcap = cv2.VideoCapture(videofile)
        sec = 0
        frameRate = 1.0/dataSetModel.num_fps  
        #it will capture image in each 1/fps second
        count = 1

        def getFrame(sec):
            vidcap.set(cv2.CAP_PROP_POS_MSEC, sec*1000)
            hasFrames, image = vidcap.read()
            if hasFrames:
                # save frame as JPG file
                file_name = f'{count:09}' + '.jpg'
                print(file_name)
                cv2.imwrite(os.path.join(folder_out, file_name), image)
                is_head = (count - 1) % 4 == 0
                is_tail_merger = (count - 4) % 8 == 0
                MetaDataModel.objects.get_or_create(
                    dataset=dataSetModel, name=file_name, full_path=folder_out,
                    is_head=is_head, is_tail_merger=is_tail_merger,
                )
                
            return hasFrames
        
        success = getFrame(sec)
        while success:
            count = count + 1
            sec = sec + frameRate
            sec = round(sec, 2)
            success = getFrame(sec)
    
    try:
        print(inputFileQuery.all())
        for input_data in inputFileQuery.all():
            print(input_data)
            folder_out = input_data.get_output_path()
            create_folder(folder_out)
            do_extract(input_data.get_full_path_file(), folder_out)
            
            if (input_data.groundtruth):
                INPUT_FILE = os.path.join(
                    settings.BASE_DIR, str(input_data.groundtruth))
                # with open(INPUT_FILE, "r") as f:
                #     lines = f.readlines()
                #     readlines_to_database(lines, input_data.get_output_path())
        print("all file is import successful")
        return True
    except Exception as e:
        print(e)
        return False


@shared_task
def create_thumbnail(metaid):

    meta = MetaDataModel.objects.get(id=metaid)

    def hex_to_rgba(value):
        value = value.lstrip('#')
        lv = len(value)
        return tuple(int(value[i:i + lv // 3], 16) for i in range(0, lv, lv // 3)) + (127,)

    thumb_height = 200
    TINT_COLOR = (0, 0, 0)  # Black
    path_mt = meta.get_full_origin()
    file, ext = os.path.splitext(path_mt)
    thumb = file.replace('storage_data', 'thumbnail')

    try:
        folder = os.path.dirname(thumb)
        os.makedirs(folder)
    except FileExistsError:
        print("Directory ", folder,  " already exists")

    im = Image.open(path_mt)
    im = im.convert("RGBA")
    tmp = Image.new('RGBA', im.size, TINT_COLOR+(0,))

    draw = ImageDraw.Draw(tmp)

    for bb in meta.boxes_position.all():
        positions = bb.position.split(',')
        color = hex_to_rgba(bb.label.color)
        if(len(positions) == 4):
            draw.rectangle(
                ((float(positions[0])*im.size[0], float(positions[1])*im.size[1]),
                (float(positions[2])*im.size[0], float(positions[3])*im.size[1])),
                fill=color)
        else:
            poly = []
            for i in range(0, len(positions), 2):
                poly.append((float(positions[i])*im.size[0],
                                    float(positions[i+1])*im.size[1]))
            draw.polygon(poly, fill=color)
    del draw

    im = Image.alpha_composite(im, tmp)
    im = im.convert("RGB")
    im.thumbnail((im.size[0]*thumb_height/im.size[1],
            thumb_height), Image.ANTIALIAS)
    im.save(thumb + ".thumbnail", "JPEG")
