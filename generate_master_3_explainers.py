import os

# Create directory structure or write files directly
base_dir = os.path.dirname(os.path.abspath(__file__))

print("Generating 3 In-Depth Technical Master Explainer HTML Files...")

# ---------------------------------------------------------
# 1. RECRUITER FLOW EXPLAINED (FULL CODE & PORTS)
# ---------------------------------------------------------
recruiter_html = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>CareerSphere — Recruiter Portal Architecture & Logic Guide</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet"/>
<style>
:root{
  --bg:#040408;--surface:#0d0d14;--card:#111118;--border:rgba(255,255,255,0.08);--border-bright:rgba(255,255,255,0.2);
  --text:#e8e8f0;--muted:#94a3b8;--blue:#3b82f6;--green:#10b981;--purple:#8b5cf6;--amber:#f59e0b;--cyan:#06b6d4;--pink:#ec4899;--sky:#38bdf8;
  --code-bg:#080810;--code-border:rgba(255,255,255,0.1);--box-bg:rgba(255,255,255,0.03);--strong-text:#ffffff;
}
body.light-mode {
  --bg:#f8fafc;--surface:#ffffff;--card:#ffffff;--border:rgba(0,0,0,0.08);--border-bright:rgba(0,0,0,0.18);
  --text:#0f172a;--muted:#475569;--blue:#2563eb;--green:#059669;--purple:#7c3aed;--amber:#d97706;--cyan:#0891b2;--pink:#db2777;--sky:#0284c7;
  --code-bg:#f1f5f9;--code-border:rgba(0,0,0,0.12);--box-bg:rgba(0,0,0,0.025);--strong-text:#0f172a;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;line-height:1.7;overflow-x:hidden;transition:background .3s,color .3s}
::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:#64748b;border-radius:99px}
.theme-toggle-btn {
  position: fixed; top: 20px; right: 20px; z-index: 100;
  display: flex; align-items: center; gap: 8px;
  padding: 10px 18px; border-radius: 99px;
  background: var(--surface); border: 1px solid var(--border-bright);
  color: var(--text); font-size: 13px; font-weight: 700; cursor: pointer;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2); transition: transform .2s;
}
.theme-toggle-btn:hover { transform: scale(1.05); }
.hero{min-height:55vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:80px 24px 40px;position:relative;overflow:hidden}
.hero-bg{position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 50% -10%,rgba(56,189,248,0.15) 0%,transparent 60%);pointer-events:none}
.badge{display:inline-flex;align-items:center;gap:8px;padding:6px 18px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;border:1px solid rgba(56,189,248,0.4);background:rgba(56,189,248,0.1);color:var(--sky);margin-bottom:24px}
.bdot{width:7px;height:7px;border-radius:50%;background:var(--sky);box-shadow:0 0 8px var(--sky);animation:pdot 2s ease-in-out infinite}
@keyframes pdot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.7)}}
h1.hero-title{font-size:clamp(2.2rem,5vw,4.2rem);font-weight:900;line-height:1.1;letter-spacing:-.03em;background:linear-gradient(135deg,var(--strong-text) 0%,var(--sky) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:18px}
.hero-sub{font-size:clamp(1rem,1.8vw,1.2rem);color:var(--muted);max-width:750px;margin:0 auto 40px}
.container{max-width:1100px;margin:0 auto;padding:0 24px 80px}
.sechdr{text-align:center;margin-bottom:50px}
.seclbl{display:inline-block;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:10px}
.sechdr h2{font-size:clamp(1.8rem,3.2vw,2.6rem);font-weight:800;letter-spacing:-.025em;color:var(--strong-text)}
.port-box{background:var(--surface);border:1px solid var(--border-bright);border-radius:20px;padding:24px;margin-bottom:40px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:20px}
.port-badge{background:var(--box-bg);border:1px solid var(--border);padding:10px 16px;border-radius:12px;font-family:'JetBrains Mono',monospace;font-size:0.85rem}
.port-badge span{color:var(--sky);font-weight:700}
.acard{background:var(--card);border:1px solid var(--border);border-radius:24px;padding:32px;margin-bottom:32px;box-shadow:0 8px 24px rgba(0,0,0,0.04)}
.codeblk{background:var(--code-bg);border:1px solid var(--code-border);border-radius:12px;padding:20px;font-family:'JetBrains Mono',monospace;font-size:0.82rem;line-height:1.7;color:#34d399;overflow-x:auto;margin:16px 0}
.viva-box{background:var(--surface);border:1px solid var(--border-bright);border-radius:20px;padding:28px;margin-bottom:20px}
.viva-q{font-size:1.05rem;font-weight:800;color:var(--sky);margin-bottom:10px}
.viva-a{font-size:.95rem;color:var(--text);line-height:1.7;background:var(--box-bg);padding:16px 20px;border-radius:12px;border-left:4px solid var(--blue)}
</style>
</head>
<body>

<button class="theme-toggle-btn" id="themeBtn" onclick="toggleTheme()">☀️ Light Mode</button>

<div class="hero">
  <div class="hero-bg"></div>
  <div class="badge"><div class="bdot"></div>Recruiter Architecture & Network Guide</div>
  <h1 class="hero-title">Recruiter Portal: Network Ports & Code Logic</h1>
  <p class="hero-sub">Complete breakdown of network communication across Port 5173 (Frontend React) and Port 8000 (Backend Django), API endpoints, Candidate Card logic, and Offer Letter generation.</p>
</div>

<div class="container">

  <!-- PORTS & NETWORK SECTION -->
  <div class="sechdr">
    <span class="seclbl">Infrastructure & Networking</span>
    <h2>1. Network Port Usage & System Start Logic</h2>
  </div>

  <div class="port-box">
    <div class="port-badge">🚀 Frontend Port: <span>http://localhost:5173</span> (React Vite Dev Server)</div>
    <div class="port-badge">⚙️ Backend Port: <span>http://localhost:8000</span> (Django REST Framework)</div>
    <div class="port-badge">🔄 CORS Policy: <span>CORS_ALLOW_ALL_ORIGINS = True</span></div>
  </div>

  <div class="acard">
    <h3>run.bat System Startup Logic</h3>
    <p>Both servers launch in parallel terminals when running <code>.\run.bat</code>:</p>
    <div class="codeblk">:: run.bat Execution Flow
start cmd /k "cd backend && python manage.py runserver 8000"
start cmd /k "cd frontend && npm run dev -- --port 5173"</div>
  </div>

  <!-- CODE LOGIC SECTION -->
  <div class="sechdr">
    <span class="seclbl">Code Deep Dive</span>
    <h2>2. Recruiter Code Logic & Endpoints</h2>
  </div>

  <div class="acard">
    <h3>A. Candidate Forwarding Logic (candidates.py)</h3>
    <p>Endpoint: <code>PATCH /api/v1/sessions/&lt;session_id&gt;/candidates/&lt;cand_id&gt;/action</code></p>
    <p>Recruiters possess <strong>Super-Admin Manual Override</strong> power. Clicking "Forward" increments the round index and generates the next round access token proactively.</p>
    <div class="codeblk"># backend/api/views/candidates.py (candidate_action)
if action == "forward":
    if candidate.current_round_index >= max_round:
        return JsonResponse(error_response("Already at last round"), status=400)

    candidate.current_round_index += 1
    candidate.status = "forwarded"
    JobApplication.objects.filter(candidate=candidate).update(status="shortlisted")

    # Proactively generate attempt token ticket for next round
    next_sr = SessionRound.objects.filter(session=session, round_number=candidate.current_round_index).first()
    if next_sr:
        token = secrets.token_urlsafe(32)
        ApplicantRoundAttempt.objects.get_or_create(
            candidate=candidate, round=next_sr,
            defaults={"access_token": token, "token_expires_at": timezone.now() + timedelta(days=7), "status": "pending"}
        )</div>
  </div>

  <div class="acard">
    <h3>B. CandidateCard.jsx Forward & Hire Handler (Frontend)</h3>
    <p>Location: <code>frontend/src/components/CandidateCard.jsx</code></p>
    <div class="codeblk">// CandidateCard.jsx
const handleForwardOrHire = async () => {
  const isHire = isLastRound;
  if (isHire) {
    setShowOfferModal(true); // Opens Offer Letter Upload Modal
    return;
  }

  setAnimatingOut(true);
  try {
    await candidatesAPI.action(sessionId, candidate?.id, "forward");
    toast.success(`${candidate?.name} forwarded to next round`);
    if (onAction) onAction();
  } catch (e) {
    setAnimatingOut(false);
    toast.error(e.message || "Action failed");
  }
};</div>
  </div>

  <!-- VIVA PREPARATION -->
  <div class="sechdr">
    <span class="seclbl">Viva Exam Questions</span>
    <h2>3. Recruiter Flow Expected Viva Q&A</h2>
  </div>

  <div class="viva-box">
    <div class="viva-q">Q1. Which ports do the Recruiter frontend and backend run on?</div>
    <div class="viva-a">
      <strong>Answer:</strong> The React frontend runs on <strong>Port 5173</strong> (Vite dev server) and communicates with the Django REST API backend running on <strong>Port 8000</strong>. Axios API calls originate from Port 5173 to Port 8000 with CORS headers configured.
    </div>
  </div>

  <div class="viva-box">
    <div class="viva-q">Q2. How does the manual forward feature work when a recruiter clicks "Forward"?</div>
    <div class="viva-a">
      <strong>Answer:</strong> When the recruiter clicks "Forward", <code>CandidateCard.jsx</code> sends a PATCH request to <code>/api/v1/sessions/&lt;session_id&gt;/candidates/&lt;cand_id&gt;/action</code> with payload <code>{ action: "forward" }</code>. The backend updates <code>candidate.current_round_index += 1</code> and pre-generates an <code>ApplicantRoundAttempt</code> token so the candidate can access the next round immediately.
    </div>
  </div>

</div>

<script>
function toggleTheme() {
  document.body.classList.toggle('light-mode');
  const btn = document.getElementById('themeBtn');
  btn.innerHTML = document.body.classList.contains('light-mode') ? '🌙 Dark Mode' : '☀️ Light Mode';
}
</script>
</body>
</html>'''

# ---------------------------------------------------------
# 2. DEVELOPER ARCHITECTURE EXPLAINED (FULL CODE & PORTS)
# ---------------------------------------------------------
developer_html = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>CareerSphere — Developer & System Architecture Guide</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet"/>
<style>
:root{
  --bg:#040408;--surface:#0d0d14;--card:#111118;--border:rgba(255,255,255,0.08);--border-bright:rgba(255,255,255,0.2);
  --text:#e8e8f0;--muted:#94a3b8;--blue:#3b82f6;--green:#10b981;--purple:#8b5cf6;--amber:#f59e0b;--cyan:#06b6d4;--pink:#ec4899;--sky:#38bdf8;
  --code-bg:#080810;--code-border:rgba(255,255,255,0.1);--box-bg:rgba(255,255,255,0.03);--strong-text:#ffffff;
}
body.light-mode {
  --bg:#f8fafc;--surface:#ffffff;--card:#ffffff;--border:rgba(0,0,0,0.08);--border-bright:rgba(0,0,0,0.18);
  --text:#0f172a;--muted:#475569;--blue:#2563eb;--green:#059669;--purple:#7c3aed;--amber:#d97706;--cyan:#0891b2;--pink:#db2777;--sky:#0284c7;
  --code-bg:#f1f5f9;--code-border:rgba(0,0,0,0.12);--box-bg:rgba(0,0,0,0.025);--strong-text:#0f172a;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;line-height:1.7;overflow-x:hidden;transition:background .3s,color .3s}
::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:#64748b;border-radius:99px}
.theme-toggle-btn {
  position: fixed; top: 20px; right: 20px; z-index: 100;
  display: flex; align-items: center; gap: 8px;
  padding: 10px 18px; border-radius: 99px;
  background: var(--surface); border: 1px solid var(--border-bright);
  color: var(--text); font-size: 13px; font-weight: 700; cursor: pointer;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2); transition: transform .2s;
}
.theme-toggle-btn:hover { transform: scale(1.05); }
.hero{min-height:55vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:80px 24px 40px;position:relative;overflow:hidden}
.hero-bg{position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 50% -10%,rgba(56,189,248,0.15) 0%,transparent 60%);pointer-events:none}
.badge{display:inline-flex;align-items:center;gap:8px;padding:6px 18px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;border:1px solid rgba(56,189,248,0.4);background:rgba(56,189,248,0.1);color:var(--sky);margin-bottom:24px}
.bdot{width:7px;height:7px;border-radius:50%;background:var(--sky);box-shadow:0 0 8px var(--sky);animation:pdot 2s ease-in-out infinite}
@keyframes pdot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.7)}}
h1.hero-title{font-size:clamp(2.2rem,5vw,4.2rem);font-weight:900;line-height:1.1;letter-spacing:-.03em;background:linear-gradient(135deg,var(--strong-text) 0%,var(--sky) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:18px}
.hero-sub{font-size:clamp(1rem,1.8vw,1.2rem);color:var(--muted);max-width:750px;margin:0 auto 40px}
.container{max-width:1100px;margin:0 auto;padding:0 24px 80px}
.sechdr{text-align:center;margin-bottom:50px}
.seclbl{display:inline-block;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:10px}
.sechdr h2{font-size:clamp(1.8rem,3.2vw,2.6rem);font-weight:800;letter-spacing:-.025em;color:var(--strong-text)}
.port-box{background:var(--surface);border:1px solid var(--border-bright);border-radius:20px;padding:24px;margin-bottom:40px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:20px}
.port-badge{background:var(--box-bg);border:1px solid var(--border);padding:10px 16px;border-radius:12px;font-family:'JetBrains Mono',monospace;font-size:0.85rem}
.port-badge span{color:var(--sky);font-weight:700}
.acard{background:var(--card);border:1px solid var(--border);border-radius:24px;padding:32px;margin-bottom:32px;box-shadow:0 8px 24px rgba(0,0,0,0.04)}
.codeblk{background:var(--code-bg);border:1px solid var(--code-border);border-radius:12px;padding:20px;font-family:'JetBrains Mono',monospace;font-size:0.82rem;line-height:1.7;color:#34d399;overflow-x:auto;margin:16px 0}
.viva-box{background:var(--surface);border:1px solid var(--border-bright);border-radius:20px;padding:28px;margin-bottom:20px}
.viva-q{font-size:1.05rem;font-weight:800;color:var(--sky);margin-bottom:10px}
.viva-a{font-size:.95rem;color:var(--text);line-height:1.7;background:var(--box-bg);padding:16px 20px;border-radius:12px;border-left:4px solid var(--blue)}
</style>
</head>
<body>

<button class="theme-toggle-btn" id="themeBtn" onclick="toggleTheme()">☀️ Light Mode</button>

<div class="hero">
  <div class="hero-bg"></div>
  <div class="badge"><div class="bdot"></div>Developer Architecture Guide</div>
  <h1 class="hero-title">Developer Deep-Dive: Ports, Code Logic & Models</h1>
  <p class="hero-sub">Full technical explanation of token validation, Groq Whisper API transcription integration, auto-progression algorithms, database models, and server ports.</p>
</div>

<div class="container">

  <!-- PORTS & SYSTEM ARCHITECTURE -->
  <div class="sechdr">
    <span class="seclbl">Network Topology</span>
    <h2>1. Server Port Routing & API Architecture</h2>
  </div>

  <div class="port-box">
    <div class="port-badge">🌐 Frontend: <span>http://localhost:5173</span> (React Vite Dev Server)</div>
    <div class="port-badge">⚙️ Backend: <span>http://localhost:8000</span> (Django WSGI Application)</div>
    <div class="port-badge">🎙️ External API: <span>https://api.groq.com/openai/v1</span> (Groq Whisper)</div>
  </div>

  <div class="acard">
    <h3>Data Flow & Network Request Sequence</h3>
    <div class="codeblk">[Client Browser (Port 5173)]
       │
       ├── Axios GET/POST Request ────────► [Django REST Backend (Port 8000)]
       │                                            │
       │                                            ├── Query SQLite DB (db.sqlite3)
       │                                            └── POST Audio File ──► [Groq Whisper API]
       │                                                                            │
       ◄── Returns JSON Response { success: true, data: { ... } } ──────────────────┘</div>
  </div>

  <!-- KEY BACKEND CODE LOGIC -->
  <div class="sechdr">
    <span class="seclbl">Core Backend Logic</span>
    <h2>2. Critical Django Backend Logic</h2>
  </div>

  <div class="acard">
    <h3>A. Token Validation Logic (round_views.py)</h3>
    <p>Endpoint: <code>POST /api/v1/test/validate-token</code></p>
    <div class="codeblk"># backend/api/views/round_views.py (validate_test_token)
attempt = ApplicantRoundAttempt.objects.filter(access_token=token).first()
if not attempt:
    return JsonResponse(error_response("Invalid test access token"), status=401)

# Check precedent round progression
current_round_num = attempt.round.round_number if attempt.round else 1
if current_round_num > 1 and attempt.candidate.current_round_index < current_round_num:
    prev_attempts = ApplicantRoundAttempt.objects.filter(
        candidate=attempt.candidate,
        round__round_number__lt=current_round_num
    ).select_related("round")
    for pa in prev_attempts:
        if pa.status not in ["completed", "submitted", "evaluated"]:
            return JsonResponse(error_response("You must complete earlier rounds before accessing this round."), status=403)</div>
  </div>

  <div class="acard">
    <h3>B. Groq Whisper Audio Transcription (round_views.py)</h3>
    <p>Endpoint: <code>POST /api/v1/test/transcribe-audio</code></p>
    <div class="codeblk"># backend/api/views/round_views.py (transcribe_audio)
client = OpenAI(api_key=os.environ.get("GROQ_API_KEY"), base_url="https://api.groq.com/openai/v1")
transcription = client.audio.transcriptions.create(
    file=(file_name, file_bytes, "audio/webm"),
    model="whisper-large-v3-turbo"
)
return JsonResponse(success_response({"text": transcription.text}))</div>
  </div>

  <div class="acard">
    <h3>C. Auto-Progression Pipeline (round_views.py)</h3>
    <div class="codeblk"># auto_progress_candidate function
passing_threshold = current_sr.passing_score if current_sr else 50
if round_score >= passing_threshold:
    if candidate.current_round_index < max_round:
        candidate.current_round_index += 1
        candidate.status = "forwarded"
        candidate.save(update_fields=['current_round_index', 'status'])
        JobApplication.objects.filter(candidate=candidate).update(status="shortlisted")</div>
  </div>

  <!-- VIVA PREPARATION -->
  <div class="sechdr">
    <span class="seclbl">Viva Exam Questions</span>
    <h2>3. Technical Developer Viva Q&A</h2>
  </div>

  <div class="viva-box">
    <div class="viva-q">Q1. How does the system handle CORS between Port 5173 and Port 8000?</div>
    <div class="viva-a">
      <strong>Answer:</strong> Django uses the <code>django-cors-headers</code> middleware. In <code>settings.py</code>, CORS headers allow incoming cross-origin requests from the React frontend running on <code>http://localhost:5173</code> to the Django REST endpoints running on <code>http://localhost:8000</code>.
    </div>
  </div>

  <div class="viva-box">
    <div class="viva-q">Q2. What speech model is used for real-time voice interview transcription?</div>
    <div class="viva-a">
      <strong>Answer:</strong> We use Groq's ultra-fast <code>whisper-large-v3-turbo</code> model hosted on <code>https://api.groq.com/openai/v1</code>. Audio recorded in the browser as WebM blob is uploaded via multipart request and transcribed in milliseconds.
    </div>
  </div>

</div>

<script>
function toggleTheme() {
  document.body.classList.toggle('light-mode');
  const btn = document.getElementById('themeBtn');
  btn.innerHTML = document.body.classList.contains('light-mode') ? '🌙 Dark Mode' : '☀️ Light Mode';
}
</script>
</body>
</html>'''

# ---------------------------------------------------------
# 3. JOB SEEKER FLOW EXPLAINED (FULL CODE & PORTS)
# ---------------------------------------------------------
seeker_html = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>CareerSphere — Job Seeker Portal & Assessment Guide</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet"/>
<style>
:root{
  --bg:#040408;--surface:#0d0d14;--card:#111118;--border:rgba(255,255,255,0.08);--border-bright:rgba(255,255,255,0.2);
  --text:#e8e8f0;--muted:#94a3b8;--blue:#3b82f6;--green:#10b981;--purple:#8b5cf6;--amber:#f59e0b;--cyan:#06b6d4;--pink:#ec4899;--sky:#38bdf8;
  --code-bg:#080810;--code-border:rgba(255,255,255,0.1);--box-bg:rgba(255,255,255,0.03);--strong-text:#ffffff;
}
body.light-mode {
  --bg:#f8fafc;--surface:#ffffff;--card:#ffffff;--border:rgba(0,0,0,0.08);--border-bright:rgba(0,0,0,0.18);
  --text:#0f172a;--muted:#475569;--blue:#2563eb;--green:#059669;--purple:#7c3aed;--amber:#d97706;--cyan:#0891b2;--pink:#db2777;--sky:#0284c7;
  --code-bg:#f1f5f9;--code-border:rgba(0,0,0,0.12);--box-bg:rgba(0,0,0,0.025);--strong-text:#0f172a;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;line-height:1.7;overflow-x:hidden;transition:background .3s,color .3s}
::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:#64748b;border-radius:99px}
.theme-toggle-btn {
  position: fixed; top: 20px; right: 20px; z-index: 100;
  display: flex; align-items: center; gap: 8px;
  padding: 10px 18px; border-radius: 99px;
  background: var(--surface); border: 1px solid var(--border-bright);
  color: var(--text); font-size: 13px; font-weight: 700; cursor: pointer;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2); transition: transform .2s;
}
.theme-toggle-btn:hover { transform: scale(1.05); }
.hero{min-height:55vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:80px 24px 40px;position:relative;overflow:hidden}
.hero-bg{position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 50% -10%,rgba(56,189,248,0.15) 0%,transparent 60%);pointer-events:none}
.badge{display:inline-flex;align-items:center;gap:8px;padding:6px 18px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;border:1px solid rgba(56,189,248,0.4);background:rgba(56,189,248,0.1);color:var(--sky);margin-bottom:24px}
.bdot{width:7px;height:7px;border-radius:50%;background:var(--sky);box-shadow:0 0 8px var(--sky);animation:pdot 2s ease-in-out infinite}
@keyframes pdot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.7)}}
h1.hero-title{font-size:clamp(2.2rem,5vw,4.2rem);font-weight:900;line-height:1.1;letter-spacing:-.03em;background:linear-gradient(135deg,var(--strong-text) 0%,var(--sky) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:18px}
.hero-sub{font-size:clamp(1rem,1.8vw,1.2rem);color:var(--muted);max-width:750px;margin:0 auto 40px}
.container{max-width:1100px;margin:0 auto;padding:0 24px 80px}
.sechdr{text-align:center;margin-bottom:50px}
.seclbl{display:inline-block;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:10px}
.sechdr h2{font-size:clamp(1.8rem,3.2vw,2.6rem);font-weight:800;letter-spacing:-.025em;color:var(--strong-text)}
.port-box{background:var(--surface);border:1px solid var(--border-bright);border-radius:20px;padding:24px;margin-bottom:40px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:20px}
.port-badge{background:var(--box-bg);border:1px solid var(--border);padding:10px 16px;border-radius:12px;font-family:'JetBrains Mono',monospace;font-size:0.85rem}
.port-badge span{color:var(--sky);font-weight:700}
.acard{background:var(--card);border:1px solid var(--border);border-radius:24px;padding:32px;margin-bottom:32px;box-shadow:0 8px 24px rgba(0,0,0,0.04)}
.codeblk{background:var(--code-bg);border:1px solid var(--code-border);border-radius:12px;padding:20px;font-family:'JetBrains Mono',monospace;font-size:0.82rem;line-height:1.7;color:#34d399;overflow-x:auto;margin:16px 0}
.viva-box{background:var(--surface);border:1px solid var(--border-bright);border-radius:20px;padding:28px;margin-bottom:20px}
.viva-q{font-size:1.05rem;font-weight:800;color:var(--sky);margin-bottom:10px}
.viva-a{font-size:.95rem;color:var(--text);line-height:1.7;background:var(--box-bg);padding:16px 20px;border-radius:12px;border-left:4px solid var(--blue)}
</style>
</head>
<body>

<button class="theme-toggle-btn" id="themeBtn" onclick="toggleTheme()">☀️ Light Mode</button>

<div class="hero">
  <div class="hero-bg"></div>
  <div class="badge"><div class="bdot"></div>Candidate Experience & Code Guide</div>
  <h1 class="hero-title">Job Seeker Portal: Ports, VAD & Interview Logic</h1>
  <p class="hero-sub">Complete breakdown of Seeker API endpoints on Port 8000, frontend state on Port 5173, Voice Activity Detection (VAD) audio loop, and interactive interview controls.</p>
</div>

<div class="container">

  <!-- PORTS & NETWORK -->
  <div class="sechdr">
    <span class="seclbl">Ports & Authentication</span>
    <h2>1. Network Connections & JWT Authentication</h2>
  </div>

  <div class="port-box">
    <div class="port-badge">📱 Candidate UI: <span>http://localhost:5173/jobs/applications</span></div>
    <div class="port-badge">🔐 Auth Endpoint: <span>http://localhost:8000/api/v1/seeker/auth/me</span></div>
    <div class="port-badge">🎟️ Test Entry: <span>http://localhost:5173/test/entry?token=...</span></div>
  </div>

  <!-- FRONTEND VOICE HOOK CODE LOGIC -->
  <div class="sechdr">
    <span class="seclbl">Frontend Voice Hook</span>
    <h2>2. Voice Hook Logic (useVoiceInterview.js)</h2>
  </div>

  <div class="acard">
    <h3>Decoupled Live Speech & Submission Trigger</h3>
    <p>Location: <code>frontend/src/hooks/useVoiceInterview.js</code></p>
    <p>WebSpeech <code>onresult</code> updates the Live Mic Transcript box on screen in real-time, but answer submission is strictly delayed until <code>recorder.onstop</code> fires upon clicking "Done & Submit Answer ✓" or post-speech VAD silence timeout.</p>
    <div class="codeblk">// useVoiceInterview.js
rec.onresult = (event) => {
  let accumulated = "";
  for (let i = 0; i < event.results.length; ++i) {
    accumulated += event.results[i][0].transcript + " ";
  }
  const cleanText = accumulated.trim();
  if (cleanText) {
    liveTranscriptRef.current = cleanText;
    onLiveTranscript?.(cleanText); // Updates live UI box ONLY, does NOT trigger answer submission!
  }
};

recorder.onstop = async () => {
  const blob = new Blob(chunksRef.current, { type: "audio/webm" });
  const res = await testAPI.transcribeAudio(blob); // Call Groq Whisper API on Port 8000
  const finalAnswerText = res?.text || liveTranscriptRef.current;
  onTranscriptReady?.(finalAnswerText); // Signal answer completion ONLY NOW!
};</div>
  </div>

  <div class="acard">
    <h3>InterviewRound.jsx Answer Handler & UI Controls</h3>
    <p>Location: <code>frontend/src/pages/test/InterviewRound.jsx</code></p>
    <div class="codeblk">// InterviewRound.jsx
const handleTranscript = async (text) => {
  const cleanText = text ? text.trim() : "";
  if (!cleanText || cleanText.length < 2) {
    toast.error("No speech captured. Please speak into your microphone and click Submit Answer.");
    return; // Does NOT skip question!
  }

  setSpokenAnswer(cleanText);
  setAiGenerating(true);
  const res = await testAPI.submitInterviewAnswer(q.index, cleanText);
  setAiResponse(res.feedback);
  speakText(`${res.feedback} Moving to next question. ${nextQ.q}`, () => {
    updateIdx(nextIdx);
  });
};</div>
  </div>

  <!-- VIVA PREPARATION -->
  <div class="sechdr">
    <span class="seclbl">Viva Exam Questions</span>
    <h2>3. Candidate Flow Expected Viva Q&A</h2>
  </div>

  <div class="viva-box">
    <div class="viva-q">Q1. How does the candidate's browser connect to the AI Voice Interview backend?</div>
    <div class="viva-a">
      <strong>Answer:</strong> The browser (Port 5173) uses <code>navigator.mediaDevices.getUserMedia</code> to stream mic audio. When the candidate clicks "Done & Submit Answer ✓", the audio blob is sent via HTTP POST to Django backend (Port 8000) at <code>/api/v1/test/transcribe-audio</code>, which forwards it to Groq Whisper API for transcription.
    </div>
  </div>

  <div class="viva-box">
    <div class="viva-q">Q2. What prevents a candidate from getting skipped automatically without speaking?</div>
    <div class="viva-a">
      <strong>Answer:</strong> In <code>handleTranscript</code> (`InterviewRound.jsx`), if no speech is detected or text length is less than 2 characters, the system displays a toast error *"No speech captured"*, keeps the candidate on the current question, and does NOT advance to the next question automatically.
    </div>
  </div>

</div>

<script>
function toggleTheme() {
  document.body.classList.toggle('light-mode');
  const btn = document.getElementById('themeBtn');
  btn.innerHTML = document.body.classList.contains('light-mode') ? '🌙 Dark Mode' : '☀️ Light Mode';
}
</script>
</body>
</html>'''

# Write all 3 files
with open(os.path.join(base_dir, "Recruiter_Flow_Explained.html"), "w", encoding="utf-8") as f:
    f.write(recruiter_html)

with open(os.path.join(base_dir, "Developer_Architecture_Explained.html"), "w", encoding="utf-8") as f:
    f.write(developer_html)

with open(os.path.join(base_dir, "Job_Seeker_Flow_Explained.html"), "w", encoding="utf-8") as f:
    f.write(seeker_html)

print("Master Technical HTML files with exact Ports & Code Logic regenerated successfully!")
