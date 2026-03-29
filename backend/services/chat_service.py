from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional


async def create_community(db, user_id, name, description, kind, org_id, event_id, is_public):
    res = db.table("communities").insert({
        "name": name,
        "description": description,
        "kind": kind,
        "org_id": org_id,
        "event_id": event_id,
        "is_public": is_public,
        "created_by": user_id,
    }).execute()
    community = res.data[0]
    db.table("community_members").insert({
        "community_id": community["id"],
        "user_id": user_id,
        "role": "admin",
    }).execute()
    # Create a default "general" channel
    db.table("channels").insert({
        "community_id": community["id"],
        "name": "general",
        "description": "General discussion",
    }).execute()
    return community


async def list_communities(db, kind, search, limit, offset):
    query = db.table("communities").select("*").eq("is_public", True)
    if kind:
        query = query.eq("kind", kind)
    if search:
        query = query.ilike("name", f"%{search}%")
    res = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
    return res.data or []


async def get_community_detail(db, community_id):
    res = db.table("communities").select("*").eq("id", community_id).limit(1).execute()
    if not res.data:
        return None
    community = res.data[0]
    members_res = (
        db.table("community_members")
        .select("user_id, role, joined_at")
        .eq("community_id", community_id)
        .execute()
    )
    community["members"] = members_res.data or []
    community["member_count"] = len(community["members"])
    return community


async def join_community(db, user_id, community_id):
    existing = (
        db.table("community_members")
        .select("user_id")
        .eq("community_id", community_id)
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )
    if existing.data:
        raise ValueError("Already a member")
    res = db.table("community_members").insert({
        "community_id": community_id,
        "user_id": user_id,
        "role": "member",
    }).execute()
    return res.data[0]


async def leave_community(db, user_id, community_id):
    db.table("community_members").delete().eq("community_id", community_id).eq("user_id", user_id).execute()


async def get_channels(db, community_id):
    res = db.table("channels").select("*").eq("community_id", community_id).order("created_at").execute()
    return res.data or []


async def create_channel(db, user_id, community_id, name, description, is_readonly):
    member = (
        db.table("community_members")
        .select("role")
        .eq("community_id", community_id)
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )
    if not member.data or member.data[0]["role"] not in ("admin", "moderator"):
        raise PermissionError("Only admins/moderators can create channels")
    res = db.table("channels").insert({
        "community_id": community_id,
        "name": name,
        "description": description,
        "is_readonly": is_readonly,
    }).execute()
    return res.data[0]


async def list_threads_for_channel(db, channel_id, limit, offset):
    res = (
        db.table("threads")
        .select("*")
        .eq("channel_id", channel_id)
        .eq("thread_type", "community")
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )
    return res.data or []


async def create_community_thread(db, user_id, channel_id, title):
    res = db.table("threads").insert({
        "channel_id": channel_id,
        "thread_type": "community",
        "title": title,
        "created_by": user_id,
    }).execute()
    return res.data[0]


async def create_event_thread(db, user_id, event_id, title):
    res = db.table("threads").insert({
        "event_id": event_id,
        "thread_type": "event",
        "title": title,
        "created_by": user_id,
    }).execute()
    return res.data[0]


async def get_or_create_dm_thread(db, user_id, partner_id):
    # Check both orderings
    res = (
        db.table("threads")
        .select("*")
        .eq("thread_type", "dm")
        .eq("dm_partner_a", user_id)
        .eq("dm_partner_b", partner_id)
        .limit(1)
        .execute()
    )
    if res.data:
        return res.data[0]
    res = (
        db.table("threads")
        .select("*")
        .eq("thread_type", "dm")
        .eq("dm_partner_a", partner_id)
        .eq("dm_partner_b", user_id)
        .limit(1)
        .execute()
    )
    if res.data:
        return res.data[0]
    # Create new DM thread
    res = db.table("threads").insert({
        "thread_type": "dm",
        "dm_partner_a": user_id,
        "dm_partner_b": partner_id,
        "created_by": user_id,
    }).execute()
    return res.data[0]


