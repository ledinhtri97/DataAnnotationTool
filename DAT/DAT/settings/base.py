"""
Django settings for DAT project.

Generated by 'django-admin startproject' using Django 2.1.7.

For more information on this file, see
https://docs.djangoproject.com/en/2.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/2.1/ref/settings/
"""

import os

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))))

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/2.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '0y-&317-nci0rqo+fe&9^7m$fsrmy@vx#q!ar-grrj=!d-qx(3'

ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'hpcc.hcmut.edu.vn', '172.28.182.130', '172.28.183.160', '221.133.13.124']

# Application definition

INSTALLED_APPS = [
    # 'whitenoise.runserver_nostatic',

    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',

    'django_extensions',
    'colorfield',
    'progressbarupload',
    'rest_framework',
    'crispy_forms',
    'home',
    'adminmaster',
    'adminmaster.datamanagement',
    'adminmaster.contributemanagement',
    'adminmaster.workspacemanagement',
    'usermaster',
    'apimodel',
    # 'deeplearning',
]

CRISPY_TEMPLATE_PACK = 'bootstrap4'

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',

    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
]

ROOT_URLCONF = 'DAT.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# Internationalization
# https://docs.djangoproject.com/en/2.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Asia/Ho_Chi_Minh'

USE_I18N = True

USE_L10N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/2.1/howto/static-files/

STATIC_URL = '/gvlab-dat/static/'

STATIC_ROOT = os.path.join(BASE_DIR, 'templates', 'static')

# STATICFILES_DIRS = (
#     # os.path.join(BASE_DIR, "templates"),
#     # os.path.join(BASE_DIR, 'static'),
# )

# """
# Our login functionality now works but to make it better we
# should specify where to redirect the user upon a successful login. 
# In other words, once a user has logged in,
# where should they be sent on the site?
# We use the LOGIN_REDIRECT_URL setting to specify this route
# """

LOGIN_REDIRECT_URL = 'home'
LOGOUT_REDIRECT_URL = 'home'

UPLOAD_DIR = os.path.join('_DATABASE_', 'upload_data')

UPLOAD_URL = '/gvlab-dat/upload/'

UPLOAD_ROOT = os.path.join(BASE_DIR, UPLOAD_DIR)

STORAGE_DIR = os.path.join('_DATABASE_', 'storage_data')

STORAGE_URL = '/gvlab-dat/dataset/'

STORAGE_ROOT = os.path.join(BASE_DIR, STORAGE_DIR)

OUTPUT_DIR = os.path.join('_DATABASE_', 'groundtruth')

OUTPUT_URL = '/gvlab-dat/export-groundtruth/'

OUTPUT_ROOT = os.path.join(BASE_DIR, OUTPUT_DIR)

MODELS_DIR = os.path.join('_DATABASE_', 'storage_models')

REST_FRAMEWORK = {
    # Use Django's standard `django.contrib.auth` permissions,
    # or allow read-only access for unauthenticated users.
    # 'DEFAULT_PERMISSION_CLASSES': [
    #     'rest_framework.permissions.DjangoModelPermissionsOrAnonReadOnly'
    # ]
    # 'DEFAULT_FILTER_BACKENDS': ('django_filters.rest_framework.DjangoFilterBackend',)
    # 'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.TemplateHTMLRenderer',
        'rest_framework.renderers.JSONRenderer',
    ),
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication'
    ]
    # 'PAGE_SIZE': 10,
}

FILE_UPLOAD_HANDLERS = (
    "progressbarupload.uploadhandler.ProgressBarUploadHandler",
    "django.core.files.uploadhandler.MemoryFileUploadHandler",
    "django.core.files.uploadhandler.TemporaryFileUploadHandler",
)

PROGRESSBARUPLOAD_INCLUDE_JQUERY = True

FLAG_CUDA = False

SLUG_API_URL = 'api-get-data/'

NUM_USER_SKIP_AVAILABLE = 2

GRAPH_MODELS = {
    'all_applications': True,
    'group_models': True,
}

CORS_ORIGIN_ALLOW_ALL = True
CORS_ALLOW_CREDENTIALS = True
