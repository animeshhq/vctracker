# utils.py  (pure Python, not React!)
from bson import ObjectId


def oid_to_str(doc):
    """Convert Mongo ObjectId to string for JSON responses."""
    if not doc:
        return doc
    d = dict(doc)
    _id = d.get("_id")
    if _id is not None and isinstance(_id, ObjectId):
        d["_id"] = str(_id)
    return d


def docs_to_json(docs):
    """Convert a list of Mongo docs into JSON-friendly dicts."""
    return [oid_to_str(doc) for doc in docs]
