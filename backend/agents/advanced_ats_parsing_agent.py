import json
import logging
import re
import uuid
from agents.llm import RotateLLMClient

logger = logging.getLogger(__name__)

class AdvancedAtsParsingAgent:
    """
    Advanced, separate, and token-efficient Resume Parsing Agent.
    Uses gemini-2.5-flash for high extraction accuracy at low token cost.
    Parses resume text directly into the schema expected by the React frontend editor,
    extracting summary, skills, experience, education, projects (with techStack),
    certifications, languages, and links.
    """
    def __init__(self):
        self.client = RotateLLMClient()

    @staticmethod
    def extract_text_column_aware(file_path: str) -> str:
        """
        Column-aware PDF text extraction using PyMuPDF.
        Splits pages into left and right columns if a vertical layout division is detected.
        Conserves section integrity for two-column resumes.
        Falls back to standard get_text() for non-PDF files.

        Fallback chain (handles AI-polished/downloaded PDFs that may have no selectable text):
          1. PyMuPDF blocks (column-aware, best quality)
          2. PyMuPDF get_text("text") — simple full-page plain text
          3. pdfplumber — handles complex font-embedded PDFs
        """
        import pymupdf as fitz
        from pathlib import Path

        ext = Path(file_path).suffix.lower()
        try:
            if ext == ".pdf":
                doc = fitz.open(file_path)
                try:
                    pages_text = []
                    for page in doc:
                        blocks = page.get_text("blocks")
                        # filter out empty blocks and non-text blocks
                        blocks = [b for b in blocks if b[4].strip() and b[6] == 0]

                        page_width = page.rect.width
                        page_height = page.rect.height

                        # ── LAYER 1: column-aware block extraction ──────────────────
                        if blocks:
                            # Search for best vertical split x between 25% and 75% width
                            best_x = None
                            min_crossings = float('inf')

                            start_x = int(page_width * 0.25)
                            end_x = int(page_width * 0.75)

                            for x in range(start_x, end_x, 5):
                                crossings = 0
                                for b in blocks:
                                    x0, y0, x1, y1 = b[0], b[1], b[2], b[3]
                                    if y0 >= 120 and y1 <= page_height - 80:
                                        if x0 < x < x1:
                                            crossings += 1

                                if crossings < min_crossings:
                                    min_crossings = crossings
                                    best_x = x

                            is_two_column = False
                            if len(blocks) > 4 and best_x is not None:
                                left_count = 0
                                right_count = 0
                                spanning_count = 0
                                for b in blocks:
                                    x0, y0, x1, y1 = b[0], b[1], b[2], b[3]
                                    if y0 >= 100 and y1 <= page_height - 60:
                                        width = x1 - x0
                                        if width > page_width * 0.70:
                                            spanning_count += 1
                                        elif x1 <= best_x + 15:
                                            left_count += 1
                                        elif x0 >= best_x - 15:
                                            right_count += 1
                                if left_count >= 2 and right_count >= 2 and spanning_count <= 2:
                                    is_two_column = True

                            if is_two_column:
                                header_blocks = []
                                footer_blocks = []
                                left_blocks = []
                                right_blocks = []

                                for b in blocks:
                                    x0, y0, x1, y1 = b[0], b[1], b[2], b[3]
                                    if y0 < 120:
                                        header_blocks.append(b)
                                    elif y1 > page_height - 80:
                                        footer_blocks.append(b)
                                    else:
                                        center_x = (x0 + x1) / 2.0
                                        if center_x < best_x:
                                            left_blocks.append(b)
                                        else:
                                            right_blocks.append(b)

                                header_blocks.sort(key=lambda x: (x[1], x[0]))
                                left_blocks.sort(key=lambda x: (x[1], x[0]))
                                right_blocks.sort(key=lambda x: (x[1], x[0]))
                                footer_blocks.sort(key=lambda x: (x[1], x[0]))

                                page_text = []
                                for b in header_blocks:
                                    page_text.append(b[4].strip())
                                page_text.append("[LEFT COLUMN]")
                                for b in left_blocks:
                                    page_text.append(b[4].strip())
                                page_text.append("[RIGHT COLUMN]")
                                for b in right_blocks:
                                    page_text.append(b[4].strip())
                                for b in footer_blocks:
                                    page_text.append(b[4].strip())
                                pages_text.append("\n".join(page_text))
                            else:
                                blocks.sort(key=lambda x: (x[1], x[0]))
                                pages_text.append("\n".join(b[4].strip() for b in blocks))

                        else:
                            # ── LAYER 2: fallback — plain get_text("text") ──────────
                            # Handles PDFs where blocks are empty but text stream exists
                            plain = page.get_text("text").strip()
                            if plain:
                                pages_text.append(plain)
                            else:
                                # ── LAYER 3: mark page as needing pdfplumber ─────────
                                pages_text.append("")  # placeholder

                    full_text = "\n\n".join(pages_text).strip()

                    # ── LAYER 3: pdfplumber fallback if still mostly empty ──────────
                    if len(full_text) < 200:
                        try:
                            import pdfplumber
                            with pdfplumber.open(file_path) as pdf:
                                plumber_pages = []
                                for pg in pdf.pages:
                                    t = pg.extract_text()
                                    if t:
                                        plumber_pages.append(t)
                            plumber_text = "\n\n".join(plumber_pages).strip()
                            if len(plumber_text) > len(full_text):
                                full_text = plumber_text
                        except Exception as plumber_err:
                            logger.warning("pdfplumber fallback failed: %s", plumber_err)

                    return full_text
                finally:
                    doc.close()
            elif ext in [".docx", ".doc"]:
                from docx import Document
                doc = Document(file_path)
                return "\n".join(p.text for p in doc.paragraphs if p.text.strip())
            else:
                with open(file_path, "r", errors="ignore") as f:
                    return f.read()
        except Exception as e:
            logger.error("Column-aware extraction failed for %s: %s", file_path, e)
            return ""


    def preprocess_text(self, text: str) -> str:
        """
        Compress text to save input tokens:
        - Replaces 3+ consecutive newlines with exactly 2 newlines.
        - Trims whitespace from individual lines.
        - Limits maximum text length.
        """
        if not text:
            return ""
        lines = [line.strip() for line in text.splitlines()]
        cleaned_lines = []
        consecutive_empty = 0
        for line in lines:
            if not line:
                consecutive_empty += 1
                if consecutive_empty <= 1:
                    cleaned_lines.append(line)
            else:
                consecutive_empty = 0
                cleaned_lines.append(line)
        
        cleaned_text = "\n".join(cleaned_lines)
        return cleaned_text[:12000]

    def clean_url(self, url: str) -> str:
        """Helper to ensure URLs are formatted properly with a protocol."""
        if not url:
            return ""
        url = url.strip()
        if not url:
            return ""
        url = url.rstrip(".,;)")
        if not re.match(r"^https?://", url, re.IGNORECASE):
            if "/" not in url and "." not in url:
                return ""
            return "https://" + url
        return url

    async def parse(self, text: str) -> dict:
        preprocessed = self.preprocess_text(text)
        if not preprocessed.strip():
            return self.get_empty_resume_dict()

        system_prompt = (
            "You are an elite AI Resume Parsing Agent. Your task is to perform 100% COMPLETE, VERBATIM EXTRACTION "
            "of ALL content from the candidate's resume. Do NOT omit, drop, combine, or compress any experience role, "
            "company, job title, date range, or bullet point.\n\n"
            "CRITICAL EXTRACTION MANDATES:\n"
            "1. EXPERIENCE: Extract EVERY SINGLE work experience / job entry listed on the resume. If the resume has "
            "2 or more jobs (e.g. 'Marketing Executive' and 'Operations Associate'), you MUST extract BOTH jobs as separate "
            "entries in the 'experience' array. NEVER drop an entry.\n"
            "2. SKILLS EXTRACTION: Look at how skills are presented on the resume:\n"
            "   - If skills are listed as FLAT items (just a list of skill names with no category labels), output 'skills' as a flat array: [\"Python\", \"React\", ...]\n"
            "   - If skills are grouped under CATEGORY HEADINGS like 'Languages: Python, Java', 'Frontend: React, CSS', 'Backend & Frameworks: Flask, Node.js', 'Databases: MySQL', 'Tools & Platforms: Git, Docker', \n"
            "     then output 'skills' as an array of category objects: [{\"category\": \"Languages\", \"skills\": [\"Python\", \"Java\"]}, {\"category\": \"Frontend\", \"skills\": [\"React\", \"CSS\"]}]\n"
            "   - PRESERVE THE EXACT CATEGORY NAMES as they appear in the resume. DO NOT merge or flatten categories.\n"
            "   - Extract ALL skills within each category completely.\n"
            "3. PROJECTS: Extract ALL projects. For each project:\n"
            "   - 'name': the project title (e.g. 'SkillVerse')\n"
            "   - 'subtitle': the descriptive tagline or type if present in italics or em-dash (e.g. 'Flask Freelance Marketplace', 'AI-Powered Study Platform'). Empty string if none.\n"
            "   - 'bullets': array of individual bullet points describing the project. Each bullet must be a SEPARATE string in the array. Do NOT merge bullets into one paragraph.\n"
            "   - 'techStack': array of technology names from the 'Stack:' line if present.\n"
            "   - 'link': project URL if mentioned, else empty string.\n"
            "4. CERTIFICATIONS: Extract ALL certifications. If a certification section exists with names like 'AWS Certified', "
            "'Google Analytics Certified', extract each as a separate entry with name, issuer, and date. If a LinkedIn "
            "certifications URL is present, create one entry named 'View all certifications' with the URL as the link field.\n"
            "5. LANGUAGES: Extract ALL languages listed on the resume. Common patterns: 'Languages: English, Hindi, Gujarati' "
            "or a dedicated Languages section. Extract each language with its proficiency level if mentioned (Native, Fluent, "
            "Intermediate, Basic, Learning). If proficiency appears in parentheses like 'C++ (learning)', include it.\n"
            "6. If ANY section (certifications, languages, projects, etc.) is NOT present on the resume, return an empty array [] "
            "for that field. Do NOT hallucinate or invent entries that are not in the source text.\n\n"
            "Extract everything into this exact JSON schema:\n"
            "{\n"
            "  \"personalInfo\": {\n"
            "    \"fullName\": \"full legal name\",\n"
            "    \"title\": \"professional headline or current role\",\n"
            "    \"email\": \"email address\",\n"
            "    \"phone\": \"phone number\",\n"
            "    \"location\": \"city, state or country\",\n"
            "    \"website\": \"personal website URL or empty string\",\n"
            "    \"linkedin\": \"full LinkedIn profile URL or empty string\",\n"
            "    \"github\": \"full GitHub profile URL or empty string\"\n"
            "  },\n"
            "  \"summary\": \"professional summary or profile paragraph\",\n"
            "  \"skills\": [\"use flat array if uncategorized, OR array of {category, skills[]} objects if categorized\"],\n"
            "  \"experience\": [\n"
            "    {\n"
            "      \"company\": \"Company Name\",\n"
            "      \"title\": \"Job Title\",\n"
            "      \"location\": \"City, Country\",\n"
            "      \"startDate\": \"Jan 2024\",\n"
            "      \"endDate\": \"Present\",\n"
            "      \"bullets\": [\"Achieved X by doing Y\", \"Led team of Z people\"]\n"
            "    }\n"
            "  ],\n"
            "  \"education\": [\n"
            "    {\n"
            "      \"school\": \"University Name\",\n"
            "      \"degree\": \"MBA Marketing\",\n"
            "      \"location\": \"City\",\n"
            "      \"startDate\": \"2020\",\n"
            "      \"endDate\": \"2022\"\n"
            "    }\n"
            "  ],\n"
            "  \"projects\": [\n"
            "    {\n"
            "      \"name\": \"SkillVerse\",\n"
            "      \"subtitle\": \"Flask Freelance Marketplace\",\n"
            "      \"link\": \"\",\n"
            "      \"bullets\": [\"Fiverr-like marketplace with service listings\", \"Integrated Cloudinary for media storage\"],\n"
            "      \"techStack\": [\"Python\", \"Flask\", \"React\"]\n"
            "    }\n"
            "  ],\n"
            "  \"certifications\": [\n"
            "    {\n"
            "      \"name\": \"Google Analytics Certified\",\n"
            "      \"issuer\": \"Google\",\n"
            "      \"date\": \"2023\",\n"
            "      \"link\": \"https://credential-url-if-present-or-empty-string\"\n"
            "    }\n"
            "  ],\n"
            "  \"languages\": [\n"
            "    {\n"
            "      \"name\": \"English\",\n"
            "      \"proficiency\": \"Fluent\"\n"
            "    },\n"
            "    {\n"
            "      \"name\": \"Hindi\",\n"
            "      \"proficiency\": \"Native\"\n"
            "    }\n"
            "  ]\n"
            "}\n\n"
            "ADDITIONAL RULES:\n"
            "1. For GitHub URL: look for 'github.com/username' and construct full URL.\n"
            "2. For LinkedIn URL: look for 'linkedin.com/in/slug' and construct full URL.\n"
            "3. CRITICAL: Each bullet point in bullets arrays must be a SEPARATE string. Never merge multiple bullets into one string.\n"
            "4. Clean up bullets — remove leading symbols (▸, •, -, *, ●) from each bullet string.\n"
            "5. Return ONLY valid JSON. No markdown. No explanation."
        )

        try:
            response = self.client.chat.completions.create(
                model="gemini-1.5-flash",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Resume Text:\n{preprocessed}"}
                ],
                temperature=0.0,
                response_format={"type": "json_object"}
            )
            raw = response.choices[0].message.content.strip()
            
            if raw.startswith("```json"):
                raw = raw[7:]
            if raw.startswith("```"):
                raw = raw[3:]
            if raw.endswith("```"):
                raw = raw[:-3]
            raw = raw.strip()

            parsed = json.loads(raw)
            normalized = self.normalize_parsed_content(parsed)

            # Recovery: fill any missing sections from fallback parser
            text_lower = preprocessed.lower()
            fallback = None
            
            if not normalized.get("experience") and ("experience" in text_lower or "employment" in text_lower):
                if not fallback:
                    fallback = self._fallback_text_parse(text)
                if fallback.get("experience"):
                    normalized["experience"] = fallback["experience"]

            if not normalized.get("skills") and "skills" in text_lower:
                if not fallback:
                    fallback = self._fallback_text_parse(text)
                if fallback.get("skills"):
                    normalized["skills"] = fallback["skills"]

            if not normalized.get("certifications") and ("certif" in text_lower or "certificate" in text_lower):
                if not fallback:
                    fallback = self._fallback_text_parse(text)
                if fallback.get("certifications"):
                    normalized["certifications"] = fallback["certifications"]

            if not normalized.get("languages") and "language" in text_lower:
                if not fallback:
                    fallback = self._fallback_text_parse(text)
                if fallback.get("languages"):
                    normalized["languages"] = fallback["languages"]

            if not normalized.get("education") and ("education" in text_lower or "academic" in text_lower):
                if not fallback:
                    fallback = self._fallback_text_parse(text)
                if fallback.get("education"):
                    normalized["education"] = fallback["education"]

            return normalized

        except Exception as e:
            logger.error("AdvancedAtsParsingAgent parsing failed: %s — running fallback parser", e)
            return self._fallback_text_parse(text)

    def _fallback_text_parse(self, text: str) -> dict:
        """Deterministic regex-based fallback parser when LLM response is incomplete or fails.
        Extracts: contact info, experience, skills, education, certifications, languages, projects."""
        res = self.get_empty_resume_dict()
        if not text:
            return res

        # Contact Info
        email_re = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)
        if email_re:
            res["personalInfo"]["email"] = email_re.group(0)

        phone_re = re.search(r'[\+\(]?[0-9][0-9\s\-\(\)]{8,15}[0-9]', text)
        if phone_re:
            res["personalInfo"]["phone"] = phone_re.group(0).strip()

        linkedin_re = re.search(r'(?:https?://)?(?:www\.)?linkedin\.com/in/[\w-]+', text, re.IGNORECASE)
        if linkedin_re:
            res["personalInfo"]["linkedin"] = self.clean_url(linkedin_re.group(0))

        github_re = re.search(r'(?:https?://)?(?:www\.)?github\.com/[\w-]+', text, re.IGNORECASE)
        if github_re:
            res["personalInfo"]["github"] = self.clean_url(github_re.group(0))

        lines = [l.strip() for l in text.splitlines() if l.strip()]
        if lines:
            res["personalInfo"]["fullName"] = lines[0]

        # ---- Section-aware parser ----
        # Identify section boundaries by detecting header-like lines
        section_headers = {
            "summary": ["summary", "profile", "objective", "about"],
            "skills": ["skills", "technical skills", "core competencies", "expertise", "technologies"],
            "experience": ["experience", "work experience", "work history", "employment", "professional experience", "internship"],
            "education": ["education", "academic background", "academics", "qualification"],
            "projects": ["projects", "personal projects", "academic projects"],
            "certifications": ["certifications", "certificates", "certification", "professional certifications"],
            "languages": ["languages", "language proficiency", "known languages"],
        }

        # Build ordered section map: [(section_name, start_line_index), ...]
        section_map = []
        for i, line in enumerate(lines):
            clean_line = line.strip().strip(":-•▸*●◦").strip().lower()
            if len(clean_line.split()) > 4:
                continue
            for sec_name, keywords in section_headers.items():
                if any(clean_line == kw or re.fullmatch(rf'{re.escape(kw)}s?', clean_line) for kw in keywords):
                    section_map.append((sec_name, i))
                    break

        def _get_section_lines(sec_name):
            """Get all lines belonging to a section."""
            sec_lines = []
            for idx, (name, start) in enumerate(section_map):
                if name == sec_name:
                    end = section_map[idx + 1][1] if idx + 1 < len(section_map) else len(lines)
                    sec_lines.extend(lines[start + 1:end])
            return sec_lines

        # --- Experience ---
        date_pattern = re.compile(
            r'((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{4})'
            r'\s*[–\-\u2013—to]+\s*'
            r'((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{4}|Present|Current)',
            re.IGNORECASE
        )
        exp_lines = _get_section_lines("experience")
        exp_entries = []
        current_exp = None
        for line in exp_lines:
            m = date_pattern.search(line)
            if m:
                if current_exp:
                    exp_entries.append(current_exp)
                role_part = date_pattern.sub('', line).strip().strip('|—–- ').strip()
                current_exp = {
                    "id": str(uuid.uuid4()),
                    "company": role_part,
                    "title": role_part,
                    "location": "",
                    "startDate": m.group(1),
                    "endDate": m.group(2),
                    "bullets": []
                }
            elif current_exp and line.startswith(("•", "-", "▸", "*", "●")):
                current_exp["bullets"].append(line.lstrip("•-▸*● ").strip())
            elif current_exp and not line.startswith(("•", "-", "▸", "*")) and len(line.split()) > 3:
                current_exp["bullets"].append(line)
        if current_exp:
            exp_entries.append(current_exp)
        res["experience"] = exp_entries

        # --- Skills ---
        skills_set = set()
        skill_lines = _get_section_lines("skills")
        for line in skill_lines:
            cleaned = re.sub(
                r'^(Marketing|Analytics|Tools|Soft Skills|Technical Skills|Skills|Programming|'
                r'Frameworks|Databases|Cloud|DevOps|Design|Other|Core):\s*',
                '', line, flags=re.IGNORECASE
            )
            for item in re.split(r'[,|•·;]', cleaned):
                item_clean = item.strip().strip('"\'')
                if item_clean and 2 <= len(item_clean) < 50:
                    skills_set.add(item_clean)
        res["skills"] = sorted(list(skills_set))

        # --- Education ---
        edu_lines = _get_section_lines("education")
        edu_entries = []
        current_edu = None
        for line in edu_lines:
            m = date_pattern.search(line)
            if m or re.search(r'(university|institute|college|school|b\.|m\.|mba|bca|btech|mtech|b\.com|b\.sc)', line, re.IGNORECASE):
                if current_edu:
                    edu_entries.append(current_edu)
                degree_part = date_pattern.sub('', line).strip().strip('|—–- ').strip()
                current_edu = {
                    "id": str(uuid.uuid4()),
                    "school": degree_part,
                    "degree": degree_part,
                    "location": "",
                    "startDate": m.group(1) if m else "",
                    "endDate": m.group(2) if m else ""
                }
        if current_edu:
            edu_entries.append(current_edu)
        res["education"] = edu_entries

        # --- Certifications ---
        cert_lines = _get_section_lines("certifications")
        cert_entries = []
        for line in cert_lines:
            if line and len(line) > 3:
                cert_entries.append({
                    "id": str(uuid.uuid4()),
                    "name": line.strip().strip("•-▸*● "),
                    "issuer": "",
                    "date": ""
                })
        res["certifications"] = cert_entries

        # --- Languages ---
        lang_lines = _get_section_lines("languages")
        lang_entries = []
        known_languages = [
            "english", "hindi", "gujarati", "marathi", "tamil", "telugu", "kannada", "bengali",
            "punjabi", "urdu", "french", "german", "spanish", "chinese", "japanese", "korean",
            "arabic", "portuguese", "russian", "italian", "dutch", "swedish", "malay", "thai"
        ]
        for line in lang_lines:
            for item in re.split(r'[,|•·;]', line):
                item_clean = item.strip()
                if not item_clean:
                    continue
                # Check for proficiency in parentheses or after dash
                prof_match = re.match(r'^(.+?)\s*[\(\-–:]+\s*(.+?)\s*\)?$', item_clean)
                if prof_match:
                    lang_entries.append({
                        "id": str(uuid.uuid4()),
                        "name": prof_match.group(1).strip(),
                        "proficiency": prof_match.group(2).strip()
                    })
                elif item_clean.lower() in known_languages or len(item_clean.split()) <= 2:
                    lang_entries.append({
                        "id": str(uuid.uuid4()),
                        "name": item_clean,
                        "proficiency": ""
                    })

        # If no dedicated section found, search for inline "Languages: English, Hindi" pattern
        if not lang_entries:
            lang_inline = re.search(r'languages?\s*[:\-]\s*(.+)', text, re.IGNORECASE)
            if lang_inline:
                for item in re.split(r'[,|•·;]', lang_inline.group(1)):
                    item_clean = item.strip()
                    if item_clean and len(item_clean) < 30:
                        lang_entries.append({
                            "id": str(uuid.uuid4()),
                            "name": item_clean,
                            "proficiency": ""
                        })
        res["languages"] = lang_entries

        # --- Projects ---
        proj_lines = _get_section_lines("projects")
        proj_entries = []
        current_proj = None
        for line in proj_lines:
            if line and not line.startswith(("•", "-", "▸", "*", "●")) and len(line.split()) <= 8:
                if current_proj:
                    proj_entries.append(current_proj)
                current_proj = {
                    "id": str(uuid.uuid4()),
                    "name": line.strip(),
                    "link": "",
                    "bullets": [],
                    "description": "",
                    "techStack": []
                }
            elif current_proj:
                stripped = line.lstrip("•-▸*● ").strip()
                tech_match = re.match(r'^(?:stack|tech|technologies|built with)\s*:\s*(.+)', stripped, re.IGNORECASE)
                if tech_match:
                    current_proj["techStack"] = [t.strip() for t in tech_match.group(1).split(",") if t.strip()]
                else:
                    current_proj["bullets"].append(stripped)
        if current_proj:
            proj_entries.append(current_proj)
        res["projects"] = proj_entries

        return res

    def get_empty_resume_dict(self) -> dict:
        return {
            "personalInfo": {
                "fullName": "",
                "title": "",
                "email": "",
                "phone": "",
                "location": "",
                "website": "",
                "linkedin": "",
                "github": ""
            },
            "summary": "",
            "skills": [],
            "experience": [],
            "education": [],
            "projects": [],
            "certifications": [],
            "languages": []
        }

    def normalize_parsed_content(self, parsed: dict) -> dict:
        schema = self.get_empty_resume_dict()
        
        # Merge personal info
        p_info = parsed.get("personalInfo") or {}
        if isinstance(p_info, dict):
            for k in schema["personalInfo"]:
                val = p_info.get(k) or ""
                if k in ["website", "linkedin", "github"] and val:
                    schema["personalInfo"][k] = self.clean_url(val)
                else:
                    schema["personalInfo"][k] = str(val).strip()

        schema["summary"] = str(parsed.get("summary") or "").strip()

        # Skills — handled below after Projects section (supports both flat and categorized)

        # Experience
        raw_exp = parsed.get("experience") or []
        if isinstance(raw_exp, list):
            for item in raw_exp:
                if not isinstance(item, dict):
                    continue
                bullets = item.get("bullets") or []
                if not isinstance(bullets, list):
                    bullets = [bullets] if bullets else []
                schema["experience"].append({
                    "id": str(uuid.uuid4()),
                    "company": str(item.get("company") or "").strip(),
                    "title": str(item.get("title") or "").strip(),
                    "location": str(item.get("location") or "").strip(),
                    "startDate": str(item.get("startDate") or "").strip(),
                    "endDate": str(item.get("endDate") or "").strip(),
                    "bullets": [str(b).strip() for b in bullets if b]
                })

        # Education
        raw_edu = parsed.get("education") or []
        if isinstance(raw_edu, list):
            for item in raw_edu:
                if not isinstance(item, dict):
                    continue
                schema["education"].append({
                    "id": str(uuid.uuid4()),
                    "school": str(item.get("school") or "").strip(),
                    "degree": str(item.get("degree") or "").strip(),
                    "location": str(item.get("location") or "").strip(),
                    "startDate": str(item.get("startDate") or "").strip(),
                    "endDate": str(item.get("endDate") or "").strip()
                })

        # Skills — handle both flat ["Python", ...] and categorized [{category, skills[]}] formats
        raw_skills = parsed.get("skills") or []
        if isinstance(raw_skills, list) and raw_skills:
            # Detect if it's categorized (list of dicts with 'category' key)
            if isinstance(raw_skills[0], dict) and "category" in raw_skills[0]:
                # Categorized format — store as flat array but preserve categories using prefix trick
                # OR store the categories array directly if frontend supports it
                skill_categories = []
                flat_skills = []
                for cat_obj in raw_skills:
                    if not isinstance(cat_obj, dict):
                        continue
                    cat_name = str(cat_obj.get("category") or "").strip()
                    cat_skills = cat_obj.get("skills") or []
                    if isinstance(cat_skills, list):
                        extracted = [str(s).strip() for s in cat_skills if s]
                        if cat_name:
                            skill_categories.append({"category": cat_name, "skills": extracted})
                        flat_skills.extend(extracted)
                # Store both — categories for display, flat for ATS matching
                schema["skillCategories"] = skill_categories
                schema["skills"] = flat_skills
            else:
                # Flat format
                schema["skills"] = [str(s).strip() for s in raw_skills if s]

        # Projects
        raw_proj = parsed.get("projects") or []
        if isinstance(raw_proj, list):
            for item in raw_proj:
                if not isinstance(item, dict):
                    continue
                link = item.get("link") or ""
                # Parse techStack — can be list or comma-separated string
                raw_tech = item.get("techStack") or item.get("tech_stack") or item.get("technologies") or []
                if isinstance(raw_tech, str):
                    tech_list = [t.strip() for t in raw_tech.split(",") if t.strip()]
                elif isinstance(raw_tech, list):
                    tech_list = [str(t).strip() for t in raw_tech if t]
                else:
                    tech_list = []

                # Prefer the new "bullets" array; fall back to splitting a legacy "description"
                # string so older drafts / older LLM responses don't break.
                raw_bullets = item.get("bullets") or []
                if isinstance(raw_bullets, list) and raw_bullets:
                    bullets_list = [str(b).strip() for b in raw_bullets if str(b).strip()]
                else:
                    legacy_desc = str(item.get("description") or "").strip()
                    if legacy_desc:
                        # Split a dense paragraph into sentence-based bullets as a safety net
                        bullets_list = [
                            s.strip().rstrip(".") + "."
                            for s in re.split(r'(?<=[.!?])\s+', legacy_desc)
                            if s.strip()
                        ]
                    else:
                        bullets_list = []

                schema["projects"].append({
                    "id": str(uuid.uuid4()),
                    "name": str(item.get("name") or "").strip(),
                    "subtitle": str(item.get("subtitle") or "").strip(),
                    "link": self.clean_url(link),
                    "bullets": bullets_list,
                    "description": str(item.get("description") or "").strip() or "\n".join(f"• {b}" for b in bullets_list),  # kept for backward-compat
                    "techStack": tech_list
                })

        # Certifications
        raw_certs = parsed.get("certifications") or []
        if isinstance(raw_certs, list):
            for item in raw_certs:
                if not isinstance(item, dict):
                    continue
                schema["certifications"].append({
                    "id": str(uuid.uuid4()),
                    "name": str(item.get("name") or "").strip(),
                    "issuer": str(item.get("issuer") or "").strip(),
                    "date": str(item.get("date") or "").strip(),
                    "link": self.clean_url(str(item.get("link") or ""))
                })

        # Languages
        raw_langs = parsed.get("languages") or []
        if isinstance(raw_langs, list):
            for item in raw_langs:
                if not isinstance(item, dict):
                    continue
                schema["languages"].append({
                    "id": str(uuid.uuid4()),
                    "name": str(item.get("name") or "").strip(),
                    "proficiency": str(item.get("proficiency") or "").strip()
                })

        return schema