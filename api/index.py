"""Vercel entrypoint for the Anatomy Analogy Creator API."""

from __future__ import annotations

import json
import os
import re
import uuid
from datetime import datetime, timezone
from typing import Any, Literal, Optional

import requests
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, ConfigDict, Field, ValidationError


app = FastAPI(title="Anatomical Analogy Creator API")

MODEL = os.getenv("OPENROUTER_MODEL", "google/gemini-2.5-flash-lite")
DATABASE_URL = os.getenv("POSTGRES_URL") or os.getenv("DATABASE_URL")


class MappingRow(BaseModel):
    analogyComponent: str
    biologicalComponent: str
    functionalMatch: str


class ClickerQuestion(BaseModel):
    question: str
    options: list[str]
    correctAnswer: str


class AnalogyPayload(BaseModel):
    analogyTitle: str
    narrative: str
    mapping: list[MappingRow]
    clickerQuestions: list[ClickerQuestion]


class GenerateRequest(BaseModel):
    concept: str = Field(min_length=3, max_length=2000)
    targetDomain: Literal[
        "Household & Daily Life",
        "Technology & Computing",
        "Business & Factory Logistics",
        "Sports & Athletics",
        "Pop Culture/Wildcard",
    ]
    vibeStyle: Literal["Academic & Highly Precise", "Casual & Humorous"]
    mode: Literal["standard", "light"] = "standard"


class SavedAnalogy(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    concept: str
    targetDomain: str
    vibeStyle: str
    mode: str = "standard"
    payload: AnalogyPayload
    createdAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


SYSTEM_PROMPT = """You are an expert Anatomy & Physiology pedagogue helping college professors craft powerful teaching analogies for complex biological concepts.

Return ONLY one valid JSON object with this exact shape:
{"analogyTitle": string, "narrative": string, "mapping": [{"analogyComponent": string, "biologicalComponent": string, "functionalMatch": string}], "clickerQuestions": [{"question": string, "options": ["A. ...", "B. ...", "C. ...", "D. ..."], "correctAnswer": "A: explanation"}]}

Rules: use one coherent metaphor from the requested domain; make the narrative 2-3 paragraphs separated by \\n\\n; mapping must have 4-7 rows; clickerQuestions must have exactly 2 questions with exactly 4 options each; questions must test where the metaphor breaks down; and return no markdown or commentary.
"""


def build_user_prompt(req: GenerateRequest) -> str:
    mode_rules = (
        "Use a concise 1-2 paragraph narrative and exactly 4 mapping rows."
        if req.mode == "light"
        else "Use a detailed 2-3 paragraph narrative and 4-7 mapping rows."
    )
    return (
        f"Biological Concept: {req.concept.strip()}\n"
        f"Analogy Target Domain: {req.targetDomain}\n"
        f"Lecture Vibe & Delivery Style: {req.vibeStyle}\n"
        f"Generation mode: {req.mode}. {mode_rules}\n\n"
        "Generate the teaching analogy JSON now."
    )


def extract_json(text: str) -> dict[str, Any]:
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        start, end = text.find("{"), text.rfind("}")
        if start < 0 or end <= start:
            raise ValueError("No JSON object found in model response")
        return json.loads(text[start : end + 1])


def validate_payload(data: dict[str, Any], mode: str) -> AnalogyPayload:
    payload = AnalogyPayload.model_validate(data)
    if len(payload.mapping) < 4 or len(payload.mapping) > 7:
        raise ValueError("The model must return 4-7 mapping rows")
    if len(payload.clickerQuestions) != 2:
        raise ValueError("The model must return exactly 2 clicker questions")
    if any(len(question.options) != 4 for question in payload.clickerQuestions):
        raise ValueError("Each clicker question must have exactly 4 options")
    if mode == "light" and len(payload.mapping) > 5:
        raise ValueError("Light mode returned too many mapping rows")
    return payload


def generate_payload(req: GenerateRequest) -> AnalogyPayload:
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise RuntimeError("OPENROUTER_API_KEY is not configured")
    schema = {
        "type": "object",
        "properties": {
            "analogyTitle": {"type": "string"},
            "narrative": {"type": "string"},
            "mapping": {"type": "array"},
            "clickerQuestions": {"type": "array"},
        },
        "required": ["analogyTitle", "narrative", "mapping", "clickerQuestions"],
        "additionalProperties": False,
    }
    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": os.getenv("VERCEL_PROJECT_PRODUCTION_URL", "https://vercel.com"),
            "X-Title": "Anatomical Analogy Creator",
        },
        json={
            "model": MODEL,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": build_user_prompt(req)},
            ],
            "temperature": 0.7,
            "response_format": {"type": "json_schema", "json_schema": {"name": "analogy", "strict": True, "schema": schema}},
        },
        timeout=50,
    )
    response.raise_for_status()
    body = response.json()
    raw = body["choices"][0]["message"]["content"]
    return validate_payload(extract_json(raw), req.mode)


