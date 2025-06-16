"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, ExcelFile
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from datetime import datetime
import json
import traceback

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)

@api.route('/signup', methods=['POST'])
def signup():
    email = request.json.get("email", None)
    password = request.json.get("password", None)

    if not email:
        return jsonify({"msg": "Email is required"}), 400
    if not password:
        return jsonify({"msg": "Password is required"}), 400

    # Check if user already exists
    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "Email already registered"}), 400

    # Create new user
    user = User()
    user.email = email
    user.set_password(password)
    user.is_active = True

    db.session.add(user)
    db.session.commit()

    # Generate access token
    access_token = create_access_token(identity=user.id)
    return jsonify({
        "token": access_token,
        "user": user.serialize()
    }), 201

@api.route('/login', methods=['POST'])
def login():
    email = request.json.get("email", None)
    password = request.json.get("password", None)

    if not email:
        return jsonify({"msg": "Email is required"}), 400
    if not password:
        return jsonify({"msg": "Password is required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"msg": "Invalid email or password"}), 401

    access_token = create_access_token(identity=user.id)
    return jsonify({
        "token": access_token,
        "user": user.serialize()
    })

@api.route('/files', methods=['GET'])
@jwt_required()
def get_files():
    current_user_id = get_jwt_identity()
    
    # Get sort parameters
    sort_field = request.args.get('sort_field', 'name')
    sort_order = request.args.get('sort_order', 'asc')
    
    # Build query
    query = ExcelFile.query.filter_by(user_id=current_user_id)
    
    # Apply sorting
    if sort_field == 'name':
        query = query.order_by(ExcelFile.name.asc() if sort_order == 'asc' else ExcelFile.name.desc())
    elif sort_field == 'date':
        query = query.order_by(ExcelFile.created_date.asc() if sort_order == 'asc' else ExcelFile.created_date.desc())
    
    files = query.all()
    return jsonify([file.serialize() for file in files]), 200

@api.route('/files', methods=['POST'])
@jwt_required()
def create_file():
    print("=== CREATE FILE ROUTE CALLED ===")
    
    try:
        current_user_id = get_jwt_identity()
        print(f"Current user ID: {current_user_id}")
        
        # Debug the raw request
        print(f"Request method: {request.method}")
        print(f"Request headers: {dict(request.headers)}")
        print(f"Request content type: {request.content_type}")
        print(f"Request data: {request.data}")
        
        # Try to get JSON data
        try:
            data = request.json
            print(f"Parsed JSON data: {data}")
            print(f"Data type: {type(data)}")
        except Exception as e:
            print(f"Error parsing JSON: {e}")
            return jsonify({"msg": f"JSON parsing error: {str(e)}"}), 400
        
        if not data:
            print("No JSON data received")
            return jsonify({"msg": "No JSON data received"}), 400
            
        if not data.get('name'):
            print("No name provided")
            return jsonify({"msg": "File name is required"}), 400
        
        print(f"File name: {data.get('name')}")
        print(f"Description: {data.get('description')}")
        print(f"Content: {data.get('content')}")
        print(f"Content type: {type(data.get('content'))}")
        
        content = data.get('content', '[]')
        
        # Handle content - it should be a string (JSON string from frontend)
        if isinstance(content, str):
            print("Content is string, validating JSON...")
            # Validate that the string can be parsed as JSON
            try:
                json.loads(content)
                content_to_store = content  # Store the JSON string directly
                print("Content validated as valid JSON string")
            except json.JSONDecodeError as e:
                print(f"JSON decode error: {e}")
                return jsonify({"msg": "Content must be a valid JSON string"}), 422
        else:
            print("Content is not string, converting to JSON...")
            # If content is an array/object, convert it to JSON string
            try:
                content_to_store = json.dumps(content)
                print(f"Content converted to JSON string: {content_to_store}")
            except TypeError as e:
                print(f"JSON dumps error: {e}")
                return jsonify({"msg": "Content must be JSON serializable"}), 422
            
        print("Creating new ExcelFile object...")
        new_file = ExcelFile(
            name=data['name'],
            description=data.get('description', ''),
            content=content_to_store,
            user_id=current_user_id
        )
        
        print("Adding to database...")
        db.session.add(new_file)
        db.session.commit()
        print("File saved successfully")
        
        return jsonify(new_file.serialize()), 201
        
    except Exception as e:
        print(f"Unexpected error: {e}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({"msg": f"Unexpected error: {str(e)}"}), 500

@api.route('/files/<int:id>', methods=['GET'])
@jwt_required()
def get_file(id):
    current_user_id = get_jwt_identity()
    file = ExcelFile.query.filter_by(id=id, user_id=current_user_id).first()
    
    if not file:
        return jsonify({"msg": "File not found"}), 404
        
    return jsonify(file.serialize()), 200

@api.route('/files/<int:id>', methods=['PUT'])
@jwt_required()
def update_file(id):
    print(f"=== UPDATE FILE ROUTE CALLED for ID: {id} ===")
    
    try:
        current_user_id = get_jwt_identity()
        print(f"Current user ID: {current_user_id}")
        
        file = ExcelFile.query.filter_by(id=id, user_id=current_user_id).first()
        
        if not file:
            print("File not found")
            return jsonify({"msg": "File not found"}), 404
        
        # Debug the raw request
        print(f"Request method: {request.method}")
        print(f"Request headers: {dict(request.headers)}")
        print(f"Request content type: {request.content_type}")
        print(f"Request data: {request.data}")
        
        try:
            data = request.json
            print(f"Parsed JSON data: {data}")
        except Exception as e:
            print(f"Error parsing JSON: {e}")
            return jsonify({"msg": f"JSON parsing error: {str(e)}"}), 400
            
        if 'name' in data:
            print(f"Updating name: {data['name']}")
            file.name = data['name']
        if 'description' in data:
            print(f"Updating description: {data['description']}")
            file.description = data['description']
        if 'content' in data:
            print(f"Updating content: {data['content']}")
            print(f"Content type: {type(data['content'])}")
            content = data['content']
            # Handle content consistently with POST route
            if isinstance(content, str):
                print("Content is string, validating JSON...")
                # Validate that the string can be parsed as JSON
                try:
                    json.loads(content)
                    file.content = content  # Store the JSON string directly
                    print("Content validated and stored")
                except json.JSONDecodeError as e:
                    print(f"JSON decode error: {e}")
                    return jsonify({"msg": "Content must be a valid JSON string"}), 422
            else:
                print("Content is not string, converting to JSON...")
                # If content is an array/object, convert it to JSON string
                try:
                    file.content = json.dumps(content)
                    print("Content converted and stored")
                except TypeError as e:
                    print(f"JSON dumps error: {e}")
                    return jsonify({"msg": "Content must be JSON serializable"}), 422
        
        print("Committing changes...")
        db.session.commit()
        print("File updated successfully")
        return jsonify(file.serialize()), 200
        
    except Exception as e:
        print(f"Unexpected error: {e}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({"msg": f"Unexpected error: {str(e)}"}), 500

@api.route('/files/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_file(id):
    current_user_id = get_jwt_identity()
    file = ExcelFile.query.filter_by(id=id, user_id=current_user_id).first()
    
    if not file:
        return jsonify({"msg": "File not found"}), 404
        
    db.session.delete(file)
    db.session.commit()
    return jsonify({"msg": "File deleted"}), 200

@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():
    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }
    return jsonify(response_body), 200