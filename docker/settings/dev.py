from .base import *

'''Use this for development'''

ALLOWED_HOSTS += ['127.0.0.1']

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
        'USER': 'gvlab_dev',
        'PASSWORD': 'gvlab@2019',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
