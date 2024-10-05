import flask
from flask import Flask, request, jsonify, render_template
import werkzeug
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import os, random, codecs, time, datetime, logging, json, re # <-- standard Python libary modules
import termcolor     # <------------- installed modules

print("# Logging of HTTP requests is NOT disabled.")
logging.getLogger('werkzeug').disabled = False
logging.getLogger('werkzeug').setLevel(logging.ERROR)


app = flask.Flask(__name__)                  # Create application
app.jinja_env.filters['zip'] = zip

# Configuring the database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)



# Define the User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)  # Hashed password
    email = db.Column(db.String(120), unique=True, nullable=False)

# Create the database
# Create the database inside the application context
with app.app_context():
    db.create_all()


@app.route('/homepage')
def home_page():
	return flask.render_template("homepage.html")

@app.route('/about_us_page')
def about_us_page():
	return flask.render_template("about_us_page.html")
    
@app.route('/workflow')
def workflow_page():
	return flask.render_template("user_workflow_page.html")

@app.route('/privacy')
def privacy_page():
	return flask.render_template("privacy.html")

@app.route('/terms')
def terms_page():
	return flask.render_template("terms.html")

@app.route('/create_Agent')
def create_page():
	return flask.render_template("create_new_agent_page.html")

@app.route('/agent_Detail')
def detail_page():
	return flask.render_template("agents_detailed_page.html")

@app.route('/agents')
def agents_page():
	return flask.render_template("agents_page.html")


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

    hashed_password = generate_password_hash(password, method='sha256')

    new_user = User(username=username, password=hashed_password, email=email)

    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        print(str(e))  # Print the exception to the server log
        return jsonify({"message": "Username or email already exists"}), 400

# Route to handle user sign-in
@app.route('/signin', methods=['POST'])
def signin():
    data = request.json
    user = User.query.filter_by(username=data['username']).first()

    if user and check_password_hash(user.password, data['password']):
        return jsonify({"message": "Signed in successfully"}), 200
    else:
        return jsonify({"message": "Invalid credentials"}), 401

if __name__ == '__main__':
    app.run(debug=True)