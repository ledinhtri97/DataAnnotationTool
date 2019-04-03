from django.shortcuts import render
from django.contrib.auth import views as auth_views
from django.urls import reverse
from django.contrib.auth import logout
# Create your views here.

class LoginUserView(auth_views.LoginView):
   template_name="registration/login.html"

   def get_success_url(self):
      url=self.get_redirect_url()
      if url:
         return url
      else:
         # print(self.request.get_full_path())
         user = self.request.user
         if user.is_superuser:
            if("datadmin/login/" in self.request.get_full_path()):
               return reverse("home")
               # return reverse("datadmin")
            else:
               logout(self.request)
               self.request.session['invalid'] = True
               return reverse("ulogin")
         else:
            if("datuser/login/" in self.request.get_full_path()):
               # return reverse("home")
               return reverse("workspace")
            else:
               logout(self.request)
               self.request.session['invalid'] = True
               return reverse("alogin")
               

   
