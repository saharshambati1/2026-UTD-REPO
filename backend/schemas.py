from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Literal
from datetime import datetime
from uuid import UUID

# ==========================================
# 1. USERS & IDENTITY
# ==========================================
class UserBase(BaseModel):
    full_name: str
    major: Optional[str] = None
    grad_year: Optional[int] = None
    gpa_range: Optional[str] = None
    skills: List[str] = Field(default_factory=list, description="e.g., ['Figma', 'Python']")
    interests: List[str] = Field(default_factory=list)
    reputation_score: int = Field(default=0, description="Gamified campus XP")
    burnout_indicator: float = Field(default=0.0, description="AI calculated score 0.0 to 1.0")

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: UUID
    profile_embedding: Optional[List[float]] = Field(None, max_length=1536, min_length=1536)
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# ==========================================
# 2. CONNECTIONS (AI Match Engine)
# ==========================================
class ConnectionBase(BaseModel):
    user_a: UUID
    user_b: UUID
    connection_type: Literal['friend', 'roommate', 'co-founder', 'study_partner']
    synergy_score: Optional[float] = None
    ai_nudge_sent: bool = False

class ConnectionCreate(ConnectionBase):
    pass

class Connection(ConnectionBase):
    id: UUID
    last_interaction: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

# ==========================================
# 3. ORGANIZATIONS (The RAG "Master Anchor")
# Handles Startups, Clubs, & Independent Research
# ==========================================
class OrganizationBase(BaseModel):
    creator_id: UUID
    org_type: Literal['startup', 'club', 'independent_research']
    name: str
    roles_needed: List[str] = Field(default_factory=list)
    funding_stage: Optional[str] = None
    
    # The rolling master summary that the LLM constantly overwrites
    current_state_summary: Optional[str] = None

class OrganizationCreate(OrganizationBase):
    pass

class Organization(OrganizationBase):
    id: UUID
    summary_embedding: Optional[List[float]] = Field(None, max_length=1536, min_length=1536)
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# ==========================================
# 4. CONTEXT LOG (The RAG "Append-Only History")
# ==========================================
class OrgContextLogBase(BaseModel):
    org_id: UUID
    update_content: str

class OrgContextLogCreate(OrgContextLogBase):
    pass

class OrgContextLog(OrgContextLogBase):
    id: UUID
    # The vector of the raw prompt, never changes once created
    update_embedding: Optional[List[float]] = Field(None, max_length=1536, min_length=1536)
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# ==========================================
# 5. STATIC KNOWLEDGE BASE (YC Essays, Syllabi)
# ==========================================
class StaticKnowledgeBase(BaseModel):
    source_name: str
    content: str

class StaticKnowledgeCreate(StaticKnowledgeBase):
    pass

class StaticKnowledgeChunk(StaticKnowledgeBase):
    id: UUID
    content_embedding: Optional[List[float]] = Field(None, max_length=1536, min_length=1536)
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# ==========================================
# 6. EVENTS & GAMIFICATION
# ==========================================
class EventBase(BaseModel):
    organizer_id: UUID
    title: str
    event_time: datetime
    location: Optional[str] = None
    has_free_food: bool = False
    predicted_turnout: Optional[int] = None

class EventCreate(EventBase):
    pass

class Event(EventBase):
    id: UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class EventAttendeeBase(BaseModel):
    event_id: UUID
    user_id: UUID
    status: Literal['rsvp', 'attended', 'ghosted']

class EventAttendee(EventAttendeeBase):
    model_config = ConfigDict(from_attributes=True)

# ==========================================
# 7. RAG ROADMAP SCHEMAS (Added)
# ==========================================
class RoadmapRequest(BaseModel):
    org_id: str
    author_id: str
    user_prompt: str
    template_id: Optional[str] = None

class WeekPlan(BaseModel):
    week_number: int = Field(..., description="Week number from 1 to 20")
    focus: str = Field(..., description="The main theme of the week")
    action_items: List[str] = Field(..., description="3-5 highly specific tasks")
    due_date_offset_days: int = Field(..., description="Days from start date this week concludes")

class DynamicStartupResponse(BaseModel):
    intent: Literal["update_roadmap", "question_answer"]
    text_response: str
    roadmap: Optional[List[WeekPlan]] = None

# ==========================================
# 8. DIRECT MESSAGING SCHEMAS (Added)
# ==========================================
class DirectMessageCreate(BaseModel):
    sender_id: UUID
    receiver_id: UUID
    text: str

class DirectMessage(DirectMessageCreate):
    id: UUID
    sent_at: datetime
    seen: bool
    
    # Denormalized data pulled from networking_profiles for the UI
    sender_first_name: Optional[str] = None
    sender_last_name: Optional[str] = None
    sender_role: Optional[str] = None
    sender_avatar_url: Optional[str] = None
    
    receiver_first_name: Optional[str] = None
    receiver_last_name: Optional[str] = None
    receiver_role: Optional[str] = None
    receiver_avatar_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)