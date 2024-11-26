from django.shortcuts import render
from django.http import JsonResponse, HttpResponseRedirect, HttpResponse
import json
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model, authenticate, login, logout
from .models import Document, CustomUser
from django.contrib.auth.decorators import login_required
from django.urls import reverse
from .utils import agent_list, allowed_file, Agent
from django.utils.safestring import mark_safe

User = get_user_model()

# Create your views here.
def about_us_page(request):
    return render(request, 'about_us_page.html')

def home_page(request):
    print("Rendering homepage.html")
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
    sort_order = request.GET.get('sort', 'asc')  # Default sorting order is ascending
    sorted_agents = sorted(agent_list, key=lambda x: x['name'], reverse=(sort_order == 'desc'))
    return render(request, 'agents_page.html', {'agents': sorted_agents, 'sort_order': sort_order})

def agent_detail(request, agent_id):
    try:
        agent_id = int(agent_id)
        agent = next((agent for agent in agent_list if int(agent['id']) == agent_id), None)

        if agent:
            return render(request, 'agents_detailed_page.html', {'agent': agent})
        else:
            return HttpResponse("Agent not found", status=404)
    except (ValueError, TypeError):
        return HttpResponse("Invalid agent ID", status=400)

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

@csrf_exempt
def delete_agent(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            agent_id = data.get('agent_id')

            # Find and delete agent by ID
            global agent_list
            agent_list = [agent for agent in agent_list if agent['id'] != agent_id]

            return JsonResponse({"message": "Agent deleted successfully."}, status=200)
        except Exception as e:
            return JsonResponse({"message": f"Error deleting agent: {str(e)}"}, status=500)
    return JsonResponse({"message": "Invalid request method."}, status=405)

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
                  
def register(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            first_name = data.get('first_name')
            last_name = data.get('last_name')
            password = data.get('password')

            # Validate fields
            if not email or not first_name or not last_name or not password:
                return JsonResponse({"message": "Missing fields"}, status=400)

            # Check if email exists
            if User.objects.filter(email=email).exists():
                return JsonResponse({"message": "Email already exists"}, status=400)

            # Create the user
            user = User.objects.create_user(
                username=email,  # Use email as username
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name
            )
            return JsonResponse({"message": "User registered successfully"}, status=201)
        except Exception as e:
            return JsonResponse({"message": f"Error: {str(e)}"}, status=500)
    return JsonResponse({"message": "Invalid request method"}, status=405)

def signin(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('username')  # This expects email as the username
            password = data.get('password')
        except json.JSONDecodeError:
            return JsonResponse({"message": "Invalid data format"}, status=400)

        if not email or not password:
            return JsonResponse({"message": "Missing fields"}, status=400)

        user = authenticate(request, username=email, password=password)
        if user is not None:
            login(request, user)
            return JsonResponse({
                "message": "Signed in successfully",
                "username": user.first_name or user.username  # Preferably show the first name
            }, status=200)
        else:
            return JsonResponse({"message": "Invalid credentials"}, status=401)
    return JsonResponse({"message": "Invalid request method"}, status=405)

def logout_view(request):
    if request.method == 'POST':
        logout(request)
        return JsonResponse({"message": "Logged out successfully."}, status=200)
    return JsonResponse({"message": "Invalid request method."}, status=405)

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