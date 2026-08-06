import os

# Base CSS & JS for all 3 files
HEADER_NAV = '''
<button class="theme-toggle-btn" id="themeBtn" onclick="toggleTheme()">☀️ Light Mode</button>
'''

SCRIPT_THEME = '''
<script>
function toggleTheme() {
  document.body.classList.toggle('light-mode');
  const btn = document.getElementById('themeBtn');
  if (document.body.classList.contains('light-mode')) {
    btn.innerHTML = '🌙 Dark Mode';
  } else {
    btn.innerHTML = '☀️ Light Mode';
  }
}
</script>
'''

STYLE_BLOCK = '''
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
  box-shadow: 0 4px 20px rgba(0,0,0,0.2); transition: transform .2s, background .3s;
}
.theme-toggle-btn:hover { transform: scale(1.05); }
.hero{min-height:60vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:80px 24px 40px;position:relative;overflow:hidden}
.hero-bg{position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 50% -10%,rgba(56,189,248,0.15) 0%,transparent 60%),radial-gradient(ellipse 60% 40% at 80% 80%,rgba(139,92,246,0.1) 0%,transparent 50%);pointer-events:none}
.badge{display:inline-flex;align-items:center;gap:8px;padding:6px 18px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;border:1px solid rgba(56,189,248,0.4);background:rgba(56,189,248,0.1);color:var(--sky);margin-bottom:24px}
.bdot{width:7px;height:7px;border-radius:50%;background:var(--sky);box-shadow:0 0 8px var(--sky);animation:pdot 2s ease-in-out infinite}
@keyframes pdot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.7)}}
h1.hero-title{font-size:clamp(2.2rem,5vw,4.2rem);font-weight:900;line-height:1.1;letter-spacing:-.03em;background:linear-gradient(135deg,var(--strong-text) 0%,var(--sky) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:18px}
.hero-sub{font-size:clamp(1rem,1.8vw,1.2rem);color:var(--muted);max-width:720px;margin:0 auto 40px}
.container{max-width:1100px;margin:0 auto;padding:0 24px 80px}
.sechdr{text-align:center;margin-bottom:50px}
.seclbl{display:inline-block;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:10px}
.sechdr h2{font-size:clamp(1.8rem,3.2vw,2.6rem);font-weight:800;letter-spacing:-.025em;color:var(--strong-text)}
.card-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:24px;margin-bottom:48px}
.acard{background:var(--card);border:1px solid var(--border);border-radius:24px;padding:32px;position:relative;overflow:hidden;transition:all .3s ease;box-shadow:0 8px 24px rgba(0,0,0,0.04)}
.acard:hover{border-color:var(--border-bright);transform:translateY(-3px);box-shadow:0 14px 36px rgba(0,0,0,0.12)}
.cicon{width:54px;height:54px;border-radius:16px;border:2px solid;display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:20px;background:var(--box-bg)}
.acard h3{font-size:1.3rem;font-weight:800;color:var(--strong-text);margin-bottom:10px}
.acard p{font-size:.92rem;color:var(--muted);line-height:1.65;margin-bottom:16px}
.tag-cloud{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
.tpill{font-size:11px;font-weight:700;font-family:'JetBrains Mono',monospace;padding:4px 10px;border-radius:6px;background:var(--box-bg);border:1px solid var(--border);color:var(--text)}
.viva-box{background:var(--surface);border:1px solid var(--border-bright);border-radius:20px;padding:28px;margin-bottom:20px}
.viva-q{font-size:1.05rem;font-weight:800;color:var(--sky);margin-bottom:10px;display:flex;align-items:center;gap:10px}
.viva-a{font-size:.95rem;color:var(--text);line-height:1.7;background:var(--box-bg);padding:16px 20px;border-radius:12px;border-left:4px solid var(--blue)}
.code-snippet{font-family:'JetBrains Mono',monospace;font-size:0.85rem;background:var(--code-bg);border:1px solid var(--code-border);color:#34d399;padding:16px;border-radius:12px;overflow-x:auto;margin:12px 0}
</style>
'''

