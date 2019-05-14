#!/usr/bin/env python3
from django.contrib.auth.models import User

# check and create super user
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@gvlab.org', 'gvlab@2019')
