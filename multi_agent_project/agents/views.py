from django.shortcuts import render
from django.http import JsonResponse, HttpResponseRedirect
import json
from django.contrib.auth.models import User
from django.db import IntegrityError
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login
from .models import Document, CustomUser
from django.contrib.auth.decorators import login_required
from django.urls import reverse
from .utils import agent_list, allowed_file, Agent


# Create your views here.
def about_us_page(request):
    return render(request, 'about_us_page.html')

def home_page(request):
    return render(request, 'homepage.html')

def privacy_page(request):
    return render(request, 'privacy.html')

def terms_page(request):
    return render(request, 'terms.html')

def create_page(request):
    return render(request, 'create.html')

@login_required
def workflow_page(request):
    user_id = request.user.id
    documents = Document.objects.filter(user_id=user_id)
    return render(request, 'user_workflow_page.html', {'documents': documents, 'logged_in': True})

def agents_page(request):
    agents_data = agent_list  # Assuming agent_list is pre-defined as a Python list
    return render(request, 'agents_page.html', {'agents': agents_data})

def agent_detail(request, agent_id):
    try:
        agent = agent_list[agent_id]
        return render(request, 'agents_detailed_page.html', {'agent': agent})
    except IndexError:
        return render(request, '404.html')  # Render a 404 page if the agent is not found

def create_agent(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"message": "No data received"}, status=400)

        # Extract data and validate
        agent_name = data.get('name')
        agent_type = data.get('type')
        agent_description = data.get('description')

        if not agent_name or not agent_type or not agent_description:
            return JsonResponse({"message": "Missing required fields"}, status=400)

        # Assuming agent_list is globally available or implement logic to save agent
        agent_list.append({
            "name": agent_name,
            "type": agent_type,
            "description": agent_description
        })

        return JsonResponse({"message": "Agent created successfully"}, status=201)

def delete_agent(request, agent_id):
    if request.method == 'DELETE':
        try:
            agent_list.pop(agent_id)
            return JsonResponse({"message": "Agent deleted successfully"}, status=200)
        except IndexError:
            return JsonResponse({"message": "Agent not found"}, status=404)

def upload_document(request):
    if request.method == 'POST' and request.FILES.get('file'):
        file = request.FILES['file']
        agent_name = request.POST.get('agent_name')
        user_id = request.user.id

        # Logic to read and save file content
        file_content = file.read().decode('utf-8')  # Assuming text files
        document = Document(agent_name=agent_name, doc_name=file.name, doc_content=file_content, user_id=user_id)
        document.save()

        return HttpResponseRedirect(reverse('workflow_page'))
    else:
        return JsonResponse({"error": "No file uploaded"}, status=400)
                    
@csrf_exempt
def register(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"message": "No data received"}, status=400)

        username = data.get('username')
        password = data.get('password')
        email = data.get('email')

        if not username or not password or not email:
            return JsonResponse({"message": "Missing fields"}, status=400)

        try:
            new_user = User.objects.create_user(username=username, password=password, email=email)
            return JsonResponse({"message": "User registered successfully", "username": username}, status=201)
        except IntegrityError:
            return JsonResponse({"message": "Username or email already exists"}, status=400)
    else:
        return JsonResponse({"message": "Invalid request method"}, status=405)
    
@csrf_exempt
def signin(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"message": "No data received"}, status=400)

        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return JsonResponse({"message": "Missing fields"}, status=400)

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)  # Log in the user (Django handles sessions automatically)
            return JsonResponse({"message": "Signed in successfully"}, status=200)
        else:
            return JsonResponse({"message": "Invalid credentials"}, status=401)
    else:
        return JsonResponse({"message": "Invalid request method"}, status=405)

all_connections = []

@csrf_exempt
def store_connection(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"message": "No data received"}, status=400)

        button_pressed = data.get('button')
        connection_text = data.get('connection_text')

        if button_pressed and connection_text:
            formatted_connection = f"{button_pressed} - {connection_text}\n"
            all_connections.append(formatted_connection)
            return JsonResponse({"message": "Connection stored successfully"}, status=200)
        else:
            return JsonResponse({"message": "Invalid data"}, status=400)
    else:
        return JsonResponse({"message": "Invalid request method"}, status=405)