# 1. RECRUITER FLOW EXPLAINED HTML
recruiter_html = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>CareerSphere — Recruiter Portal & Hiring Workflow Guide</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet"/>
{STYLE_BLOCK}
</head>
<body>
{HEADER_NAV}

<div class="hero">
  <div class="hero-bg"></div>
  <div class="badge"><div class="bdot"></div>Recruiter Operating Guide</div>
  <h1 class="hero-title">Recruiter Portal & Autonomous Hiring Workflow</h1>
  <p class="hero-sub">Complete breakdown of Job Session creation, Multi-Agent ATS Matching, Recruiter Candidate Card Controls, Manual Forwarding, and Offer Letter Issuance.</p>
</div>

<div class="container">
  <div class="sechdr">
    <span class="seclbl">End-To-End Architecture</span>
    <h2>Recruiter Core Features</h2>
  </div>

  <div class="card-grid">
    <div class="acard">
      <div class="cicon" style="color:var(--blue);border-color:var(--blue)">📋</div>
      <h3>1. Job Session & Round Setup</h3>
      <p>Recruiters create a Job Session specifying job title, experience range, location, and inferred skills. They dynamically configure custom assessment rounds: <code>Aptitude MCQ</code>, <code>Technical Coding</code>, and <code>AI Voice Interview</code> with custom passing threshold scores (e.g. 50%).</p>
      <div class="tag-cloud">
        <span class="tpill">SessionRound Model</span>
        <span class="tpill">Passing Score %</span>
        <span class="tpill">Round Ordering</span>
      </div>
    </div>

    <div class="acard">
      <div class="cicon" style="color:var(--purple);border-color:var(--purple)">🤖</div>
      <h3>2. Autonomous Multi-Agent ATS Matching</h3>
      <p>When resumes are submitted, the Ingestion Agent parses skills & experience into normalized tags. The Match Agent compares candidates against recruiter parameters, generating a 0-100% Match Score alongside matched skills, missing skills, and AI recommendation.</p>
      <div class="tag-cloud">
        <span class="tpill">Deterministic Matching</span>
        <span class="tpill">Normalized Skills</span>
        <span class="tpill">Skill Gap Breakdown</span>
      </div>
    </div>

    <div class="acard">
      <div class="cicon" style="color:var(--green);border-color:var(--green)">⚡</div>
      <h3>3. Candidate Workspace & Manual Override</h3>
      <p>Recruiters manage candidate stages via interactive Candidate Cards. Recruiters hold <strong>Super-Admin Manual Override</strong> power — clicking <code>Forward &rarr;</code> advances a candidate to the next round immediately without artificial date blocks.</p>
      <div class="tag-cloud">
        <span class="tpill">Recruiter Super-Admin</span>
        <span class="tpill">Instant Forwarding</span>
        <span class="tpill">Stage Sync</span>
      </div>
    </div>

    <div class="acard">
      <div class="cicon" style="color:var(--amber);border-color:var(--amber)">📄</div>
      <h3>4. Offer Letter Upload & Hiring</h3>
      <p>In the final assessment round, the <code>Forward</code> button morphs into <code>Hire Candidate</code>. Clicking Hire opens an offer modal allowing recruiters to upload an official PDF/Docx Offer Letter, which automatically updates job application status to <code>hired</code>.</p>
      <div class="tag-cloud">
        <span class="tpill">Offer Letter PDF</span>
        <span class="tpill">Hired State</span>
        <span class="tpill">Automated Acceptance</span>
      </div>
    </div>
  </div>

  <div class="sechdr">
    <span class="seclbl">Recruiter Viva Preparation</span>
    <h2>Recruiter Flow Viva Q&A</h2>
  </div>

  <div class="viva-box">
    <div class="viva-q">Q1. How does the Recruiter Portal streamline the hiring pipeline?</div>
    <div class="viva-a">
      <strong>Answer:</strong> CareerSphere replaces slow manual resume screening with autonomous AI parsing and match scoring. Recruiters configure custom multi-round pipelines (MCQ, Coding, Voice AI), monitor real-time candidate test progress, override progression manually if needed, and issue offer letters directly from the dashboard.
    </div>
  </div>

  <div class="viva-box">
    <div class="viva-q">Q2. What happens when a Recruiter clicks "Forward to Next Round"?</div>
    <div class="viva-a">
      <strong>Answer:</strong> The backend endpoint <code>/api/v1/sessions/&lt;session_id&gt;/candidates/&lt;cand_id&gt;/action</code> triggers with <code>action="forward"</code>. It increments <code>candidate.current_round_index</code>, sets status to <code>forwarded</code>, updates the application to <code>shortlisted</code>, and proactively generates the next round attempt token ticket so the candidate receives instant assessment access.
    </div>
  </div>

  <div class="viva-box">
    <div class="viva-q">Q3. How is the Offer Letter attached and made accessible to candidates?</div>
    <div class="viva-a">
      <strong>Answer:</strong> When hiring a candidate from the final round, the recruiter uploads an offer file (PDF/DOCX). The backend saves it under <code>uploads/offer_letters/</code> with a unique UUID filename and stores the path in <code>app.offer_letter_path</code>. The candidate sees a secure download link in their application pipeline and can click "Accept Offer".
    </div>
  </div>
