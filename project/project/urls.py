from django.contrib import admin
from django.urls import path, include
from django.urls import path, re_path
from django.views.generic import TemplateView
from django.http import HttpResponse

def ping(request):
    return HttpResponse("pong")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('reflecta.urls')),
    path('ping/', ping),
    
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
]

