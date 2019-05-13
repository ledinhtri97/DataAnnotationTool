#!/bin/bash
#
#exec python manage.py runserver 0.0.0.0:8787
python manage.py runserver --setting=DAT.settings.dev 8787
