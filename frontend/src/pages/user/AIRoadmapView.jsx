import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header, Footer } from "../../components/user/site-chrome";
import { seekerAPI } from "../../lib/api";
import {
  Map,
  Sparkles,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  PlayCircle,
  Code2,
  BookOpen,
  HelpCircle,
  ChevronRight,
  Target,
  Trophy,
  Award,
  Zap,
  Check,
  RotateCcw,
  Copy,
  ArrowRight,
  FileCode,
  GraduationCap
} from "lucide-react";
import toast from "react-hot-toast";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const SAMPLE_JDS = [
  {
    title: "Full Stack Developer (React + Node.js)",
    text: `Role: Full Stack Engineer
Required Skills: React.js, TypeScript, Node.js, Express, PostgreSQL, Redis, Docker, CI/CD, REST APIs, System Design.
Responsibilities: Build end-to-end web applications, design RESTful APIs, containerize services using Docker, optimize database queries, write unit tests.`
  },
  {
    title: "Frontend Lead (Next.js & Tailwind)",
    text: `Role: Senior Frontend Developer
Required Skills: React 18, Next.js App Router, TypeScript, Tailwind CSS, State Management (Zustand/Redux), Web Performance Optimization, WebSockets, Testing (Jest/Cypress).
Responsibilities: Lead frontend architecture, build responsive UI components, improve core web vitals, collaborate with design teams.`
  },
  {
    title: "DevOps & Cloud Infrastructure Engineer",
    text: `Role: DevOps Engineer
Required Skills: Kubernetes, Docker, AWS (EC2, S3, RDS), Terraform, GitHub Actions, Linux administration, Python/Bash scripting, Monitoring (Datadog/Prometheus).
Responsibilities: Automate deployment pipelines, manage Kubernetes clusters, ensure high system availability, implement infrastructure as code.`
  }
];

