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
    current_user_id = get_jwt_identity()
    
    data = request.json
    if not data.get('name'):
        return jsonify({"msg": "File name is required"}), 400
        
    new_file = ExcelFile(
        name=data['name'],
        description=data.get('description', ''),
        content=json.dumps(data.get('content', {})),
        user_id=current_user_id
    )
    
    db.session.add(new_file)
    db.session.commit()
    
    return jsonify(new_file.serialize()), 201

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
    current_user_id = get_jwt_identity()
    file = ExcelFile.query.filter_by(id=id, user_id=current_user_id).first()
    
    if not file:
        return jsonify({"msg": "File not found"}), 404
        
    data = request.json
    if 'name' in data:
        file.name = data['name']
    if 'description' in data:
        file.description = data['description']
    if 'content' in data:
        file.content = json.dumps(data['content'])
    
    db.session.commit()
    return jsonify(file.serialize()), 200

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
