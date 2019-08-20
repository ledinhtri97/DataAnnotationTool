import cv2
import os
import random

# gt_file = "./DAT/_DATABASE_/groundtruth/11/11_tr/TXT/tracking_mode.txt"
gt_file = "./DAT/_DATABASE_/groundtruth/12/12_tracking_1fps/TXT/ff.txt"
root_folder = "./DAT/_DATABASE_/storage_data/"
resutl_folder = "./OUT_2/"
TINT_COLOR = (0, 0, 0)  # Black
FPS = 2

with open(gt_file, 'r') as f:
    lines = f.readlines()
    f.close()


def hex_to_rgba(value):
    value = value.lstrip('#')
    lv = len(value)
    return tuple(int(value[i:i + lv // 3], 16) for i in range(0, lv, lv // 3)) + (127,)

# Video Generating function


def last_12chars(x):
    return(x[-12:])

def generate_video():
    # make sure to use your folder
    image_folder = './OUT_2/'
    video_name = resutl_folder+'0_mygeneratedvideo.avi'

    images = [img for img in os.listdir(image_folder)
              if img.endswith(".jpg") or
              img.endswith(".jpeg") or
              img.endswith("png")]

    images = sorted(images, key=last_12chars)

    # Array images should only consider
    # the image files ignoring others if any
    print(images)

    frame = cv2.imread(os.path.join(image_folder, images[0]))

    # setting the frame width, height width
    # the width, height of first image
    height, width, layers = frame.shape

    video = cv2.VideoWriter(video_name, 0, FPS, (width, height))

    # Appending the images to the video one by one
    for image in images:
        video.write(cv2.imread(os.path.join(image_folder, image)))

    # Deallocating memories taken for window creation
    cv2.destroyAllWindows()
    video.release()  # releasing the video generated

# Calling the generate_video function
# 

COLOR_T = {

}

def make_color(label):
    COLOR_T[label] = "#"+''.join([random.choice('0123456789ABCDEF') for j in range(6)])

def is_float(gt, v):
    try:
        e = gt[v].split('.')
        if len(e) == 2:
            int(e[0])
            int(e[1])
            return True
        else:
            return False
    except:
        return False

# lines = []

for line in lines:
    spline = line.replace('\n', '').split(',')
    path_img = root_folder+spline[0]
    name_img = path_img.split('/')[-1]
    num_objs = int(spline[1])
    gt = spline[2:]

    img = cv2.imread(path_img)
    h, w, _ = img.shape

    cur_index = 0
    for i in range(num_objs):
        label = gt[cur_index]
        if label not in COLOR_T:
            make_color(label)
        color = hex_to_rgba(COLOR_T[label])

        if not is_float(gt, cur_index+1):
            continue 
        points = []
        cur_index += 1
        is_stop = True

        while is_float(gt, cur_index):
            points.append((float(gt[cur_index]) * w, float(gt[cur_index+1]) * h))
            cur_index += 2

        if len(points) == 2:
            cv2.rectangle(img, (int(points[0][0]), int(points[0][1])),
                (int(points[1][0]), int(points[1][1])), color, 2)
        else:
            print('a')
            pass
        cv2.imwrite(resutl_folder+name_img, img)
        
    
generate_video()
