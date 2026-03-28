from fastapi import APIRouter, HTTPException

# Import the direct messaging schemas from your schemas.py
from schemas import DirectMessageCreate, DirectMessage

# Import your database wrappers
from core.database import select_rows, insert_rows

router = APIRouter()

# Because main.py adds the "/api/community" prefix, 
# this endpoint will actually live at POST /api/community/messages
@router.post("/messages", response_model=DirectMessage)
def send_direct_message(message: DirectMessageCreate):
    """Sends a direct message after validating both users exist."""
    
    # 1. Validate Sender
    sender_data = select_rows("networking_profiles", filters={"user_id": str(message.sender_id)}, limit=1)
    if not sender_data:
        raise HTTPException(status_code=400, detail="Sender does not exist in networking_profiles.")
    sender = sender_data[0]

    # 2. Validate Receiver
    receiver_data = select_rows("networking_profiles", filters={"user_id": str(message.receiver_id)}, limit=1)
    if not receiver_data:
        raise HTTPException(status_code=400, detail="Receiver does not exist in networking_profiles.")
    receiver = receiver_data[0]

    # 3. Insert into the direct_messages table (THIS IS WHERE inserted_result IS!)
    inserted_result = insert_rows("direct_messages", [{
        "sender_id": str(message.sender_id),
        "receiver_id": str(message.receiver_id),
        "text": message.text
    }])
    
    if not inserted_result:
        raise HTTPException(status_code=500, detail="Database insert failed.")
    msg = inserted_result[0]

    # 4. Return UI-Ready Object
    return {
        **msg,
        "sender_first_name": sender.get("first_name"),
        "sender_last_name": sender.get("last_name"),
        "sender_role": sender.get("community_role"),
        "sender_avatar_url": sender.get("avatar_url"),
        "receiver_first_name": receiver.get("first_name"),
        "receiver_last_name": receiver.get("last_name"),
        "receiver_role": receiver.get("community_role"),
        "receiver_avatar_url": receiver.get("avatar_url"),
    }