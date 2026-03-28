from supabase import create_client, Client
from core.config import get_settings
from functools import lru_cache
from typing import Optional

settings = get_settings()

@lru_cache
def get_supabase() -> Client:
    # Uses the service_role_key to bypass RLS for backend operations
    return create_client(
        settings.supabase_url,
        settings.supabase_service_role_key
    )

def execute_rpc(function_name: str, params: dict) -> list:
    supabase = get_supabase()
    result = supabase.rpc(function_name, params).execute()
    return result.data or []

def insert_rows(table: str, rows: list[dict]) -> list:
    supabase = get_supabase()
    result = supabase.table(table).insert(rows).execute()
    return result.data or []

def select_rows(table: str, filters: dict = None, limit: int = 100, order_by: Optional[str] = None, order_desc: bool = True) -> list:
    supabase = get_supabase()
    query = supabase.table(table).select("*")
    
    if filters:
        for key, value in filters.items():
            query = query.eq(key, value)
            
    # ADDED: Sorting capability for the RAG context log
    if order_by:
        query = query.order(order_by, desc=order_desc)
        
    result = query.limit(limit).execute()
    return result.data or []

# ADDED: Explicit update function for the Rolling Summary overwrite
def update_rows(table: str, match_column: str, match_value: str, update_data: dict) -> list:
    supabase = get_supabase()
    result = supabase.table(table).update(update_data).eq(match_column, match_value).execute()
    return result.data or []

def upsert_rows(table: str, rows: list[dict], on_conflict: str = "id") -> list:
    supabase = get_supabase()
    result = supabase.table(table).upsert(rows, on_conflict=on_conflict).execute()
    return result.data or []

def delete_rows(table: str, filters: dict) -> list:
    supabase = get_supabase()
    query = supabase.table(table).delete()
    for key, value in filters.items():
        query = query.eq(key, value)
    result = query.execute()
    return result.data or []