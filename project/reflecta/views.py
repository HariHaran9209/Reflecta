from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.conf import settings
from pymongo import MongoClient
from django.views.decorators.csrf import csrf_exempt
import os

MONGO_URI = os.environ.get("MONGO_URI")
if not MONGO_URI:
    raise RuntimeError("MONGO_URI is not set")

client = MongoClient(MONGO_URI)
db = client["Reflecta"]

questions_collection = db["questions"]
chapters_collection = db["chapters"]
concepts_collection = db["concepts"]
subjects_collection = db["subjects"]
users_collection = db["users"]
attempts_collection = db["attempts"]

def get_questions(request):
    questions = list(questions_collection.find({}, {"_id": 0}))
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

        if not questionImage or not explanationImage:
            return JsonResponse({"error": "Files missing"}, status=400)

        os.makedirs(os.path.join(settings.MEDIA_ROOT, "questions"), exist_ok=True)
        os.makedirs(os.path.join(settings.MEDIA_ROOT, "answers"), exist_ok=True)

        q_path = os.path.join(settings.MEDIA_ROOT, "questions", questionImage.name)
        e_path = os.path.join(settings.MEDIA_ROOT, "answers", explanationImage.name)

        with open(q_path, "wb+") as f:
            for chunk in questionImage.chunks():
                f.write(chunk)

        with open(e_path, "wb+") as f:
            for chunk in explanationImage.chunks():
                f.write(chunk)

        doc = {
            "subjectId": subjectId,
            "chapterId": chapterId,
            "year": int(year),
            "difficulty": difficulty,
            "type": q_type,
            "marks": marks,
            "questionImage": f"/media/questions/{questionImage.name}",
            "explanation": f"/media/answers/{explanationImage.name}"
        }

        if q_type == "MCQ" and correctOption:
            doc["correctOption"] = correctOption

        questions_collection.insert_one(doc)

        return JsonResponse({"status": "success"})