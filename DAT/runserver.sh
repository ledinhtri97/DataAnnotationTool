#!/bin/bash
sudo kill -9 $(sudo lsof -t -i:8080)
exec python manage.py runserver 0.0.0.0:8080
