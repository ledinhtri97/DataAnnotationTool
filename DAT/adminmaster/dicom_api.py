import os
import requests
import base64


class DICOMRESTApi():
    def __init__(self, url, username='orthanc', password='orthanc'):
        self.url = url
        self.headers = {}
        token = username + ':' + password
        self.headers['authorization'] = 'Basic ' + base64.b64encode(token.encode('utf-8')).decode()

    def get_patients(self):
        patients = []
        req = requests.get(os.path.join(self.url, 'patients'))
        if req.status_code == 200:
            patients = req.json()

        return patients

    def get_patient(self, id):
        patient = None
        req = requests.get(os.path.join(self.url, 'patients', id))
        if req.status_code == 200:
            patient = req.json()

        return patient

    def send_dicom_file(self, filename):
        return requests.post(self.url, files=[('file', open(filename, 'rb'))], headers=self.headers, verify=False)    

    def get_study(self, id):
        study = None
        req = requests.get(os.path.join(self.url, 'studies', id))
        if req.status_code == 200:
            study = req.json()

        return study

    def get_studies(self):
        studies = []
        req = requests.get(os.path.join(self.url, 'studies'))
        if req.status_code == 200:
            studies = req.json()

        return studies
    
    def get_seri(self, id):
        seri = None
        req = requests.get(os.path.join(self.url, 'series', id))
        if req.status_code == 200:
            seri = req.json()

        return seri

    def get_instance(self, id):
        instance = None
        req = requests.get(os.path.join(self.url, 'instances', id))
        if req.status_code == 200:
            instance = req.json()

        return instance