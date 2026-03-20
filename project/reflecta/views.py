from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.conf import settings
from pymongo import MongoClient
from django.views.decorators.csrf import csrf_exempt
from bson import ObjectId
import cloudinary
import cloudinary.uploader
import os
import json
import bcrypt
import jwt
from datetime import datetime, timedelta

MONGO_URI = os.environ.get("MONGO_URI")
if not MONGO_URI:
    raise RuntimeError("MONGO_URI is not set")

client = MongoClient(MONGO_URI)
db = client["Reflecta"]

cloudinary.config(
    cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME", "dfla4rinf"),
    api_key=os.environ.get("CLOUDINARY_API_KEY", "269539432352626"),
    api_secret=os.environ.get("CLOUDINARY_API_SECRET", "JJXS1udT178x6Ifg7CCT625aUKA"),
)

questions_collection = db["questions"]
chapters_collection = db["chapters"]
concepts_collection = db["concepts"]
subjects_collection = db["subjects"]
users_collection = db["users"]
attempts_collection = db["attempts"]

def get_questions(request):
    questions = list(questions_collection.find({}))
    for question in questions:
        question['_id'] = str(question['_id'])
        # Debug: print all fields for the first question
        if len(questions) > 0 and questions.index(question) == 0:
            print("Question fields:", list(question.keys()))
            print("Sample question data:", question)
    return JsonResponse(questions, safe=False)

@csrf_exempt
def upload_question(request):

    if request.method == "GET":
        return JsonResponse({"detail": "Use POST to upload a question."})

    if request.method == "POST":

        subjectId = request.POST.get("subjectId")
        chapterId = request.POST.get("chapterId")
        year = request.POST.get("year")
        difficulty = int(request.POST.get("difficulty"))
        q_type = request.POST.get("type")
        marks = int(request.POST.get("marks"))
        correctOption = request.POST.get("correctOption")

        questionImage = request.FILES.get("questionImage")
        explanationImage = request.FILES.get("explanationImage")
        explanationNA = request.POST.get("explanationNA")

        if not questionImage:
            return JsonResponse({"error": "Question image missing"}, status=400)

        try:
            # Upload question image to Cloudinary
            question_result = cloudinary.uploader.upload(
                questionImage,
                folder="reflecta/questions",
                resource_type="image"
            )
            
            # Handle explanation image (optional)
            explanation_url = None
            if explanationImage and not explanationNA:
                try:
                    explanation_result = cloudinary.uploader.upload(
                        explanationImage,
                        folder="reflecta/explanations",
                        resource_type="image"
                    )
                    explanation_url = explanation_result['secure_url']
                except Exception as e:
                    return JsonResponse({"error": f"Cloudinary explanation upload failed: {str(e)}"}, status=500)
            else:
                # Set a default NA explanation URL or handle as needed
                explanation_url = "NA"

        except Exception as e:
            return JsonResponse({"error": f"Cloudinary upload failed: {str(e)}"}, status=500)

        doc = {
            "subjectId": subjectId,
            "chapterId": chapterId,
            "year": int(year),
            "difficulty": difficulty,
            "type": q_type,
            "marks": marks,
            "questionImage": question_result['secure_url'],
            "explanationImage": explanation_url
        }

        # Store correctOption for all question types that have it
        if correctOption:
            doc["correctOption"] = correctOption

        questions_collection.insert_one(doc)

        return JsonResponse({"status": "success"})

@csrf_exempt
def update_question(request, question_id):
    if request.method == "PUT":
        try:
            question_data = json.loads(request.body)
            
            update_doc = {}
            if "subjectId" in question_data:
                update_doc["subjectId"] = question_data["subjectId"]
            if "chapterId" in question_data:
                update_doc["chapterId"] = question_data["chapterId"]
            if "year" in question_data:
                update_doc["year"] = int(question_data["year"])
            if "difficulty" in question_data:
                update_doc["difficulty"] = int(question_data["difficulty"])
            if "type" in question_data:
                update_doc["type"] = question_data["type"]
            if "marks" in question_data:
                update_doc["marks"] = int(question_data["marks"])
            if "correctOption" in question_data:
                update_doc["correctOption"] = question_data["correctOption"]
            
            result = questions_collection.update_one(
                {"_id": ObjectId(question_id)},
                {"$set": update_doc}
            )
            
            if result.modified_count > 0:
                return JsonResponse({"status": "success", "message": "Question updated successfully"})
            else:
                return JsonResponse({"error": "Question not found or no changes made"}, status=404)
                
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    
    return JsonResponse({"error": "Method not allowed"}, status=405)

@csrf_exempt
def delete_question(request, question_id):
    if request.method == "DELETE":
        try:
            result = questions_collection.delete_one({"_id": ObjectId(question_id)})
            
            if result.deleted_count > 0:
                return JsonResponse({"status": "success", "message": "Question deleted successfully"})
            else:
                return JsonResponse({"error": "Question not found"}, status=404)
                
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    
    return JsonResponse({"error": "Method not allowed"}, status=405)