async def list_dm_threads(db, user_id):
    res_a = (
        db.table("threads")
        .select("*")
        .eq("thread_type", "dm")
        .eq("dm_partner_a", user_id)
        .execute()
    )
    res_b = (
        db.table("threads")
        .select("*")
        .eq("thread_type", "dm")
        .eq("dm_partner_b", user_id)
        .execute()
    )
    threads = (res_a.data or []) + (res_b.data or [])
    threads.sort(key=lambda t: t.get("created_at", ""), reverse=True)
    return threads


async def get_messages(db, thread_id, limit, before):
    query = (
        db.table("messages")
        .select("*")
        .eq("thread_id", thread_id)
        .order("created_at", desc=True)
        .limit(limit)
    )
    if before:
        query = query.lt("created_at", before)
    res = query.execute()
    messages = res.data or []
    messages.reverse()
    return messages


async def send_message(db, user_id, thread_id, content, reply_to, is_anonymous):
    row = {
        "thread_id": thread_id,
        "sender_id": user_id,
        "content": content,
        "is_anonymous": is_anonymous,
    }
    if reply_to:
        row["reply_to"] = reply_to
    res = db.table("messages").insert(row).execute()
    return res.data[0]


async def edit_message(db, user_id, message_id, content):
    existing = db.table("messages").select("sender_id").eq("id", message_id).limit(1).execute()
    if not existing.data:
        raise ValueError("Message not found")
    if existing.data[0]["sender_id"] != user_id:
        raise PermissionError("Cannot edit another user's message")
    res = (
        db.table("messages")
        .update({"content": content, "edited_at": datetime.now(timezone.utc).isoformat()})
        .eq("id", message_id)
        .execute()
    )
    return res.data[0]


async def delete_message(db, user_id, message_id):
    existing = db.table("messages").select("sender_id").eq("id", message_id).limit(1).execute()
    if not existing.data:
        raise ValueError("Message not found")
    if existing.data[0]["sender_id"] != user_id:
        raise PermissionError("Cannot delete another user's message")
    db.table("messages").delete().eq("id", message_id).execute()


async def add_reaction(db, user_id, message_id, emoji):
    msg = db.table("messages").select("reactions").eq("id", message_id).limit(1).execute()
    if not msg.data:
        raise ValueError("Message not found")
    reactions = msg.data[0].get("reactions") or {}
    users_for_emoji = reactions.get(emoji, [])
    if user_id in users_for_emoji:
        users_for_emoji.remove(user_id)
    else:
        users_for_emoji.append(user_id)
    reactions[emoji] = users_for_emoji
    res = db.table("messages").update({"reactions": reactions}).eq("id", message_id).execute()
    return res.data[0]


async def mark_thread_read(db, user_id, thread_id, last_message_id):
    db.table("read_receipts").upsert({
        "thread_id": thread_id,
        "user_id": user_id,
        "last_read_msg": last_message_id,
        "last_read_at": datetime.now(timezone.utc).isoformat(),
    }, on_conflict="thread_id,user_id").execute()


async def get_unread_counts(db, user_id):
    # Get all threads user participates in
    dm_threads = await list_dm_threads(db, user_id)
    counts = {}
    for thread in dm_threads:
        tid = thread["id"]
        receipt = (
            db.table("read_receipts")
            .select("last_read_at")
            .eq("thread_id", tid)
            .eq("user_id", user_id)
            .limit(1)
            .execute()
        )
        last_read = receipt.data[0]["last_read_at"] if receipt.data else "1970-01-01T00:00:00Z"
        unread = (
            db.table("messages")
            .select("id", count="exact")
            .eq("thread_id", tid)
            .gt("created_at", last_read)
            .neq("sender_id", user_id)
            .execute()
        )
        counts[tid] = unread.count or 0
    return counts


async def update_presence(db, user_id, status):
    db.table("presence").upsert({
        "user_id": user_id,
        "status": status,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }, on_conflict="user_id").execute()


async def set_typing(db, user_id, thread_id, is_typing):
    if is_typing:
        db.table("typing_indicators").upsert({
            "thread_id": thread_id,
            "user_id": user_id,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }, on_conflict="thread_id,user_id").execute()
    else:
        db.table("typing_indicators").delete().eq("thread_id", thread_id).eq("user_id", user_id).execute()