def db_connect():
    if not DATABASE_URL:
        raise RuntimeError("POSTGRES_URL is not configured")
    import psycopg

    connection = psycopg.connect(DATABASE_URL)
    connection.execute(
        """CREATE TABLE IF NOT EXISTS analogies (
            id TEXT PRIMARY KEY,
            concept TEXT NOT NULL,
            target_domain TEXT NOT NULL,
            vibe_style TEXT NOT NULL,
            mode TEXT NOT NULL DEFAULT 'standard',
            payload JSONB NOT NULL,
            created_at TIMESTAMPTZ NOT NULL
        )"""
    )
    connection.commit()
    return connection


@app.get("/api/")
def health():
    return {"message": "Anatomical Analogy Creator API", "status": "ok", "model": MODEL}


@app.post("/api/analogy/generate", response_model=SavedAnalogy)
def generate_analogy(req: GenerateRequest):
    last_error: Optional[Exception] = None
    for _ in range(3):
        try:
            payload = generate_payload(req)
            break
        except Exception as error:  # Retry malformed responses and transient upstream errors.
            last_error = error
    else:
        raise HTTPException(status_code=502, detail=f"LLM generation failed after retries: {last_error}")

    record = SavedAnalogy(
        concept=req.concept.strip(),
        targetDomain=req.targetDomain,
        vibeStyle=req.vibeStyle,
        mode=req.mode,
        payload=payload,
    )
    try:
        connection = db_connect()
        with connection:
            connection.execute(
                "INSERT INTO analogies (id, concept, target_domain, vibe_style, mode, payload, created_at) VALUES (%s, %s, %s, %s, %s, %s::jsonb, %s)",
                (record.id, record.concept, record.targetDomain, record.vibeStyle, record.mode, json.dumps(payload.model_dump()), record.createdAt),
            )
        connection.close()
    except Exception as error:
        raise HTTPException(status_code=503, detail=f"History database unavailable: {error}") from error
    return record


@app.get("/api/analogy/history")
def list_history(limit: int = Query(default=30, ge=1, le=100)):
    try:
        connection = db_connect()
        rows = connection.execute(
            "SELECT id, concept, target_domain, vibe_style, mode, payload, created_at FROM analogies ORDER BY created_at DESC LIMIT %s",
            (limit,),
        ).fetchall()
        connection.close()
    except Exception as error:
        raise HTTPException(status_code=503, detail=f"History database unavailable: {error}") from error
    return [
        {"id": row[0], "concept": row[1], "targetDomain": row[2], "vibeStyle": row[3], "mode": row[4], "analogyTitle": row[5]["analogyTitle"], "createdAt": row[6].isoformat()}
        for row in rows
    ]


@app.get("/api/analogy/{analogy_id}", response_model=SavedAnalogy)
def get_analogy(analogy_id: str):
    try:
        connection = db_connect()
        row = connection.execute(
            "SELECT id, concept, target_domain, vibe_style, mode, payload, created_at FROM analogies WHERE id = %s",
            (analogy_id,),
        ).fetchone()
        connection.close()
    except Exception as error:
        raise HTTPException(status_code=503, detail=f"History database unavailable: {error}") from error
    if not row:
        raise HTTPException(status_code=404, detail="Analogy not found")
    return SavedAnalogy(id=row[0], concept=row[1], targetDomain=row[2], vibeStyle=row[3], mode=row[4], payload=row[5], createdAt=row[6].isoformat())


@app.delete("/api/analogy/{analogy_id}")
def delete_analogy(analogy_id: str):
    try:
        connection = db_connect()
        result = connection.execute("DELETE FROM analogies WHERE id = %s", (analogy_id,))
        connection.commit()
        connection.close()
    except Exception as error:
        raise HTTPException(status_code=503, detail=f"History database unavailable: {error}") from error
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Analogy not found")
    return {"ok": True}
