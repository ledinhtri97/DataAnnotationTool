"""
WSGI config for DAT project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/2.1/howto/deployment/wsgi/
"""

import os
from django.conf import settings

from django.core.wsgi import get_wsgi_application
from whitenoise import WhiteNoise

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DAT.settings.prod')

application = get_wsgi_application()
application = WhiteNoise(application, root=settings.STATIC_ROOT, prefix=settings.STATIC_URL)
application.add_files(settings.STORAGE_ROOT, prefix=settings.STORAGE_URL)
application.add_files(settings.OUTPUT_ROOT, prefix=settings.OUTPUT_URL)
# application.add_files(settings.ICONS_ROOT, prefix=settings.ICONS_URL)
