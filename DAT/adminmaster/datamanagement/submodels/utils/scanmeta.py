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
         self.lookfiles(fa['inputfile'], False)
         # if(fa['groundtruth']):
         #    self.lookfiles(fa['groundtruth'], True)

   def lookfiles(self, full_path_folder, type_file):
      # m = 100 if t == 0 else 5
      store_folder = settings.OUTPUT_DIR if (type_file) else settings.STORAGE_DIR
      folders = os.listdir(os.path.join(store_folder, full_path_folder))

      for xxxfile in folders:
         if self.check_valid_file(xxxfile, type_file):
            """Do some shit stuff here"""
            from adminmaster.datamanagement.submodels.metadata import MetaDataModel
            
            # if (type_file):#groundtruth
            #    # print(xxxfile, type_file)
            #    temp = MetaDataModel.objects.filter(
            #          dataset=self.dataSetModel,
            #          name=xxxfile.split('.')[0]
            #    ).first()
            #    try:
            #       # print(temp, temp.get_full_origin())
            #       with open(os.path.join(settings.BASE_DIR, store_folder, full_path_folder, xxxfile), "r") as f:
            #          bbs = ""
            #          print(temp.get_full_origin())
            #          img =  cv2.imread(temp.get_full_origin())
            #          height, width = img.shape[:2]
            #          for line in f:
            #             bb = line.split('\n')[0].split(',')
            #             if(len(bb)==8):
            #                bbs += ','.join([
            #                   'text',
            #                   str(float(bb[0])/width),
            #                   str(float(bb[1])/height),
            #                   str(float(bb[2])/width),
            #                   str(float(bb[3])/height),
            #                   str(float(bb[4])/width),
            #                   str(float(bb[5])/height),
            #                   str(float(bb[6])/width),
            #                   str(float(bb[7])/height),
            #                ])+'\n'
            #       # print(bbs)
            #       temp.boxes_position = bbs
            #       temp.save(update_fields=['boxes_position'])

            #    except Exception as e:
            #       print(e)

            # else: #tab
            temp = MetaDataModel.objects.get_or_create(
                  dataset=self.dataSetModel,
                  name=xxxfile,
                  full_path=full_path_folder
               )
            """end job"""
         elif (os.path.isdir(os.path.join(store_folder, full_path_folder, xxxfile))): 
            self.lookfiles(os.path.join(full_path_folder, xxxfile), type_file)

   def check_valid_file(self, xxxfile, type_file):
      ACCEPTED = self.ACCEPTED_GT if (type_file) else self.ACCEPTED_FILE
      return xxxfile.split('.')[-1] in ACCEPTED

   def scan_folders(self):
      folders_availiable = []
      for input_data in self.input_files:
         dir_name = {
            'inputfile': input_data.get_output_path(),
            'groundtruth': None
            #'groundtruth': input_data.get_output_path() if (input_data.get_gtname()) else None
         }
         #may be need to check vaild path for sure

         folders_availiable.append(dir_name)
      
      print(folders_availiable)
      return folders_availiable

   

   



