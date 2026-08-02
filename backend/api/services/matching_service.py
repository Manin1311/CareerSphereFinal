import hashlib
import logging
import re

logger = logging.getLogger(__name__)

def _normalize_skill(s):
    """Normalize skill string for fuzzy matching (e.g. 'HTML5' -> 'html', 'CSS3' -> 'css', 'JS' -> 'javascript')."""
    if not s:
        return ""
    s = str(s).lower().strip()
    s = re.sub(r'[\d\.\-\_\s]', '', s)
    if s in ['js', 'javascript']:
        return 'javascript'
    if s in ['reactjs', 'react']:
        return 'react'
    if s in ['nodejs', 'node']:
        return 'node'
    return s

def _get_flat_skills(skills_input):
    """Recursively flattens skills input into a clean list of strings from lists, dicts, or nested objects."""
    if not skills_input:
        return []
    flat = []
    if isinstance(skills_input, list):
        for item in skills_input:
            if isinstance(item, dict):
                val = item.get("canonical_skill") or item.get("name") or item.get("skill") or str(item)
                flat.append(str(val))
            elif isinstance(item, str):
                flat.append(item)
            elif isinstance(item, list):
                flat.extend(_get_flat_skills(item))
    elif isinstance(skills_input, dict):
        for k, v in skills_input.items():
            flat.extend(_get_flat_skills(v))
    elif isinstance(skills_input, str):
        flat.append(skills_input)
    return flat

def calculate_unified_match_score(skills, total_exp_years, location, entity_id_str, session):
    """
    Unified, deterministic, and realistic match score calculation (15–98%) shared by:
    - Seeker Find Jobs (/jobs/search)
    - Seeker Applications (/jobs/applications)
    - Recruiter Dashboard & Candidate Profiles
    """
    if not session:
        return 75, {"match_score": 75}

    criteria = getattr(session, "criteria", {}) or {}
    if not isinstance(criteria, dict):
        criteria = {}
        
    required_skills = criteria.get("required_skills", [])
    if not required_skills and getattr(session, "inferred_skills", None):
        required_skills = session.inferred_skills or []

    req_norm_list = [_normalize_skill(r) for r in required_skills if r]

    flat_skills = _get_flat_skills(skills)
    cand_norm_set = {_normalize_skill(s) for s in flat_skills if s}

    # Match calculation using normalized skills
    matched_list = []
    for r in required_skills:
        rn = _normalize_skill(r)
        if rn and (rn in cand_norm_set or any(rn in c or c in rn for c in cand_norm_set if len(c) > 2)):
            matched_list.append(r)

    missing_list = [r for r in required_skills if r not in matched_list]
    matched_count = len(matched_list)

    if req_norm_list:
        skill_score = round((matched_count / len(req_norm_list)) * 100)
    else:
        skill_score = 60

    # Job Title relevance boost if candidate skills align with title domain
    title_lower = (session.job_title or "").lower()
    title_boost = 0
    tech_keywords = ['frontend', 'web', 'developer', 'software', 'python', 'javascript', 'ui', 'backend', 'full-stack', 'fullstack', 'coding', 'engineer']
    if any(k in title_lower for k in tech_keywords):
        if skill_score > 0 or any(c in title_lower for c in cand_norm_set if len(c) > 3):
            title_boost = 25

    # Experience score
    min_exp = criteria.get("min_experience", 0)
    try:
        exp_val = total_exp_years if total_exp_years is not None else 0
        exp_years = float(exp_val)
    except (ValueError, TypeError):
        exp_years = 0.0
    experience_score = min(100, round((exp_years / max(min_exp, 1)) * 100)) if min_exp > 0 else (80 if exp_years >= 2 else 60)

    # Location score
    preferred_locs = criteria.get("preferred_locations", [])
    cand_location = (location or "").lower().strip()
    location_score = 100 if not preferred_locs else (100 if any(str(l).lower().strip() in cand_location for l in preferred_locs) else 50)

    # Deterministic hash offset (0-6%) to differentiate identical scores
    if entity_id_str:
        md5_hex = hashlib.md5(str(entity_id_str).encode('utf-8')).hexdigest()
        hash_offset = int(md5_hex[:4], 16) % 7
    else:
        hash_offset = 3

    # Weighted score: skills (55%), title relevance (25%), experience (20%)
    raw_score = round(
        skill_score * 0.55 + 
        title_boost * 0.25 + 
        experience_score * 0.20
    )
    score = min(98, max(15, raw_score + hash_offset))

    details = {
        "match_score": score,
        "skill_score": skill_score,
        "experience_score": experience_score,
        "location_score": location_score,
        "matched_skills": matched_list,
        "missing_skills": missing_list,
        "matched_count": matched_count,
        "total_required": len(req_norm_list)
    }
    return score, details
