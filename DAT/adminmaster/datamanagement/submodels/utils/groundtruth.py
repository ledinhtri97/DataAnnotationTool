from django.conf import settings
import os

class GroundTruther(object):
  def __init__(self, outputModel, metas = None):
    self.outputModel = outputModel
    self.metas = metas


  def run(self):
    GROUNDTRUTH_FOMART = self.outputModel.type_groundtruth
    path_file = ''
    if (GROUNDTRUTH_FOMART == 'CSV'):
      path_file = self.with_CSV_format()
    elif (GROUNDTRUTH_FOMART == 'VOC'):
      path_file = self.with_VOC_format()
    
    return path_file


  def with_CSV_format(self):
    import csv
    
    path_file_groundtruth = os.path.join(settings.BASE_DIR, self.outputModel.get_save_file(), 'CSV')
    print(path_file_groundtruth)
    if not os.path.exists(path_file_groundtruth):
      os.makedirs(path_file_groundtruth, exist_ok=True)
      print(" Otput Directory Groundtruth", path_file_groundtruth)

    name_file = self.outputModel.name.replace(' ', '_') + '.csv'
    
    with open(os.path.join(path_file_groundtruth, name_file), mode='w') as csv_file:
      fieldnames = ['meta_path', 'label', 'position']
      writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
      writer.writeheader()
      for meta in self.metas:
        meta_path = meta.get_rel_path()
        for bb in meta.boxes_position.all():
          label = bb.label.tag_label
          position = bb.position
          writer.writerow(
              {'meta_path': meta_path, 'label': label, 'position': position})

    return path_file_groundtruth

  def with_VOC_format(self):
    import os
    import xml.etree.cElementTree as ET
    from PIL import Image

    path_file_groundtruth = os.path.join(settings.BASE_DIR, self.outputModel.get_save_file(), 'VOC')
    if not os.path.exists(path_file_groundtruth):
      os.makedirs(path_file_groundtruth, exist_ok=True)
      print(" Otput Directory Groundtruth", path_file_groundtruth)

    DESTINATION_DIR = path_file_groundtruth

    def create_root(file_name, folder, width, height):
      root = ET.Element("annotations")
      ET.SubElement(root, "filename").text = file_name
      ET.SubElement(root, "folder").text = folder
      size = ET.SubElement(root, "size")
      ET.SubElement(size, "width").text = str(width)
      ET.SubElement(size, "height").text = str(height)
      ET.SubElement(size, "depth").text = "3"
      return root
    
    def create_object_annotation(root, namelabel, position):
      obj = ET.SubElement(root, "object")
      ET.SubElement(obj, "name").text = namelabel
      ET.SubElement(obj, "pose").text = "Unspecified"
      ET.SubElement(obj, "truncated").text = str(0)
      ET.SubElement(obj, "difficult").text = str(0)
      bbox = ET.SubElement(obj, "bndbox")
      ET.SubElement(bbox, "xmin").text = str(position[0])
      ET.SubElement(bbox, "ymin").text = str(position[1])
      ET.SubElement(bbox, "xmax").text = str(position[2])
      ET.SubElement(bbox, "ymax").text = str(position[3])
      return root
    
    for meta in self.metas:
      file_prefix = meta.name.split('.')[0]
      img = Image.open(meta.get_full_origin())
      w, h = img.size
      folder = '/'.join(meta.full_path.split('/')[1:])
      root = create_root(meta.name, folder, w, h)
      
      for meta in self.metas:
        meta_path = meta.get_rel_path()
        for bb in meta.boxes_position.all():
          if bb.label.type_label == 'rect':
            root = create_object_annotation(
                root, bb.label.tag_label, bb.position.split(','))

      tree = ET.ElementTree(root)
      tree.write("{}/{}.xml".format(DESTINATION_DIR, file_prefix)) 

    return path_file_groundtruth    
  
