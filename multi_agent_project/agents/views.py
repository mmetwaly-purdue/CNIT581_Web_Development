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
import os
from django.conf import settings
from LLM.Gemini import process_document_with_gemini

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

def documents_page(request):
    # Path to your uploaded documents folder
    uploads_path = os.path.join(settings.BASE_DIR, 'static/uploads')

    # Collect document names and contents
    documents = []
    for filename in os.listdir(uploads_path):
        with open(os.path.join(uploads_path, filename), 'r') as file:
            documents.append({
                'name': filename,
                'content': file.read()
            })

    # Handle search query
    search_query = request.GET.get('search', '').strip().lower()
    if search_query:
        documents = [doc for doc in documents if search_query in doc['name'].lower()]

    return render(request, 'documents.html', {'documents': documents, 'search_query': search_query})

@login_required
def workflow_page(request):
    # Simulate logged-in state and pass workflow data
    logged_in = True  # Replace with actual authentication check
    return render(request, 'user_workflow_page.html', {
        "logged_in": logged_in,
        "documents": workflow_data,  # Pass the workflow data to the template
    })

def agents_page(request):
    sort_order = request.GET.get('sort', 'asc')  # Default sorting order is ascending
    sorted_agents = sorted(agent_list, key=lambda x: x['name'], reverse=(sort_order == 'desc'))
    return render(request, 'agents_page.html', {'agents': sorted_agents, 'sort_order': sort_order})

def agent_detail(request, agent_id):
    # Fetch documents from the uploads folder
    uploads_path = os.path.join(settings.BASE_DIR, 'static/uploads')
    documents = [{'name': f} for f in os.listdir(uploads_path) if os.path.isfile(os.path.join(uploads_path, f))]
    try:
        agent_id = int(agent_id)
        agent = next((agent for agent in agent_list if int(agent['id']) == agent_id), None)

        if agent:
            return render(request, 'agents_detailed_page.html', {'agent': agent, 'documents': documents})
        else:
            return HttpResponse("Agent not found", status=404)
    except (ValueError, TypeError):
        return HttpResponse("Invalid agent ID", status=400)

def get_agent_list(request):
    return JsonResponse({'agents': agent_list})

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

def get_documents(request):
    uploads_path = os.path.join(settings.BASE_DIR, 'static/uploads')
    documents = [{'name': f} for f in os.listdir(uploads_path)]
    return JsonResponse({'documents': documents}, status=200)

def upload_document(request):
    if request.method == 'POST' and request.FILES.get('file'):
        file = request.FILES['file']
        save_path = os.path.join(settings.BASE_DIR, 'static/uploads', file.name)

        with open(save_path, 'wb') as destination:
            for chunk in file.chunks():
                destination.write(chunk)

        return JsonResponse({"message": "Document uploaded successfully."}, status=200)
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
                username=first_name,  # Use email as username
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
def delete_agent_workflow(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            agent_name = data.get('agent_name')  # Expecting 'agent_name' from the frontend

            if not agent_name:
                return JsonResponse({"message": "Agent name is required."}, status=400)

            # Find and delete agent by name
            global agent_list
            original_length = len(agent_list)
            agent_list = [agent for agent in agent_list if agent['name'] != agent_name]

            if len(agent_list) < original_length:
                return JsonResponse({"message": f"Agent '{agent_name}' deleted successfully."}, status=200)
            else:
                return JsonResponse({"message": "Agent not found."}, status=404)
        except Exception as e:
            return JsonResponse({"message": f"Error deleting agent: {str(e)}"}, status=500)
    return JsonResponse({"message": "Invalid request method."}, status=405)

def get_summary(request):
    global workflow_data, all_connections, deleted_agents

    # Build the summary
    summary_data = {
        "documents_used": [doc['doc_name'] for doc in workflow_data],
        "agents_used": [doc['agent_name'] for doc in workflow_data],
        "connections_made": [f"{conn['agent1Text']} - {conn['agent2Text']}" for conn in all_connections],
        "connections_deleted": [f"{conn['agent1Text']} - {conn['agent2Text']}" for conn in all_connections],
        "deleted_agents": deleted_agents,
    }

    return JsonResponse({"summary": summary_data}, status=200)

@csrf_exempt
def save_highlights(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            agent_name = data.get('agent_name')
            highlights = data.get('highlights')

            # Logic to save highlights (e.g., save to database or a file)
            # For simplicity, print the data for now
            print(f"Highlights for {agent_name}: {highlights}")

            return JsonResponse({"message": "Highlights saved successfully."}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid request method."}, status=405)

@csrf_exempt
def store_connection(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            button_pressed = data.get('button')
            connection_text = data.get('connection_text')

            if button_pressed and connection_text:
                all_connections.append(connection_text)  # Store in memory (adjust for database if needed)
                return JsonResponse({"message": "Connection stored successfully."}, status=200)
            else:
                return JsonResponse({"message": "Invalid data."}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({"message": "Invalid JSON format."}, status=400)
    return JsonResponse({"message": "Invalid request method."}, status=405)

def get_connections(request):
    return JsonResponse({"connections": all_connections}, status=200)

# Example placeholder to store workflow data
workflow_data = []  # A list to store agent-document associations

@csrf_exempt
def run_agent(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            agent_name = data.get('agent')
            document_name = data.get('document')

            if not agent_name or not document_name:
                return JsonResponse({"error": "Both agent and document are required."}, status=400)

            # Simulate agent processing
            processed_content = f"Processed content of {document_name} by {agent_name}"

            # Add the agent-document pair to workflow_data
            workflow_data.append({
                'agent_name': agent_name,
                'doc_name': document_name,
                'doc_content': processed_content
            })

            print(f"Agent '{agent_name}' has processed document '{document_name}'.")

            # Redirect to the workflow page
            return HttpResponseRedirect(reverse('workflow_page'))
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid request method."}, status=405)

def run_gemini(request):
    if request.method == "POST":
        # Get document content and agent name from the POST request
        document_content = request.POST.get("document_content", "")
        agent_name = request.POST.get("agent_name", "")  # Fetch agent name
        
        if not document_content:
            return JsonResponse({"error": "No document content provided"}, status=400)
        
        if not agent_name:
            return JsonResponse({"error": "No agent name provided"}, status=400)

        try:
            # Call the Gemini processing function with both document content and agent name
            response = process_document_with_gemini(document_content, agent_name)
            return JsonResponse({"response": response})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)
