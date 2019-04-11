#!/bin/bash
sudo kill -9 $(sudo lsof -t -i:8787)
exec python manage.py runserver 0.0.0.0:8787
