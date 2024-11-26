from django.urls import path
from . import views
from .views import register, signin, store_connection, upload_document 
from django.http import JsonResponse

def debug_catch_all(request):
    return JsonResponse({"message": f"Request reached: {request.path}"})

urlpatterns = [
    path('', views.home_page, name='home_page'),
    path('about-us/', views.about_us_page, name='about_us_page'),
    path('agents/', views.agents_page, name='agents_page'),
    path('agent_detail/<int:agent_id>/', views.agent_detail, name='agent_detail'),
    path('terms/', views.terms_page, name='terms_page'),
    path('privacy/', views.privacy_page, name='privacy_page'),
    path('create/', views.create_page, name='create_page'),
    path('create_agent/', views.create_agent, name='create_agent'),
    path('delete_agent/', views.delete_agent, name='delete_agent'),
    path('upload_document/', upload_document, name='upload_document'),
    path('workflow/', views.workflow_page, name='workflow_page'),
    path('register/', views.register, name='register'),
    path('signin/', views.signin, name='signin'),
    path('store_connection/', store_connection, name='store_connection'),
    path('logout/', views.logout_view, name='logout'),
    path('<path:path>', debug_catch_all),  # Catch all other paths
]
