# import os
# from django.conf import settings
# from apimodel.DLmodels.SSDModel.ssd import build_ssd
# from apimodel.DLmodels.SSDModel.data import BaseTransform

# net_1 = build_ssd('test', 300, 2)
# net_1.load_weights(os.path.join(settings.BASE_DIR, settings.MODELS_DIR, 'ssd300_WIDERFACE_115000.pth'))
# transform_1 = BaseTransform(net_1.size, (104 / 256.0, 117 / 256.0, 123 / 256.0))
# eval_1 = net_1.eval()
# labelmap_1 = ['face']
# combo_1 = [labelmap_1, eval_1, transform_1]

# net_2 = build_ssd('test', 300, 21)
# net_2.load_weights(os.path.join(settings.BASE_DIR, settings.MODELS_DIR, 'ssd300_mAP_77.43_v2.pth'))
# transform_2 = BaseTransform(net_2.size, (104 / 256.0, 117 / 256.0, 123 / 256.0))
# eval_2 = net_2.eval()
# labelmap_2 = ['aeroplane', 'bicycle', 'bird', 'boat',
#     'bottle', 'bus', 'car', 'cat', 'chair',
#     'cow', 'diningtable', 'dog', 'horse',
#     'motorbike', 'person', 'pottedplant',
#     'sheep', 'sofa', 'train', 'tvmonitor']
# combo_2 = [labelmap_2, eval_2, transform_2]