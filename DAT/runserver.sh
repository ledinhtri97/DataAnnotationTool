#!/bin/bash
#
#exec python manage.py runserver 0.0.0.0:8787
#service postgresql restart && service rabbitmq-server restart
python3 manage.py runserver --setting=DAT.settings.prod 0.0.0.0:8787&
celery -A DAT worker -l info -P eventlet
