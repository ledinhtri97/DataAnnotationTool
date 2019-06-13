# """DAT URL Configuration

# The `urlpatterns` list routes URLs to views. For more information please see:
#     https://docs.djangoproject.com/en/2.1/topics/http/urls/
# Examples:
# Function views
#     1. Add an import:  from my_app import views
#     2. Add a URL to urlpatterns:  path('', views.home, name='home')
# Class-based views
#     1. Add an import:  from other_app.views import Home
#     2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
# Including another URLconf
#     1. Import the include() function: from django.urls import include, path
#     2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
# """
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from usermaster.subviews.change_pass import change_password
from django.contrib import admin

admin.site.site_title = "Data Annotation Tool - GVLab"
admin.site.site_header = "Data Annotation Tool - GVLab - Adminsite"

urlpatterns = [
    # path('accounts/', include('django.contrib.auth.urls')),
    path('', include('home.urls')),
    path('datadmin/', include('adminmaster.urls')),
    path('workspace/', include('usermaster.urls')),
    path('change_password/', change_password, name='change_password'),
    path('progressbarupload/', include('progressbarupload.urls')),
]

urlpatterns = [
    path('gvlab-dat/', include(urlpatterns))
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) + \
    static(settings.STORAGE_URL, document_root=settings.STORAGE_ROOT) + \
    static(settings.OUTPUT_URL, document_root=settings.OUTPUT_ROOT) + \
    static(settings.UPLOAD_URL, document_root=settings.UPLOAD_ROOT) + \
    static(settings.THUMBNAIL_URL, document_root=settings.THUMBNAIL_ROOT)
