from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from .views import *

urlpatterns = [
    # Public endpoints
    path('questions/', get_questions, name='questions'),
    path('auth/register/', register, name='register'),
    path('auth/login/', login, name='login'),
    path('auth/profile/', get_profile, name='profile'),
    
    # Upload endpoints (with role protection)
    path('upload_question/', upload_question, name='upload_question'),  # Temporary - remove after auth
    path('boss/upload_question/', boss_upload_question, name='boss_upload_question'),
    path('admin/upload_question/', admin_upload_question, name='admin_upload_question'),
    
    # Boss dashboard endpoints (BOSS only)
    path('boss/questions/', get_questions, name='boss_questions'),
    path('boss/question/<str:question_id>/update/', update_question, name='update_question'),
    path('boss/question/<str:question_id>/delete/', delete_question, name='delete_question'),
    path('boss/stats/', get_question_stats, name='question_stats'),
    path('boss/pending-admins/', boss_get_pending_admins, name='boss_pending_admins'),
    path('boss/approved-admins/', boss_get_approved_admins, name='boss_approved_admins'),
    path('boss/approve-admin/<str:admin_id>/', boss_approve_admin, name='boss_approve_admin'),
    path('boss/create-admin/', boss_create_admin, name='boss_create_admin'),
    
    # Debug endpoints
    path('test/cloudinary/', test_cloudinary, name='test_cloudinary'),
    path('debug/questions/', debug_questions, name='debug_questions'),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
