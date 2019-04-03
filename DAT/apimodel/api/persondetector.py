import time
import os
from django.conf import settings
import torch
import torch.nn as nn
import torch.backends.cudnn as cudnn
from torch.autograd import Variable
import numpy as np
import cv2
if torch.cuda.is_available():
    torch.set_default_tensor_type('torch.cuda.FloatTensor')

from apimodel.DLmodels.SSDModel.ssd import build_ssd
from apimodel.DLmodels.SSDModel.data import BaseTransform

net_p = build_ssd('test', 300, 21)
net_p.load_weights(os.path.join(settings.BASE_DIR, settings.MODELS_DIR, 'ssd300_mAP_77.43_v2.pth'))
transform_p = BaseTransform(net_p.size, (104 / 256.0, 117 / 256.0, 123 / 256.0))
eval_p = net_p.eval()

labelmap = ['aeroplane', 'bicycle', 'bird', 'boat',
    'bottle', 'bus', 'car', 'cat', 'chair',
    'cow', 'diningtable', 'dog', 'horse',
    'motorbike', 'person', 'pottedplant',
    'sheep', 'sofa', 'train', 'tvmonitor']

def persondetAPI(path_image):
  frame = cv2.imread(path_image)
  rgb_image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
  
  start = time.time()
  jsonPersondet = {'faces': []}

  height, width = frame.shape[:2]
  frame_t = transform_p(frame)[0]
  x = torch.from_numpy(frame_t).permute(2, 0, 1)
  x = Variable(x.unsqueeze(0))
  if torch.cuda.is_available():
    x = x.cuda()
  y = eval_p(x)
  detections = y.data
  scale = torch.Tensor([width, height, width, height])
  for i in range(detections.size(1)): # For every class:
    j = 0 # We initialize the loop variable j that will correspond to the occurrences of the class.
    while detections[0, i, j, 0] >= 0.4: # We take into account all the occurrences j of the class i that have a matching score larger than 0.6.
      # print(detections[0, i, j, 0])
      pt = (detections[0, i, j, 1:] * scale).numpy() # We get the coordinates of the points at the upper left and the lower right of the detector rectangle.
      
      if labelmap[i - 1] == 'person':
        if torch.cuda.is_available():
          # pt = (detections[0, i, j, 1:] * scale).cpu().numpy()
          pt = (detections[0, i, j, 1:] * scale).numpy()   
        else:
          pt = (detections[0, i, j, 1:] * scale).numpy()
      
        jsonPersondet['faces'].append({
          'xmin': int(pt[0])/width,
          'ymin': int(pt[1])/height,
          'xmax': int(pt[2])/width,
          'ymax': int(pt[3])/height
        })
      
      j += 1 # We increment j to get to the next occurrence.
  
  end = time.time()
  print("face_locations ssd Execution time: " + str(end-start))

  return jsonPersondet


