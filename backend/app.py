# app.py
import os

from bson import ObjectId
from bson import errors as bson_errors
from dotenv import load_dotenv
from flask import Flask, abort, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from utils import docs_to_json, oid_to_str

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME", "vctracker")
COLLECTION = os.getenv("COLLECTION", "foreign_vc")
PORT = int(os.getenv("PORT", 5000))

if not MONGO_URI:
    raise RuntimeError("MONGO_URI not set in environment")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
col = db[COLLECTION]

app = Flask(__name__)
CORS(app)  # enable for all origins; tighten this in prod


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/api/vcs", methods=["GET"])
def list_vcs():
    """
    Query params:
      - page: int (default 1)
      - per_page: int (default 25)
      - fields: comma-separated projection keys (e.g. name,email)
      - q: text query (simple substring search on name)
      - country: filter by Country (exact match)
      - sort: field name, prefix with - for descending, e.g. -name
    """
    page = max(1, int(request.args.get("page", 1)))
    per_page = min(500, int(request.args.get("per_page", 25)))
    fields = request.args.get("fields")
    q = request.args.get("q")
    country = request.args.get("country")
    sort = request.args.get("sort")

    # Build projection
    projection = None
    if fields:
        # include specified fields and always include _id
        projection = {f.strip(): 1 for f in fields.split(",") if f.strip()}
        projection["_id"] = 1

    # Build filter
    filt = {}
    if q:
        # simple case-insensitive substring search on a likely 'Name' field (adjust as needed)
        filt["Name"] = {"$regex": q, "$options": "i"}
    if country:
        filt["Country"] = country

    # Sorting
    sort_spec = None
    if sort:
        direction = -1 if sort.startswith("-") else 1
        field = sort.lstrip("-")
        sort_spec = [(field, direction)]

    cursor = col.find(filt, projection)

    if sort_spec:
        cursor = cursor.sort(sort_spec)

    total = cursor.count() if hasattr(cursor, "count") else col.count_documents(filt)
    cursor = cursor.skip((page - 1) * per_page).limit(per_page)
    docs = list(cursor)
    return jsonify(
        {
            "meta": {"page": page, "per_page": per_page, "total": total},
            "data": docs_to_json(docs),
        }
    )


@app.route("/api/vcs/<string:doc_id>", methods=["GET"])
def get_vc(doc_id):
    try:
        oid = ObjectId(doc_id)
    except bson_errors.InvalidId:
        abort(400, "Invalid id")

    doc = col.find_one({"_id": oid})
    if not doc:
        abort(404, "Not found")
    return jsonify(oid_to_str(doc))


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=True)
