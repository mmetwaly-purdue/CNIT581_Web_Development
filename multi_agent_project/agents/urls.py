from django.urls import path
from . import views
from .views import register, signin, store_connection, upload_document 

urlpatterns = [
    path('', views.home_page, name='home_page'),
    path('about-us/', views.about_us_page, name='about_us_page'),
    path('agents/', views.agents_page, name='agents_page'),
    path('agent_detail/', views.agent_detail, name='agents_detailed'),
    path('terms/', views.terms_page, name='terms_page'),
    path('privacy/', views.privacy_page, name='privacy_page'),
    path('create/', views.create_page, name='create_page'),
    path('create_agent/', views.create_agent, name='create_agent'),
    path('delete_agent/', views.delete_agent, name='delete_agent'),
    path('upload_document/', upload_document, name='upload_document'),
    path('workflow/', views.workflow_page, name='workflow_page'),
    path('register/', register, name='register'),
    path('signin/', signin, name='signin'),
    path('store_connection/', store_connection, name='store_connection'),
]
