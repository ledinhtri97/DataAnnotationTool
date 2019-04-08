# import zip file.
import zipfile
# import rarfile
import rarfile
# for path checking.
import os.path
# deleting directory.
import shutil
from adminmaster.datamanagement.models import DataSetModel
from django.conf import settings

class ZipRarExtractor(object):
    def __init__(self, inputDataModels, dir_path):
        self.inputDataModels = inputDataModels
        self.dir_path = dir_path

    def do_extract_all(self):
        # print(self.inputDataModels, "=======================")
        for input_file in self.inputDataModels.all():
            
            file_zip = input_file.get_zipname()
            # print(file_zip)
            input = os.path.join(
                settings.BASE_DIR,
                settings.UPLOAD_DIR,
                file_zip
            )

            output = os.path.join(
                settings.BASE_DIR,
                settings.STORAGE_DIR,
                self.dir_path,
                file_zip.split('.')[0]
            )

            self.extract_file(input, output)

            file_gt = input_file.get_gtname()
            if (file_gt):
                input = os.path.join(
                    settings.BASE_DIR,
                    settings.OUTPUT_DIR,
                    file_gt
                )

                output = os.path.join(
                    settings.BASE_DIR,
                    settings.OUTPUT_DIR,
                    self.dir_path,
                    file_gt.split('.')[0]
                )

                print(input)
                print(output)
                self.extract_file(input, output)



    def extract_file(self, input, output):
        '''
        check the file is an archive file or not.
        if the file is an archive file just extract it using the proper extracting method.
        '''
        # check if it is a zip file or not.
        if (input.endswith('.zip') or input.endswith('.rar')):
            # chcek the file is present or not .
            if os.path.isfile(input):
                # create a directory at the same location where file will be extracted.
                # output_directory_location = loc.split('.')[0]
                output_directory_location = output
                # if os path not exists .
                remove_old = '/'.join(output_directory_location.split('/')[:-1])
                if not os.path.exists(remove_old):
                    # create directory .
                    os.makedirs(output_directory_location, exist_ok=True)
                    print(" Otput Directory ", output_directory_location)
                    # extract
                    if input.endswith('.zip'):
                        self.extractzip(input, output_directory_location)
                    else:
                        self.extractrar(input, output_directory_location)
                else:
                    # Directory allready exist.
                    print("Otput Directory ", output_directory_location)
                    # deleting previous directoty .
                    print("Deleting old Otput Directory ")
                    # Try to remove tree; if failed show an error using try...except on screen
                    try:
                        # delete the directory .
                        
                        # print(remove_old)
                        shutil.rmtree(remove_old)
                        # delete success
                        print("Delete success now extracting")
                        # extract
                        # extract
                        if input.endswith('.zip'):
                            self.extractzip(input, output_directory_location)
                        else:
                            self.extractrar(input, output_directory_location)
                    except OSError as e:
                        print("Error: %s - %s." % (e.filename, e.strerror))
            else:
                print("File not located to this path")
        else:
            print("File do not have any archrive structure.")


    def extractzip(self, loc, outloc):
        '''
        using the zipfile tool extract here .
        This function is valid if the file type is zip only
        '''
        with zipfile.ZipFile(loc, "r") as zip_ref:
            # iterate over zip info list.
            for item in zip_ref.infolist():
                zip_ref.extract(item, outloc)
            # once extraction is complete
            # check the files contains any zip file or not .
            # if directory then go through the directoty.
            zip_files = [
                files for files in zip_ref.filelist if files.filename.endswith('.zip')]
            # print other zip files
            # print(zip_files)
            # iterate over zip files.
            for file in zip_files:
                # iterate to get the name.
                new_loc = os.path.join(outloc, file.filename)
                # new location
                # print(new_loc)
                # start extarction.
                # check_archrive_file(new_loc)
            # close.
            zip_ref.close()

    def extractrar(self, loc, outloc):
        '''
        using the rarfile tool extract here .
        this function is valid if the file type is rar only
        '''
        # check the file is rar or not
        if(rarfile.is_rarfile(loc)):
            with rarfile.RarFile(loc, "r") as rar_ref:
                # iterate over zip info list.
                for item in rar_ref.infolist():
                    rar_ref.extract(item, outloc)
                # once extraction is complete
                # get the name of the rar files inside the rar.
                rar_files = [file for file in rar_ref.infolist() 
                if file.filename.endswith('.rar')]
                # iterate
                for file in rar_files:
                    # iterate to get the name.
                    new_loc = os.path.join(outloc, file.filename)
                    # new location
                    # print(new_loc)
                    # start extarction.
                    # check_archrive_file(new_loc)
                # close.
                rar_ref.close()
        else:
            print("File "+loc+" is not a rar file")
