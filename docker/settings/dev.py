from .base import *

'''Use this for development'''

ALLOWED_HOSTS += ['*']

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

WSGI_APPLICATION = 'DAT.wsgi.dev.application'
# Database
# https://docs.djangoproject.com/en/2.1/ref/settings/#databases

# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
#     }
# }

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'docker_dat_gvlab_dev',
        'USER': 'docker_gvlab_dev',
        'PASSWORD': 'gvlab@2019',
        'HOST': 'db',
        'PORT': '5432',
    }
}

DICOM_SERVER = {
    'BASE_URL': 'http://172.28.182.130:8042',
    'USERNAME': 'orthanc',
    'PASSWORD': 'orthanc'
}

DICOM_ANALYSIS_SERVER = {
    'STORAGE_URL': 'http://172.28.182.144:8010',
}