def get_question_stats(request):
    try:
        total_questions = questions_collection.count_documents({})
        
        stats_by_subject = []
        pipeline = [
            {"$group": {"_id": "$subjectId", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        subject_stats = list(questions_collection.aggregate(pipeline))
        
        stats_by_year = []
        pipeline = [
            {"$group": {"_id": "$year", "count": {"$sum": 1}}},
            {"$sort": {"_id": -1}}
        ]
        year_stats = list(questions_collection.aggregate(pipeline))
        
        stats_by_difficulty = []
        pipeline = [
            {"$group": {"_id": "$difficulty", "count": {"$sum": 1}}},
            {"$sort": {"_id": 1}}
        ]
        diff_stats = list(questions_collection.aggregate(pipeline))
        
        return JsonResponse({
            "total_questions": total_questions,
            "by_subject": subject_stats,
            "by_year": year_stats,
            "by_difficulty": diff_stats
        })
        
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

def test_cloudinary(request):
    try:
        # Test Cloudinary configuration
        cloud_name = os.environ.get("CLOUDINARY_CLOUD_NAME")
        api_key = os.environ.get("CLOUDINARY_API_KEY")
        api_secret = os.environ.get("CLOUDINARY_API_SECRET")
        
        return JsonResponse({
            "cloud_name": cloud_name,
            "api_key": api_key[:10] + "..." if api_key else None,
            "api_secret": "Set" if api_secret else "Not set",
            "configured": bool(cloud_name and api_key and api_secret)
        })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

def debug_questions(request):
    try:
        questions = list(questions_collection.find({}))
        for question in questions:
            question['_id'] = str(question['_id'])
        
        # Return just first question for debugging
        if questions:
            first_q = questions[0]
            return JsonResponse({
                "total_count": len(questions),
                "first_question": {
                    "id": first_q.get('_id'),
                    "questionImage": first_q.get('questionImage'),
                    "explanation": first_q.get('explanation'),
                    "has_questionImage": bool(first_q.get('questionImage')),
                    "has_explanation": bool(first_q.get('explanation'))
                }
            })
        else:
            return JsonResponse({"total_count": 0, "message": "No questions found"})
            
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

# JWT Secret Key
JWT_SECRET = os.environ.get("JWT_SECRET", "your-secret-key-change-in-production")

def get_token_from_request(request):
    """Extract JWT token from Authorization header"""
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        return auth_header.split(' ')[1]
    return None

def verify_token(token):
    """Verify JWT token and return payload"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def require_auth(required_role=None):
    """Decorator to require authentication and optional role verification"""
    def decorator(view_func):
        def wrapper(request, *args, **kwargs):
            token = get_token_from_request(request)
            if not token:
                return JsonResponse({"error": "Authentication required"}, status=401)
            
            payload = verify_token(token)
            if not payload:
                return JsonResponse({"error": "Invalid or expired token"}, status=401)
            
            # Add user info to request
            request.user = payload
            
            # Check role if required
            if required_role and payload.get('role') != required_role:
                return JsonResponse({"error": "Insufficient permissions"}, status=403)
            
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator

@csrf_exempt
def register(request):
    """Register a new user (student role by default)"""
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')
            name = data.get('name', '')
            role = data.get('role', 'STUDENT')
            
            if not email or not password:
                return JsonResponse({"error": "Email and password required"}, status=400)
            
            # Only allow BOSS role if secret key is provided
            if role == 'BOSS':
                secret_key = data.get('secret_key')
                if secret_key != "N0VA":
                    return JsonResponse({"error": "Invalid secret key for BOSS registration"}, status=403)
            
            # Check if user already exists
            existing_user = users_collection.find_one({"email": email})
            if existing_user:
                return JsonResponse({"error": "User already exists"}, status=400)
            
            # Hash password
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
            # Convert to string for MongoDB storage
            hashed_password = hashed_password.decode('utf-8')
            
            # Create user
            user = {
                "email": email,
                "password": hashed_password,
                "name": name,
                "role": role,  # Use provided role (STUDENT by default)
                "approved": role != 'ADMIN',  # Auto-approve if not ADMIN
                "created_at": datetime.utcnow()
            }
            
            users_collection.insert_one(user)
            
            return JsonResponse({"message": f"{role} registered successfully"})
            
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    
    return JsonResponse({"error": "Method not allowed"}, status=405)

@csrf_exempt
def login(request):
    """Login user and return JWT token"""
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')
            
            if not email or not password:
                return JsonResponse({"error": "Email and password required"}, status=400)
            
            # Find user
            user = users_collection.find_one({"email": email})
            if not user:
                return JsonResponse({"error": "Invalid credentials"}, status=401)
            
            # Check password
            try:
                stored_password = user['password']
                if isinstance(stored_password, str):
                    stored_password = stored_password.encode('utf-8')
                
                if not bcrypt.checkpw(password.encode('utf-8'), stored_password):
                    return JsonResponse({"error": "Invalid credentials"}, status=401)
            except Exception as e:
                return JsonResponse({"error": "Password verification failed"}, status=401)
            
            # Check if admin is approved
            if user['role'] == 'ADMIN' and not user.get('approved', False):
                return JsonResponse({"error": "Admin account not approved"}, status=403)
            
            # Generate JWT token
            token_payload = {
                'user_id': str(user['_id']),
                'email': user['email'],
                'name': user.get('name', ''),
                'role': user['role'],
                'exp': datetime.utcnow() + timedelta(days=7)  # Token expires in 7 days
            }
            
            token = jwt.encode(token_payload, JWT_SECRET, algorithm='HS256')
            
            return JsonResponse({
                "token": token,
                "user": {
                    "id": str(user['_id']),
                    "email": user['email'],
                    "name": user.get('name', ''),
                    "role": user['role']
                }
            })
            
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    
    return JsonResponse({"error": "Method not allowed"}, status=405)

@csrf_exempt
def get_profile(request):
    """Get current user profile"""
    if request.method == "GET":
        token = get_token_from_request(request)
        if not token:
            return JsonResponse({"error": "Authentication required"}, status=401)
        
        payload = verify_token(token)
        if not payload:
            return JsonResponse({"error": "Invalid or expired token"}, status=401)
        
        return JsonResponse({
            "user": {
                "id": payload['user_id'],
                "email": payload['email'],
                "name": payload.get('name', ''),
                "role": payload['role']
            }
        })
    
    return JsonResponse({"error": "Method not allowed"}, status=405)

# Protected views with role-based access
@csrf_exempt
@require_auth(required_role="BOSS")
def boss_upload_question(request):
    """Boss-only question upload"""
    return upload_question(request)

@csrf_exempt
@require_auth(required_role="ADMIN")
def admin_upload_question(request):
    """Admin-only question upload (requires approval)"""
    return upload_question(request)

@csrf_exempt
@require_auth(required_role="BOSS")
def boss_get_pending_admins(request):
    """Get list of pending admin approvals (BOSS only)"""
    if request.method == "GET":
        try:
            pending_admins = list(users_collection.find({
                "role": "ADMIN",
                "approved": False
            }))
            
            for admin in pending_admins:
                admin['_id'] = str(admin['_id'])
                del admin['password']  # Remove password from response
            
            return JsonResponse({"pending_admins": pending_admins})
            
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    
    return JsonResponse({"error": "Method not allowed"}, status=405)

@csrf_exempt
@require_auth(required_role="BOSS")
def boss_approve_admin(request, admin_id):
    """Approve an admin (BOSS only)"""
    if request.method == "POST":
        try:
            result = users_collection.update_one(
                {"_id": ObjectId(admin_id), "role": "ADMIN"},
                {"$set": {"approved": True}}
            )
            
            if result.modified_count > 0:
                return JsonResponse({"message": "Admin approved successfully"})
            else:
                return JsonResponse({"error": "Admin not found or already approved"}, status=404)
                
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    
    return JsonResponse({"error": "Method not allowed"}, status=405)

@csrf_exempt
@require_auth(required_role="BOSS")
def boss_get_approved_admins(request):
    """Get list of approved admins (BOSS only)"""
    if request.method == "GET":
        try:
            # Get all approved admins
            approved_admins = list(users_collection.find({
                "role": "ADMIN",
                "approved": True
            }, {
                "password": 0,  # Exclude password from response
                "token": 0      # Exclude token from response
            }))
            
            # Convert ObjectId to string
            for admin in approved_admins:
                admin['_id'] = str(admin['_id'])
            
            return JsonResponse({
                "approved_admins": approved_admins,
                "count": len(approved_admins)
            })
            
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    
    return JsonResponse({"error": "Method not allowed"}, status=405)

@csrf_exempt
@require_auth(required_role="BOSS")
def boss_create_admin(request):
    """Create a new admin account (BOSS only)"""
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')
            name = data.get('name', '')
            
            if not email or not password:
                return JsonResponse({"error": "Email and password required"}, status=400)
            
            # Check if user already exists
            existing_user = users_collection.find_one({"email": email})
            if existing_user:
                return JsonResponse({"error": "User already exists"}, status=400)
            
            # Hash password
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
            # Convert to string for MongoDB storage
            hashed_password = hashed_password.decode('utf-8')
            
            # Create admin (auto-approved since created by BOSS)
            admin = {
                "email": email,
                "password": hashed_password,
                "name": name,
                "role": "ADMIN",
                "approved": True,  # Auto-approved when created by BOSS
                "created_at": datetime.utcnow()
            }
            
            users_collection.insert_one(admin)
            
            return JsonResponse({"message": "Admin created successfully"})
            
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    
    return JsonResponse({"error": "Method not allowed"}, status=405)