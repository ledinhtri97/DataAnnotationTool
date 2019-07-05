from django.conf import settings
import os
import cv2
charos = '\\' if os.name == 'nt' else '/'

class ScanMetaToDatabase(object):

   def __init__(self, dataSetModel, input_file_query):
      # print(dataSetModel, "object")
      self.dataSetModel = dataSetModel
      self.input_files = input_file_query.all()

      self.ACCEPTED_FILE = [
          'jpeg', 'jpg', 'png', 'JPG', 'PNG', 'tif'
      ]
      self.ACCEPTED_GT = [
         'txt', 'csv'
      ]
      # self.scanFolders()
   
   def scan_all_into_database(self):
      folders_availiable = self.scan_folders()
      for fa in folders_availiable:
         self.lookfiles(fa['inputfile'])
         if(fa['groundtruth']):
            # print(fa['groundtruth'])
            try:
               INPUT_FILE = os.path.join(settings.BASE_DIR, str(fa['groundtruth']))
               with open(INPUT_FILE, "r") as f:
                  lines = f.readlines()
               self.readlines_to_database(lines, fa['inputfile'])
            except Exception as e:
               print(e)
            

   
   def readlines_to_database(self, lines, path_origin):
      from adminmaster.datamanagement.submodels.metadata import MetaDataModel
      from adminmaster.datamanagement.submodels.boudingbox import BoundingBoxModel
      from adminmaster.datamanagement.submodels.labeldata import LabelDataModel

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
            
            full_path_folder = os.path.join(path_origin, '/'.join(path_meta[:-1]))

            new_bb, created = BoundingBoxModel.objects.get_or_create(
				   label=LabelDataModel.objects.get(tag_label=label_str, type_label=type_label),
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
               

   def lookfiles(self, full_path_folder):
      folders = os.listdir(os.path.join(settings.STORAGE_DIR, full_path_folder))
      for xxxfile in folders:
         if self.check_valid_file(xxxfile):
            """Do something here"""
            from adminmaster.datamanagement.submodels.metadata import MetaDataModel

            temp = MetaDataModel.objects.get_or_create(
                  dataset=self.dataSetModel, name=xxxfile, full_path=full_path_folder
               )
               
            """end job"""
         elif (os.path.isdir(os.path.join(settings.STORAGE_DIR, full_path_folder, xxxfile))): 
            self.lookfiles(os.path.join(full_path_folder, xxxfile))

   def check_valid_file(self, xxxfile):
      return xxxfile.split('.')[-1] in self.ACCEPTED_FILE

   def scan_folders(self):
      folders_availiable = []
      for input_data in self.input_files:
         dir_name = {
            'inputfile': input_data.get_output_path(),
            'groundtruth': input_data.groundtruth,
         }

         folders_availiable.append(dir_name)
      
      # print(folders_availiable)
      return folders_availiable

   

   



