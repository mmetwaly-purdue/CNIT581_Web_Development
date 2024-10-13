import flask
from flask import Flask, request, jsonify, render_template, redirect, url_for, session
import werkzeug
from werkzeug.utils import secure_filename
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import os, random, codecs, time, datetime, logging, json, re  # Standard Python library modules
import termcolor  # Installed module
logging.basicConfig(level=logging.DEBUG)

print("# Logging of HTTP requests is NOT disabled.")
logging.getLogger('werkzeug').disabled = False
logging.getLogger('werkzeug').setLevel(logging.ERROR)

app = flask.Flask(__name__)  # Create application
app.jinja_env.filters['zip'] = zip

# Configuring the database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
app.secret_key = 'mamamia'  # Replace with a unique secret key
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
        
     # Add a method to return a dictionary that can be serialized to JSON
    def to_dict(self):
        return {
            "name": self.name,
            "type": self.type,
            "description": self.description,
            "key_terms": self.key_terms,
            "output_structure": self.output_structure,
            "group": self.group,
            "print_line": self.print_line,
            "auto_connect": self.auto_connect,
            "created_by": self.created_by,
            "date_created": self.date_created
        }

# Create the agent_list with dictionaries instead of raw objects
agent_list = [agent.to_dict() for agent in [
    Agent("Alias Name Agent", "Type 1", "Description of default agent 1", "Term 1, Term 2", "Structure 1"),
    Agent("Address Agent", "Type 2", "Description of default agent 2", "Term 3, Term 4", "Structure 2"),
    Agent("Dates Agent", "Type 3", "Description of default agent 3", "Term 5, Term 6", "Structure 3"),
]]

# Define the Document model to store uploaded documents
class Document(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    agent_name = db.Column(db.String(80), nullable=False)
    doc_name = db.Column(db.String(120), nullable=False)
    doc_content = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
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
    user_id = session.get('user_id')  # Check for the logged-in user's ID
    if user_id:
        documents = Document.query.filter_by(user_id=user_id).all()  # Retrieve user's documents
    else:
        documents = []  # Empty list if not logged in

    return render_template('user_workflow_page.html', documents=documents, logged_in=bool(user_id))

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
    agents_data = [
        agent.to_dict() if isinstance(agent, Agent) else agent
        for agent in agent_list
    ]
    return render_template("agents_page.html", agents=agents_data)

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

    # Make sure all fields are properly retrieved
    if not agent_name or not agent_type or not agent_description:
        return jsonify({"message": "Missing required fields"}), 400
    
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

@app.route('/upload_document', methods=['POST'])
def upload_document():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    agent_name = request.form.get('agent_name')  # Ensure agent name is provided
    user_id = session.get('user_id')  # Retrieve logged-in user's ID

    if not user_id:
        return redirect(url_for('signin'))  # Redirect to login if not signed in

    # Read document content and save to the database
    file_content = file.read().decode('utf-8')  # Assuming text files
    document = Document(agent_name=agent_name, doc_name=file.filename, doc_content=file_content, user_id=user_id)
    db.session.add(document)
    db.session.commit()

    return redirect(url_for('workflow_page'))

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
    user = User.query.filter_by(username=data['username']).first()

    if user and user.password == data['password']:  # Assuming plaintext password (not recommended in production)
        session['user_id'] = user.id  # Store user ID in session
        return jsonify({"message": "Signed in successfully"}), 200
    else:
        return jsonify({"message": "Invalid credentials"}), 401

# A list to store all connections on the backend
all_connections = []

# Route to handle storing connections
@app.route('/store_connection', methods=['POST'])
def store_connection():
    data = request.json
    if not data:
        return jsonify({"message": "No data received"}), 400

    button_pressed = data.get('button')
    connection_text = data.get('connection_text')

    if button_pressed and connection_text:
        # Format: (Button Pressed) - text /n
        formatted_connection = f"{button_pressed} - {connection_text}\n"
        all_connections.append(formatted_connection)
        return jsonify({"message": "Connection stored successfully"}), 200
    else:
        return jsonify({"message": "Invalid data"}), 400

# Route to retrieve the summary of connections
@app.route('/get_summary', methods=['GET'])
def get_summary():
    summary_text = ''.join(all_connections)
    return jsonify({"summary": summary_text}), 200

if __name__ == '__main__':
    app.run(debug=True)

