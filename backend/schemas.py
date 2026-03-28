from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Literal
from datetime import datetime
from uuid import UUID

class WeekPlan(BaseModel):
    week_number: int = Field(..., description="Week number from 1 to 20")
    focus: str = Field(..., description="The main theme of the week (e.g., 'MVP Development' or 'Launch')")
    action_items: List[str] = Field(..., description="3-5 highly specific tasks to complete this week")
    due_date_offset_days: int = Field(..., description="Days from start date this week concludes")

class StartupRoadmap(BaseModel):
    roadmap: List[WeekPlan] = Field(..., description="Exactly 20 weeks of planning, ending with marketing and launch.")
class UserBase(BaseModel):
    full_name: str
    college: str
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

class OrganizationBase(BaseModel):
    creator_id: UUID
    org_type: Literal['startup', 'club', 'independent_research']
    name: str
    roles_needed: List[str] = Field(default_factory=list)
    funding_stage: Optional[str] = None
    
    current_state_summary: Optional[str] = None

class OrganizationCreate(OrganizationBase):
    pass

class Organization(OrganizationBase):
    id: UUID
    summary_embedding: Optional[List[float]] = Field(None, max_length=1536, min_length=1536)
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class OrgContextLogBase(BaseModel):
    org_id: UUID
    update_content: str

class OrgContextLogCreate(OrgContextLogBase):
    pass

class OrgContextLog(OrgContextLogBase):
    id: UUID
    update_embedding: Optional[List[float]] = Field(None, max_length=1536, min_length=1536)
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

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
    
class TemplateListItem(BaseModel):
    id: str
    name: str
    description: str
    distribution_channel: str


class TemplateCompareRequest(BaseModel):
    template_ids: list[str]

class StartupProfileCreateRequest(BaseModel):
    organization_id: str
    idea_name: str
    one_liner: str
    problem: str = ""
    target_customer: str = ""
    industry: str = ""
    business_model: str = ""
    distribution_channel: str = ""
    funding_stage: str = "idea"
    current_stage: str = "idea"
    product_state: str = "concept"
    traction_summary: str = ""
    goals_20_weeks: str = ""


class StartupTemplateSelectionRequest(BaseModel):
    startup_profile_id: str
    template_ids: list[str] = Field(default_factory=list)
    selection_reason: str = ""

class RoadmapGenerateRequest(BaseModel):
    startup_profile_id: str
    template_ids: list[str] = Field(default_factory=list)
    custom_goal: str = "Build product, validate distribution, and prepare for investors"
    
class StartupCompareRequest(BaseModel):
    startup_profile_id: str
    template_ids: list[str] = Field(default_factory=list)

class CofounderSearchRequest(BaseModel):
    startup_profile_id: str
    needed_roles: list[str] = Field(default_factory=list)
    limit: int = 10

class InvestorMatchRequest(BaseModel):
    startup_profile_id: str
    limit: int = 10


class InvestorCreateOutreachLinkRequest(BaseModel):
    startup_profile_id: str
    investor_id: str
    thread_id: str