export default function AIRoadmapView() {
  useDocumentTitle(
    "AI Job Learning Roadmap & Skill Bridge",
    "Generate a personalized week-by-week learning path with structured chapters, YouTube resources, practical tasks, and interactive quizzes."
  );

  const navigate = useNavigate();
  const [seeker, setSeeker] = useState(null);
  const [jdText, setJdText] = useState("");
  const [loading, setLoading] = useState(false);
  const [roadmapData, setRoadmapData] = useState(null);
  const [error, setError] = useState(null);

  // Active Week & Module Tab State
  const [activeWeekIndex, setActiveWeekIndex] = useState(0);
  const [activeModuleTab, setActiveModuleTab] = useState("chapters"); // 'chapters' | 'videos' | 'task' | 'quiz'
  const [expandedChapter, setExpandedChapter] = useState(0);

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState({}); // { [weekIdx-qIdx]: selectedOptionIdx }
  const [quizSubmitted, setQuizSubmitted] = useState({}); // { [weekIdx]: true }
  const [quizScores, setQuizScores] = useState({}); // { [weekIdx]: { correct: int, total: int, passed: bool } }
  const [completedWeeks, setCompletedWeeks] = useState([]); // [weekIdx]

  useEffect(() => {
    seekerAPI.getMe().then(setSeeker).catch(() => null);
  }, []);

  const handleGenerateRoadmap = async () => {
    if (!jdText.trim() || jdText.trim().length < 40) {
      setError("Please paste a complete Job Description (at least 40 characters).");
      return;
    }
    setLoading(true);
    setError(null);
    setRoadmapData(null);
    setActiveWeekIndex(0);
    setActiveModuleTab("chapters");
    setQuizAnswers({});
    setQuizSubmitted({});
    setQuizScores({});
    setCompletedWeeks([]);

    try {
      const res = await seekerAPI.generateJobRoadmap({ job_description: jdText });
      setRoadmapData(res);
      toast.success("AI Skill Bridge Learning Path generated! 🚀");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to generate roadmap. Please check your network and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuizOption = (weekIdx, qIdx, optIdx) => {
    if (quizSubmitted[weekIdx]) return; // locked after submission
    setQuizAnswers(prev => ({
      ...prev,
      [`${weekIdx}-${qIdx}`]: optIdx
    }));
  };

  const handleSubmitQuiz = (weekIdx, quizList) => {
    if (!quizList || quizList.length === 0) return;
    
    // Check if all questions answered
    const unanswered = quizList.some((_, qIdx) => quizAnswers[`${weekIdx}-${qIdx}`] === undefined);
    if (unanswered) {
      toast.error(`Please answer all ${quizList.length} quiz questions before submitting!`);
      return;
    }

    let correctCount = 0;
    quizList.forEach((q, qIdx) => {
      if (quizAnswers[`${weekIdx}-${qIdx}`] === q.correct_index) {
        correctCount++;
      }
    });

    const total = quizList.length;
    const scorePercent = (correctCount / total) * 100;
    const passed = scorePercent >= 70; // 70%+ to pass

    setQuizSubmitted(prev => ({ ...prev, [weekIdx]: true }));
    setQuizScores(prev => ({ ...prev, [weekIdx]: { correct: correctCount, total, passed } }));

    if (passed) {
      toast.success(`🎉 Great Job! You passed Week ${weekIdx + 1} Quiz (${correctCount}/${total})!`);
      if (!completedWeeks.includes(weekIdx)) {
        setCompletedWeeks(prev => [...prev, weekIdx]);
      }
    } else {
      toast.error(`Score: ${correctCount}/${total} (${Math.round(scorePercent)}%). You need at least 70% to pass. Review the chapters & retake!`);
    }
  };

  const handleRetakeQuiz = (weekIdx) => {
    setQuizSubmitted(prev => ({ ...prev, [weekIdx]: false }));
    // Clear answers for this week
    setQuizAnswers(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => {
        if (k.startsWith(`${weekIdx}-`)) delete next[k];
      });
      return next;
    });
  };

  const handleCopyCode = (codeText) => {
    navigator.clipboard.writeText(codeText);
    toast.success("Code copied to clipboard!");
  };

  const activeNode = roadmapData?.roadmap?.[activeWeekIndex];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <button
              onClick={() => navigate("/resume-builder")}
              className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors mb-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Resume Builder
            </button>
            <h1 className="text-3xl font-extrabold text-foreground flex items-center gap-3 tracking-tight">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <GraduationCap className="h-5 w-5" />
              </div>
              AI Career Skill-Bridge Curriculum
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Structured chapters, code examples, video tutorials, practical building tasks, and interactive quizzes.
            </p>
          </div>

          {seeker && (
            <div className="flex items-center gap-3 bg-muted/30 border border-border px-4 py-2 rounded-2xl">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center text-xs">
                {(seeker.full_name || seeker.email || "U")[0].toUpperCase()}
              </div>
              <div className="text-xs">
                <p className="font-bold text-foreground">{seeker.full_name || "Job Seeker"}</p>
                <p className="text-muted-foreground text-[11px]">{seeker.skills?.length || 0} skills in profile</p>
              </div>
            </div>
          )}
        </div>

        {/* ── STEP 1: JD Input Section ── */}
        {!roadmapData && (
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="max-w-3xl space-y-2">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Target Job Description Input
              </h2>
              <p className="text-sm text-muted-foreground">
                Paste the job description you are aiming for. AI will analyze your profile skills, detect gaps, and generate your structured week-by-week learning curriculum.
              </p>
            </div>

            {/* Quick Sample JD Pills */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Quick test with sample JDs:</p>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_JDS.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => { setJdText(s.text); setError(null); }}
                    className="text-xs font-medium bg-muted hover:bg-primary/10 hover:text-primary border border-border px-3 py-1.5 rounded-xl transition-all"
                  >
                    + {s.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea */}
            <div className="space-y-2">
              <textarea
                value={jdText}
                onChange={e => { setJdText(e.target.value); setError(null); }}
                placeholder="Paste the target job description here... (role title, required tech stack, responsibilities, experience needed)"
                rows={9}
                className="w-full rounded-2xl border border-border bg-muted/20 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none transition-all"
              />
              <p className="text-xs text-muted-foreground text-right">{jdText.length} characters</p>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 text-destructive text-xs bg-destructive/10 border border-destructive/20 rounded-2xl p-4">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleGenerateRoadmap}
              disabled={loading || jdText.trim().length < 40}
              className="w-full sm:w-auto pill bg-gradient-to-r from-primary via-blue-600 to-purple-600 hover:opacity-95 text-white px-8 py-3.5 text-sm font-bold transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating AI Curriculum &amp; Chapter Notes...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Generate AI Learning Curriculum
                </>
              )}
            </button>
          </div>
        )}

        {/* ── STEP 2: Full-Screen Interactive Learning Curriculum ── */}
        {roadmapData && (
          <div className="space-y-8">
            
            {/* Top Strategy & Skill Match Banner */}
            <div className="bg-gradient-to-br from-card via-card to-primary/5 border border-border/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
                    AI Personal Learning Strategy
                  </span>
                  <h2 className="text-xl font-bold text-foreground mt-2">
                    {roadmapData.roadmap?.length || 0}-Week Master Learning Path
                  </h2>
                  {roadmapData.gap_summary && (
                    <p className="text-xs text-muted-foreground mt-1 max-w-3xl leading-relaxed">
                      {roadmapData.gap_summary}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => { setRoadmapData(null); setJdText(""); }}
                  className="pill border border-border bg-background px-4 py-2 text-xs font-semibold hover:bg-muted transition-all shrink-0"
                >
                  Change Job Description
                </button>
              </div>

              {/* Skills Found vs Skills Missing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border/60">
                <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-2xl p-4 space-y-2">
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    Skills You Already Have ({roadmapData.matched_skills?.length || 0})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(roadmapData.matched_skills || []).map((s, i) => (
                      <span key={i} className="text-[11px] font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full">
                        ✓ {s}
                      </span>
                    ))}
                    {(!roadmapData.matched_skills || roadmapData.matched_skills.length === 0) && (
                      <span className="text-xs text-muted-foreground">Upload your resume to detect pre-matched skills.</span>
                    )}
                  </div>
                </div>

                <div className="bg-amber-500/8 border border-amber-500/20 rounded-2xl p-4 space-y-2">
                  <p className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <Target className="h-4 w-4" />
                    Skills To Master in Curriculum ({roadmapData.missing_skills?.length || 0})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(roadmapData.missing_skills || []).map((s, i) => (
                      <span key={i} className="text-[11px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-full">
                        • {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Main Curriculum Grid (Sidebar Stepper + Content View) ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Weekly Stepper */}
              <div className="lg:col-span-4 bg-card border border-border rounded-3xl p-5 space-y-3 sticky top-6">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                    Weekly Modules
                  </h3>
                  <span className="text-xs text-muted-foreground font-medium">
                    {completedWeeks.length}/{roadmapData.roadmap?.length || 0} Passed
                  </span>
                </div>

                <div className="space-y-2">
                  {(roadmapData.roadmap || []).map((node, idx) => {
                    const isActive = idx === activeWeekIndex;
                    const isDone = completedWeeks.includes(idx);

                    return (
                      <button
                        key={node.id || idx}
                        onClick={() => { setActiveWeekIndex(idx); setActiveModuleTab("chapters"); setExpandedChapter(0); }}
                        className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-3 ${
                          isActive
                            ? "bg-primary/10 border-primary text-foreground shadow-sm"
                            : isDone
                            ? "bg-emerald-500/8 border-emerald-500/30 text-foreground hover:bg-emerald-500/15"
                            : "bg-background border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                          isDone
                            ? "bg-emerald-500 text-white"
                            : isActive
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {isDone ? <Check className="h-4 w-4" /> : `W${idx + 1}`}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold truncate ${isActive ? "text-primary" : "text-foreground"}`}>
                            {node.skill_name}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {node.chapters?.length || 3} Chapters • {node.quiz?.length || 5} Quiz Qs
                          </p>
                        </div>

                        <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${isActive ? "rotate-90 text-primary" : "text-muted-foreground"}`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Active Module Interactive View */}
              <div className="lg:col-span-8 space-y-6">
                {activeNode && (
                  <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                    
                    {/* Module Title Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
                      <div>
                        <span className="text-xs font-extrabold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
                          Week {activeNode.week || activeWeekIndex + 1} Module
                        </span>
                        <h2 className="text-2xl font-bold text-foreground mt-2">
                          {activeNode.skill_name}
                        </h2>
                        {activeNode.why_it_matters && (
                          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                            💡 <strong>Why it matters:</strong> {activeNode.why_it_matters}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 bg-muted/40 px-3 py-1.5 rounded-xl border border-border shrink-0">
                        <Award className="h-4 w-4 text-amber-500" />
                        <span className="text-xs font-bold text-foreground">~{activeNode.estimated_hours || 6} Hours</span>
                      </div>
                    </div>

                    {/* ── 4-STEP CURRICULUM TAB NAVIGATION ── */}
                    <div className="flex flex-wrap border-b border-border gap-2">
                      <button
                        onClick={() => setActiveModuleTab("chapters")}
                        className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
                          activeModuleTab === "chapters"
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <BookOpen className="h-4 w-4" />
                        1. Chapters &amp; Study Notes ({activeNode.chapters?.length || 3})
                      </button>

                      <button
                        onClick={() => setActiveModuleTab("videos")}
                        className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
                          activeModuleTab === "videos"
                            ? "border-red-500 text-red-600 dark:text-red-400"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <PlayCircle className="h-4 w-4" />
                        2. Video Lessons
                      </button>

                      <button
                        onClick={() => setActiveModuleTab("task")}
                        className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
                          activeModuleTab === "task"
                            ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Code2 className="h-4 w-4" />
                        3. Practical Task
                      </button>

                      <button
                        onClick={() => setActiveModuleTab("quiz")}
                        className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
                          activeModuleTab === "quiz"
                            ? "border-purple-500 text-purple-600 dark:text-purple-400"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <HelpCircle className="h-4 w-4" />
                        4. Final Quiz &amp; Test ({activeNode.quiz?.length || 5} Qs)
                        {completedWeeks.includes(activeWeekIndex) && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        )}
                      </button>
                    </div>

                    {/* ── TAB 1: CHAPTERS & STUDY NOTES ── */}
                    {activeModuleTab === "chapters" && (
                      <div className="space-y-6">
                        <div className="space-y-4">
                          {(activeNode.chapters || []).map((ch, chIdx) => {
                            const isCurrentExpanded = expandedChapter === chIdx;

                            return (
                              <div key={chIdx} className="border border-border rounded-2xl overflow-hidden bg-background">
                                <button
                                  onClick={() => setExpandedChapter(chIdx)}
                                  className={`w-full text-left p-4 flex items-center justify-between gap-3 transition-colors ${
                                    isCurrentExpanded ? "bg-muted/40 font-bold" : "hover:bg-muted/20 font-semibold"
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="w-7 h-7 rounded-xl bg-primary/10 text-primary font-black flex items-center justify-center text-xs">
                                      {chIdx + 1}
                                    </span>
                                    <span className="text-sm text-foreground">{ch.title}</span>
                                  </div>
                                  <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isCurrentExpanded ? "rotate-90 text-primary" : ""}`} />
                                </button>

                                {isCurrentExpanded && (
                                  <div className="p-5 border-t border-border space-y-4 bg-card">
                                    {/* Summary paragraph */}
                                    <p className="text-xs text-foreground leading-relaxed">
                                      {ch.summary}
                                    </p>

                                    {/* Code example block */}
                                    {ch.code_example && (
                                      <div className="space-y-1.5">
                                        <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-t-xl border border-border/80 border-b-0">
                                          <span className="flex items-center gap-1.5">
                                            <FileCode className="h-3.5 w-3.5 text-primary" /> Code / Syntax Example
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => handleCopyCode(ch.code_example)}
                                            className="hover:text-primary flex items-center gap-1 transition-colors"
                                          >
                                            <Copy className="h-3 w-3" /> Copy
                                          </button>
                                        </div>
                                        <pre className="bg-slate-950 text-slate-100 p-4 rounded-b-xl text-xs font-mono overflow-x-auto border border-border/80 leading-relaxed">
                                          <code>{ch.code_example}</code>
                                        </pre>
                                      </div>
                                    )}

                                    {/* Key takeaways */}
                                    {ch.key_takeaways?.length > 0 && (
                                      <div className="space-y-1.5 pt-2">
                                        <p className="text-xs font-bold text-foreground">💡 Key Takeaways:</p>
                                        <ul className="space-y-1">
                                          {ch.key_takeaways.map((kt, ktIdx) => (
                                            <li key={ktIdx} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                              <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                              <span>{kt}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <button
                          onClick={() => setActiveModuleTab("videos")}
                          className="w-full pill bg-primary text-primary-foreground py-3 text-xs font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-sm"
                        >
                          Step 2: Watch Video Tutorials <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {/* ── TAB 2: VIDEO LESSONS ── */}
                    {activeModuleTab === "videos" && (
                      <div className="space-y-6">
                        <div className="bg-gradient-to-br from-red-500/8 via-muted/20 to-purple-500/8 border border-red-500/20 rounded-3xl p-6 space-y-4">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/30 shrink-0">
                                <PlayCircle className="h-7 w-7" />
                              </div>
                              <div>
                                <h3 className="text-base font-bold text-foreground">Recommended Video Lessons</h3>
                                <p className="text-xs text-muted-foreground">Handpicked YouTube tutorials for {activeNode.skill_name}</p>
                              </div>
                            </div>

                            <a
                              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(activeNode.youtube_query || `${activeNode.skill_name} tutorial`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="pill bg-red-600 hover:bg-red-700 text-white px-6 py-3 text-xs font-bold transition-all shadow-md shadow-red-600/20 flex items-center gap-2 shrink-0"
                            >
                              <PlayCircle className="h-4 w-4" /> Open Search on YouTube ↗
                            </a>
                          </div>

                          <div className="bg-background/90 rounded-2xl p-4 text-xs text-muted-foreground border border-border/60 space-y-2">
                            <p className="font-semibold text-foreground">🔍 Suggested YouTube Search:</p>
                            <code className="block bg-muted/60 p-2.5 rounded-xl font-mono text-primary text-xs">
                              "{activeNode.youtube_query || `${activeNode.skill_name} complete crash course 2026`}"
                            </code>
                          </div>
                        </div>

                        <button
                          onClick={() => setActiveModuleTab("task")}
                          className="w-full pill bg-primary text-primary-foreground py-3 text-xs font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-sm"
                        >
                          Step 3: Proceed to Practical Task <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {/* ── TAB 3: PRACTICAL TASK ── */}
                    {activeModuleTab === "task" && (
                      <div className="space-y-6">
                        <div className="bg-gradient-to-br from-emerald-500/8 to-blue-500/8 border border-emerald-500/20 rounded-3xl p-6 space-y-4">
                          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                            <Code2 className="h-5 w-5 text-emerald-600" />
                            Hands-On Practical Building Task
                          </h3>
                          <p className="text-xs text-foreground bg-background/90 border border-border p-5 rounded-2xl leading-relaxed">
                            🛠️ {activeNode.practical_task}
                          </p>
                        </div>

                        <button
                          onClick={() => setActiveModuleTab("quiz")}
                          className="w-full pill bg-purple-600 hover:bg-purple-700 text-white py-3 text-xs font-bold transition-all shadow-md shadow-purple-600/20 flex items-center justify-center gap-2"
                        >
                          Step 4: Take Knowledge Test &amp; Quiz <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {/* ── TAB 4: KNOWLEDGE QUIZ & TEST (4 Qs) ── */}
                    {activeModuleTab === "quiz" && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-border pb-4">
                          <div>
                            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                              <HelpCircle className="h-5 w-5 text-purple-500" />
                              Week {activeWeekIndex + 1} Knowledge Assessment
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">Answer all {activeNode.quiz?.length || 5} questions. Score 70%+ (minimum {Math.ceil((activeNode.quiz?.length || 5) * 0.7)}/{activeNode.quiz?.length || 5}) to complete this module.</p>
                          </div>

                          {quizSubmitted[activeWeekIndex] && (
                            <div className="flex items-center gap-2">
                              {quizScores[activeWeekIndex]?.passed ? (
                                <span className="text-xs font-bold text-emerald-600 bg-emerald-500/15 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1">
                                  <CheckCircle2 className="h-3.5 w-3.5" /> Passed ({quizScores[activeWeekIndex].correct}/{quizScores[activeWeekIndex].total})
                                </span>
                              ) : (
                                <span className="text-xs font-bold text-destructive bg-destructive/15 border border-destructive/20 px-3 py-1 rounded-full flex items-center gap-1">
                                  <XCircle className="h-3.5 w-3.5" /> Score: {quizScores[activeWeekIndex]?.correct}/{quizScores[activeWeekIndex]?.total} (Needs Retake)
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Quiz Questions */}
                        {activeNode.quiz?.length > 0 ? (
                          <div className="space-y-6">
                            {activeNode.quiz.map((q, qIdx) => {
                              const answerKey = `${activeWeekIndex}-${qIdx}`;
                              const selectedOpt = quizAnswers[answerKey];
                              const isSubmitted = quizSubmitted[activeWeekIndex];
                              const isCorrect = selectedOpt === q.correct_index;

                              return (
                                <div key={qIdx} className="space-y-3 bg-muted/20 border border-border/70 rounded-2xl p-4">
                                  <p className="text-xs font-bold text-foreground flex items-start gap-2">
                                    <span className="w-5 h-5 rounded-full bg-purple-500/15 text-purple-600 font-extrabold flex items-center justify-center text-[10px] shrink-0">
                                      Q{qIdx + 1}
                                    </span>
                                    {q.question}
                                  </p>

                                  <div className="space-y-2 pl-7">
                                    {q.options?.map((opt, optIdx) => {
                                      const isThisSelected = selectedOpt === optIdx;
                                      let optionStyle = "bg-background border-border hover:border-primary/50 text-foreground";

                                      if (isSubmitted) {
                                        if (optIdx === q.correct_index) {
                                          optionStyle = "bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold";
                                        } else if (isThisSelected && !isCorrect) {
                                          optionStyle = "bg-destructive/15 border-destructive text-destructive font-bold";
                                        }
                                      } else if (isThisSelected) {
                                        optionStyle = "bg-primary/10 border-primary text-primary font-bold";
                                      }

                                      return (
                                        <button
                                          key={optIdx}
                                          type="button"
                                          disabled={isSubmitted}
                                          onClick={() => handleSelectQuizOption(activeWeekIndex, qIdx, optIdx)}
                                          className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between gap-2 ${optionStyle}`}
                                        >
                                          <span>{opt}</span>
                                          {isSubmitted && optIdx === q.correct_index && (
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                          )}
                                          {isSubmitted && isThisSelected && !isCorrect && (
                                            <XCircle className="h-4 w-4 text-destructive shrink-0" />
                                          )}
                                        </button>
                                      );
                                    })}
                                  </div>

                                  {isSubmitted && q.explanation && (
                                    <div className="ml-7 bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 text-[11px] text-purple-700 dark:text-purple-300">
                                      💡 <strong>Explanation:</strong> {q.explanation}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            No quiz questions available for this module. Review the chapters and proceed!
                          </div>
                        )}

                        {/* Quiz Action Buttons */}
                        {!quizSubmitted[activeWeekIndex] ? (
                          <button
                            type="button"
                            onClick={() => handleSubmitQuiz(activeWeekIndex, activeNode.quiz)}
                            className="w-full pill bg-purple-600 hover:bg-purple-700 text-white py-3.5 text-xs font-bold transition-all shadow-md shadow-purple-600/20 flex items-center justify-center gap-2"
                          >
                            <Trophy className="h-4 w-4" /> Submit Quiz &amp; Grade Week {activeWeekIndex + 1}
                          </button>
                        ) : (
                          <div className="space-y-3 pt-2">
                            {!quizScores[activeWeekIndex]?.passed && (
                              <button
                                type="button"
                                onClick={() => handleRetakeQuiz(activeWeekIndex)}
                                className="w-full pill bg-amber-600 hover:bg-amber-700 text-white py-3 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-600/20"
                              >
                                <RotateCcw className="h-4 w-4" /> Retake Quiz (Try Again)
                              </button>
                            )}

                            {activeWeekIndex < (roadmapData.roadmap?.length || 1) - 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveWeekIndex(prev => prev + 1);
                                  setActiveModuleTab("chapters");
                                  setExpandedChapter(0);
                                }}
                                className="w-full pill bg-primary text-primary-foreground py-3 text-xs font-bold transition-all flex items-center justify-center gap-2"
                              >
                                Proceed to Week {activeWeekIndex + 2} Module <ArrowRight className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
