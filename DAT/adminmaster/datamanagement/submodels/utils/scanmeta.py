from django.conf import settings
import os

class ScanMetaToDatabase(object):

   def __init__(self, dataSetModel, input_file_query):
      # print(dataSetModel, "object")
      self.dataSetModel = dataSetModel
      self.dir_path = dataSetModel.get_dir_path()
      self.input_files = input_file_query.all()

      self.ACCEPTED_FILE = [
          'jpeg', 'jpg', 'png', 'JPG', 'PNG', 'tif'
      ]
      # self.scanFolders()
   
   def scan_all_into_database(self):
      folders_availiable = self.scan_folders()
      self.lookfiles(folders_availiable)

   def lookfiles(self, full_path_folders):
      for eachFolderRoot in full_path_folders:
         # print(1, eachFolderRoot)
         for xxxfile in os.listdir(
            os.path.join(settings.STORAGE_DIR, eachFolderRoot)):
            # print(2, xxxfile)
            if self.check_valid_file(xxxfile):
               # print(os.path.join(eachFolderRoot, xxxfile))
               
               """Do some shit stuff here"""
               from adminmaster.datamanagement.submodels.metadata import MetaDataModel
               
               temp = MetaDataModel.objects.get_or_create(
                   dataset=self.dataSetModel,
                   name=xxxfile,
                   full_path=eachFolderRoot
               )
               # print(temp)
               """end job"""
            elif (os.path.isdir(os.path.join(settings.STORAGE_DIR, eachFolderRoot, xxxfile))):
               # print("Next Directory: ", os.path.join(eachFolderRoot, xxxfile))
               self.lookfiles(
                  [os.path.join(eachFolderRoot, xxxfile)]
               )

   def check_valid_file(self, xxxfile):
      return xxxfile.split('.')[-1] in self.ACCEPTED_FILE


   def scan_folders(self):

      folders_availiable = []

      for input_name in self.input_files:
         dir_name = os.path.join(
            self.dir_path,
            str(input_name).split('.')[0]
         )
         #may be need to check vaild path for sure
         # print(dir_name)
         folders_availiable.append(dir_name)
      

      return folders_availiable

   

   