</div>

{SCRIPT_THEME}
</body>
</html>
'''

# 2. DEVELOPER ARCHITECTURE EXPLAINED HTML
developer_html = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>CareerSphere — Developer & Technical Architecture Guide</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet"/>
{STYLE_BLOCK}
</head>
<body>
{HEADER_NAV}

<div class="hero">
  <div class="hero-bg"></div>
  <div class="badge"><div class="bdot"></div>Developer Architecture Guide</div>
  <h1 class="hero-title">Developer & System Architecture Deep Dive</h1>
  <p class="hero-sub">Full technical breakdown of Django REST backend, React Vite frontend, Proactive Token Ticket Engine, Multi-Agent Orchestration, Groq Whisper VAD processing, and DB schemas.</p>
</div>

<div class="container">
  <div class="sechdr">
    <span class="seclbl">Technical Stack & Engines</span>
    <h2>Backend & Engine Modules</h2>
  </div>

  <div class="card-grid">
    <div class="acard">
      <div class="cicon" style="color:var(--cyan);border-color:var(--cyan)">🔑</div>
      <h3>1. Proactive Token Ticket Engine</h3>
      <p>To prevent 401/403 uninitialized token race conditions, the system pre-generates 32-character url-safe tokens in <code>ApplicantRoundAttempt</code> proactively upon round promotion. Tokens are validated via <code>validate_test_token</code> before granting test access.</p>
      <div class="code-snippet">ApplicantRoundAttempt.objects.get_or_create(
  candidate=candidate, round=next_sr,
  defaults={{'access_token': secrets.token_urlsafe(32), 'status': 'pending'}}
)</div>
    </div>

    <div class="acard">
      <div class="cicon" style="color:var(--pink);border-color:var(--pink)">🎙️</div>
      <h3>2. Groq Whisper + VAD Audio Stack</h3>
      <p>The Voice AI Interview uses WebRTC audio streams, continuous WebSpeech API for live on-screen transcript rendering, and <strong>Groq Whisper API (<code>whisper-large-v3-turbo</code>)</strong> for high-speed voice transcription upon answer completion.</p>
      <div class="code-snippet">transcription = client.audio.transcriptions.create(
  file=(file_name, file_bytes, "audio/webm"),
  model="whisper-large-v3-turbo"
)</div>
    </div>

    <div class="acard">
      <div class="cicon" style="color:var(--blue);border-color:var(--blue)">🤖</div>
      <h3>3. Multi-Agent Orchestration Engine</h3>
      <p>Four decoupled agent services process requests: <code>IngestionAgent</code> (PyPDF/Docx text parser), <code>MatchAgent</code> (hybrid skill vector matching), <code>ProctoringAgent</code> (tab switch & audio telemetry monitor), and <code>InterviewAgent</code> (LLM voice Q&A evaluator).</p>
      <div class="tag-cloud">
        <span class="tpill">IngestionAgent</span>
        <span class="tpill">MatchAgent</span>
        <span class="tpill">InterviewAgent</span>
        <span class="tpill">ProctoringAgent</span>
      </div>
    </div>

    <div class="acard">
      <div class="cicon" style="color:var(--green);border-color:var(--green)">⚡</div>
      <h3>4. Auto-Progression Pipeline</h3>
      <p>When tests are completed, <code>auto_progress_candidate</code> checks <code>score >= passing_score</code>. If passed, it increments candidate round index, updates application status to <code>shortlisted</code>, and issues in-app seeker notifications.</p>
      <div class="tag-cloud">
        <span class="tpill">auto_progress_candidate</span>
        <span class="tpill">passing_score threshold</span>
        <span class="tpill">Notification Model</span>
      </div>
    </div>
  </div>

  <div class="sechdr">
    <span class="seclbl">Developer Viva Preparation</span>
    <h2>Developer Architecture Viva Q&A</h2>
  </div>

  <div class="viva-box">
    <div class="viva-q">Q1. What is the database schema for assessment attempts?</div>
    <div class="viva-a">
      <strong>Answer:</strong> <code>ApplicantRoundAttempt</code> bridges <code>Candidate</code> and <code>SessionRound</code>. It stores <code>access_token</code>, <code>token_expires_at</code>, <code>status</code> (pending, in_progress, submitted, completed), <code>mcq_score</code>, <code>coding_score</code>, <code>interview_score</code>, <code>overall_score</code>, and <code>interview_transcript</code> JSON.
    </div>
  </div>

  <div class="viva-box">
    <div class="viva-q">Q2. How do you prevent mid-sentence answer submission in the AI Voice Interview?</div>
    <div class="viva-a">
      <strong>Answer:</strong> WebSpeech <code>onresult</code> is strictly decoupled from answer submission — it ONLY updates <code>liveTranscript</code> for on-screen text preview. Answer submission (`handleTranscript`) is invoked ONLY inside <code>recorder.onstop</code> when the candidate clicks "Done & Submit Answer ✓" or 8s post-speech VAD silence is detected.
    </div>
  </div>

  <div class="viva-box">
    <div class="viva-q">Q3. How is API security and authorization handled?</div>
    <div class="viva-a">
      <strong>Answer:</strong> Seeker endpoints use <code>@require_seeker_jwt</code> to verify JWT tokens in Authorization headers. Recruiter endpoints use <code>@require_api_key</code>. Test portal endpoints use <code>@require_test_token</code>, which validates attempt token status and expiration in DB.
    </div>
  </div>
</div>

{SCRIPT_THEME}
</body>
</html>
'''

