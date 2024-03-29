from .base import *

'''Use this for production'''

DEBUG = False
#DEBUG = True
# ALLOWED_HOSTS += ['http://domain.com']
WSGI_APPLICATION = 'DAT.wsgi.prod.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'dat_gvlab',
        'USER': 'gvlab',
        'PASSWORD': 'gvlab@2019',
        'HOST': 'localhost',
        'PORT': '5432',
        'OPTIONS': {
            'sslmode': 'disable'
        }
    }
}

# Password validation
# https://docs.djangoproject.com/en/2.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# STATICFILES_STORAGE = 'whitenoise.django.GzipManifestStaticFilesStorage'
