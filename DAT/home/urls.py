#!/usr/bin/python
"""DAT URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.urls import path, include
from django.views.generic.base import TemplateView
from django.contrib.auth import views as auth_views
from .views import LoginUserView

urlpatterns = [
    path('', TemplateView.as_view(template_name='home.html'), name='home'),
    path('datuser/login/', LoginUserView.as_view(
        template_name='registration/userlogin.html'), name='ulogin'),
    path('datadmin/login/', LoginUserView.as_view(
        template_name='registration/adminlogin.html'), name='alogin'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'), 
]