# 3. JOB SEEKER FLOW EXPLAINED HTML
seeker_html = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>CareerSphere — Candidate / Job Seeker Experience Guide</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet"/>
{STYLE_BLOCK}
</head>
<body>
{HEADER_NAV}

<div class="hero">
  <div class="hero-bg"></div>
  <div class="badge"><div class="bdot"></div>Candidate Portal Guide</div>
  <h1 class="hero-title">Job Seeker Portal & Assessment Experience</h1>
  <p class="hero-sub">Complete walkthrough of job discovery, match compatibility score, interactive application pipeline stepper, proctored test engine, and AI Voice Interview room.</p>
</div>

<div class="container">
  <div class="sechdr">
    <span class="seclbl">Candidate Journey</span>
    <h2>Job Seeker Core Features</h2>
  </div>

  <div class="card-grid">
    <div class="acard">
      <div class="cicon" style="color:var(--green);border-color:var(--green)">🔍</div>
      <h3>1. Smart Job Discovery & Match Score</h3>
      <p>Candidates browse active job postings with real-time AI Skill Match scores (e.g. 85% Match). The candidate sees matched skills in green tags and missing recommended skills in amber tags.</p>
      <div class="tag-cloud">
        <span class="tpill">Match Score %</span>
        <span class="tpill">Matched Skills</span>
        <span class="tpill">Missing Skills</span>
      </div>
    </div>

    <div class="acard">
      <div class="cicon" style="color:var(--blue);border-color:var(--blue)">📊</div>
      <h3>2. Recruitment Stages Stepper Pipeline</h3>
      <p>Candidates track application progress on a vertical stepper timeline (`UserApplications.jsx`). Stages transition visually: <code>Applied</code> -> <code>Active Round</code> -> <code>Cleared (Passed 85%)</code> -> <code>Hired / Offer Letter</code>. Upcoming rounds remain locked with 🔒 icon.</p>
      <div class="tag-cloud">
        <span class="tpill">Stepper Pipeline</span>
        <span class="tpill">Active Round</span>
        <span class="tpill">Lock Indicator</span>
      </div>
    </div>

    <div class="acard">
      <div class="cicon" style="color:var(--amber);border-color:var(--amber)">🛠️</div>
      <h3>3. Diagnostic Waiting Room</h3>
      <p>Before launching proctored rounds, candidates enter a hardware test room. The browser verifies camera permission and displays a live <strong>Microphone Gain Level meter</strong> to ensure audio is working before launching the test.</p>
      <div class="tag-cloud">
        <span class="tpill">Hardware Check</span>
        <span class="tpill">Mic Gain Level</span>
        <span class="tpill">Webcam Stream</span>
      </div>
    </div>

    <div class="acard">
      <div class="cicon" style="color:var(--purple);border-color:var(--purple)">🎤</div>
      <h3>4. Interactive AI Voice Interview Room</h3>
      <p>Candidates interact with an AI Host. Features include an <strong>AI Avatar Orb</strong>, <strong>Live Mic Transcript Box</strong> (see spoken words live), a live audio visualizer waveform, and an explicit <code>Done & Submit Answer ✓</code> button.</p>
      <div class="tag-cloud">
        <span class="tpill">Live Mic Transcript</span>
        <span class="tpill">Audio Waveform</span>
        <span class="tpill">Done & Submit Button</span>
      </div>
    </div>
  </div>

  <div class="sechdr">
    <span class="seclbl">Candidate Flow Viva Preparation</span>
    <h2>Job Seeker Flow Viva Q&A</h2>
  </div>

  <div class="viva-box">
    <div class="viva-q">Q1. How does a candidate start an assessment round?</div>
    <div class="viva-a">
      <strong>Answer:</strong> In their application pipeline (`UserApplications.jsx`), when a round becomes active, a prominent blue button <code>Start Assessment &rarr;</code> appears containing a secure token URL (e.g. <code>/test/entry?token=...</code>). Clicking it launches the hardware diagnostic waiting room.
    </div>
  </div>

  <div class="viva-box">
    <div class="viva-q">Q2. What visual feedback does the candidate get during the Voice AI Interview?</div>
    <div class="viva-a">
      <strong>Answer:</strong> The candidate sees an AI Host avatar orb that pulses blue when speaking, a webcam video feed with a live audio canvas waveform, a <strong>Live Mic Transcript</strong> box showing their exact words in real-time as they talk, and a green <strong>Done & Submit Answer ✓</strong> button to submit.
    </div>
  </div>

  <div class="viva-box">
    <div class="viva-q">Q3. How does the candidate view and accept an Offer Letter?</div>
    <div class="viva-a">
      <strong>Answer:</strong> When candidate status becomes <code>hired</code>, their application card displays a green "Hired" badge along with an <strong>Offer Letter Download Link</strong>. The candidate clicks "Accept Offer", which updates application state to accepted and marks the session as completed.
    </div>
  </div>
</div>

{SCRIPT_THEME}
</body>
</html>
'''

# Write out the three HTML files to disk
base_dir = os.path.dirname(os.path.abspath(__file__))

with open(os.path.join(base_dir, "Recruiter_Flow_Explained.html"), "w", encoding="utf-8") as f:
    f.write(recruiter_html)

with open(os.path.join(base_dir, "Developer_Architecture_Explained.html"), "w", encoding="utf-8") as f:
    f.write(developer_html)

with open(os.path.join(base_dir, "Job_Seeker_Flow_Explained.html"), "w", encoding="utf-8") as f:
    f.write(seeker_html)

print("Successfully generated all 3 documentation HTML files!")
