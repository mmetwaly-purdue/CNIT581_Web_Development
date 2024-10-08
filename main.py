import flask
from flask import Flask, request, jsonify, render_template, redirect, url_for
import werkzeug
from werkzeug.utils import secure_filename
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import os, random, codecs, time, datetime, logging, json, re  # Standard Python library modules
import termcolor  # Installed module

print("# Logging of HTTP requests is NOT disabled.")
logging.getLogger('werkzeug').disabled = False
logging.getLogger('werkzeug').setLevel(logging.ERROR)

app = flask.Flask(__name__)  # Create application
app.jinja_env.filters['zip'] = zip

# Configuring the database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Define the upload folder
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)  # Create the folder if it doesn't exist

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Define allowed file extensions
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'}

# Function to check if the uploaded file has an allowed extension
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Define the User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)  # Plain text password for simplicity
    email = db.Column(db.String(120), unique=True, nullable=False)

# Define the Agent class to represent an agent
class Agent:
    def __init__(self, name, type, description, key_terms, output_structure, group=None, print_line=False, auto_connect=False):
        self.name = name
        self.type = type
        self.description = description
        self.key_terms = key_terms
        self.output_structure = output_structure
        self.group = group
        self.print_line = print_line
        self.auto_connect = auto_connect
        self.created_by = "Admin"
        self.date_created = str(datetime.datetime.now())

# Sample list to hold agents
agent_list = [
    Agent("Default Agent 1", "Type 1", "Description of default agent 1", "Term 1, Term 2", "Structure 1"),
    Agent("Default Agent 2", "Type 2", "Description of default agent 2", "Term 3, Term 4", "Structure 2"),
    Agent("Default Agent 3", "Type 3", "Description of default agent 3", "Term 5, Term 6", "Structure 3")
]

# Create the database inside the application context
with app.app_context():
    db.create_all()

@app.route('/')
@app.route('/homepage')
def home_page():
    return render_template("homepage.html")

@app.route('/about_us_page')
def about_us_page():
    return render_template("about_us_page.html")

@app.route('/workflow')
def workflow_page():
    return render_template("user_workflow_page.html")

@app.route('/privacy')
def privacy_page():
    return render_template("privacy.html")

@app.route('/terms')
def terms_page():
    return render_template("terms.html")

@app.route('/create_agent')
def create_page():
    return render_template("create.html")

@app.route('/agents')
def agents_page():
    return render_template("agents_page.html", agents=agent_list)

@app.route('/agent_detail/<int:agent_id>')
def agent_detail(agent_id):
    agent = agent_list[agent_id]
    return render_template("agents_detailed_page.html", agent=agent)

# Route to handle agent creation from the form
@app.route('/create_agent', methods=['POST'])
def create_agent():
    data = request.json
    if not data:
        return jsonify({"message": "No data received"}), 400

    agent_name = data.get('name')
    agent_type = data.get('type')
    agent_description = data.get('description')
    key_terms = data.get('key_terms')
    output_structure = data.get('output_structure')
    group = data.get('group')
    print_line = data.get('print_line')
    auto_connect = data.get('auto_connect')

    new_agent = Agent(agent_name, agent_type, agent_description, key_terms, output_structure, group, print_line, auto_connect)
    
    # Add the new agent to the agent_list
    agent_list.append(new_agent)

    return jsonify({"message": "Agent created successfully"}), 201

# Route to handle deleting an agent
@app.route('/delete_agent/<int:agent_id>', methods=['DELETE'])
def delete_agent(agent_id):
    try:
        agent_list.pop(agent_id)
        return jsonify({"message": "Agent deleted successfully"}), 200
    except IndexError:
        return jsonify({"message": "Agent not found"}), 404

# Route to handle file upload
@app.route('/upload_document', methods=['POST'])
def upload_document():
    # Check if the post request has the file part
    if 'file' not in request.files:
        return 'No file part', 400

    file = request.files['file']
    
    # If the user does not select a file, the browser submits an empty part without filename
    if file.filename == '':
        return 'No selected file', 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        print(f"Document received: {filename}")
        return redirect(request.referrer or url_for('agents_page'))  # Redirect back to the agent's detail page after upload
    else:
        return 'File not allowed', 400

# Route to register a new user
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    if not data:
        return jsonify({"message": "No data received"}), 400

    username = data.get('username')
    password = data.get('password')
    email = data.get('email')

    if not username or not password or not email:
        return jsonify({"message": "Missing fields"}), 400

    new_user = User(username=username, password=password, email=email)

    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "User registered successfully", "username": username}), 201
    except Exception as e:
        print(f"Error during registration: {str(e)}")
        return jsonify({"message": "Username or email already exists"}), 400

# Route to handle user sign-in
@app.route('/signin', methods=['POST'])
def signin():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()
    if user and user.password == password:
        return jsonify({"message": "Signed in successfully", "username": username}), 200
    else:
        return jsonify({"message": "Invalid credentials"}), 401

if __name__ == '__main__':
    app.run(debug=True)
