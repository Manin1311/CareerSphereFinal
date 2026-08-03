import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { Header, Footer } from "../../components/user/site-chrome";
import { seekerAPI } from "../../lib/api";
import { 
  FileText, 
  Plus, 
  Sparkles, 
  Trash2, 
  Edit3, 
  Check, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  FileCheck,
  TrendingUp,
  Zap,
  Map,
  X,
  ChevronRight,
  Target,
  BookOpen,
  CheckCircle2
} from "lucide-react";
import toast from "react-hot-toast";
import { TEMPLATE_META } from "../../components/user/templates/ResumePreview";

import resumeModern from "../../assets/resume_template_modern.png";
import resumeClassic from "../../assets/resume_template_classic.png";
import resumeMinimal from "../../assets/resume_template_minimal.png";
import resumeExecutive from "../../assets/resume_template_executive.png";
import resumeCreative from "../../assets/resume_template_creative.png";
import resumeCompact from "../../assets/resume_template_compact.png";
import resumeAts from "../../assets/resume_template_ats.png";

const TEMPLATE_IMAGES = {
  modern: resumeModern,
  classic: resumeClassic,
  minimal: resumeMinimal,
  executive: resumeExecutive,
  creative: resumeCreative,
  compact: resumeCompact,
  ats: resumeAts
};
import useDocumentTitle from "../../hooks/useDocumentTitle";

export default function ResumeBuilderLanding() {
  useDocumentTitle(
    "AI Resume Builder & ATS Optimizer",
    "Build a professional resume optimized for applicant tracking systems using our premium templates."
  );

  const navigate = useNavigate();
  const token = localStorage.getItem("cs_seeker_token");

  // Redirect if not logged in
  if (!token) {
    return <Navigate to="/jobs/login?redirect=/resume-builder" replace />;
  }

  const [drafts, setDrafts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [seeker, setSeeker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  
  const [atsLoading, setAtsLoading] = useState(false);
  const [atsReport, setAtsReport] = useState(null);
  const [atsError, setAtsError] = useState(null);

  // Roadmap progress summary
  const [roadmapProgress, setRoadmapProgress] = useState(null);

  // -- Parse Result Modal State -----------------------------------------------
  const [parseResult, setParseResult] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  // --------------------------------------------------------------------------

  const fetchLandingData = async () => {
    try {
      setLoading(true);
      const [draftsData, recsData, profileData, roadmapData] = await Promise.all([
        seekerAPI.getDrafts(),
        seekerAPI.recommendTemplates().catch(() => ({ recommendations: [] })),
        seekerAPI.getMe().catch(() => null),
        seekerAPI.getRoadmapProgress().catch(() => null),
      ]);
      setDrafts(draftsData || []);
      setRecommendations(recsData?.recommendations || []);
      setSeeker(profileData);
      if (roadmapData?.has_saved) setRoadmapProgress(roadmapData);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load drafts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLandingData();
  }, []);

  const handleCreateDraft = async (templateId) => {
    const isPremiumTemplate = ['executive', 'creative', 'compact'].includes(templateId);
    if (isPremiumTemplate && seeker?.tier !== 'premium') {
      toast((t) => (
        <span className="flex flex-col gap-2">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span><strong>{TEMPLATE_META[templateId].name}</strong> is a Premium template. Please upgrade to use it!</span>
          </span>
          <button 
            onClick={() => {
              toast.dismiss(t.id);
              navigate('/jobs/billing');
            }}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold w-fit transition-colors"
          >
            Upgrade Now
          </button>
        </span>
      ), { duration: 5000 });
      return;
    }

    setBtnLoading(true);
    try {
      const title = `Resume - ${TEMPLATE_META[templateId].name}`;
      const draft = await seekerAPI.createDraft({ title, templateId, is_scratch: true });
      toast.success("Blank resume draft created!");
      navigate(`/resume-builder/edit/${draft.id}`);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to create resume draft");
    } finally {
      setBtnLoading(false);
    }
  };

  const handleImportResume = async () => {
    setBtnLoading(true);
    try {
      const draft = await seekerAPI.createDraft({ 
        title: "Imported Profile Resume", 
        templateId: "modern" 
      });
      toast.success("Imported details successfully!");
      navigate(`/resume-builder/edit/${draft.id}`);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to import profile resume");
    } finally {
      setBtnLoading(false);
    }
  };

  const handleUploadResume = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBtnLoading(true);
    const toastId = toast.loading("Uploading resume...");
    
    let stepCount = 0;
    const interval = setInterval(() => {
      stepCount++;
      if (stepCount === 1) toast.loading("Extracting resume text...", { id: toastId });
      else if (stepCount === 2) toast.loading("Running AI ATS analysis...", { id: toastId });
      else if (stepCount === 3) toast.loading("Structuring resume sections...", { id: toastId });
      else toast.loading("Almost done...", { id: toastId });
    }, 2000);

    try {
      const draft = await seekerAPI.importFileDraft(file);
      clearInterval(interval);
      toast.dismiss(toastId);
      // Show parse result modal instead of immediately navigating
      const skills = draft.resumeData?.skills || [];
      const name = draft.resumeData?.personal?.full_name || draft.resumeData?.personal?.name || "";
      const headline = draft.resumeData?.personal?.headline || draft.resumeData?.personal?.title || "";
      const experience = draft.resumeData?.experience || [];
      const education = draft.resumeData?.education || [];
      setParseResult({ draft, skills, name, headline, experience, education });
    } catch (err) {
      clearInterval(interval);
      console.error(err);
      toast.error(err.message || "Failed to parse resume file", { id: toastId });
    } finally {
      setBtnLoading(false);
      e.target.value = "";
    }
  };

  const handleSaveToProfile = async () => {
    if (!parseResult) return;
    setSavingProfile(true);
    try {
      // Build a minimal profile update from parsed resume data
      const rd = parseResult.draft?.resumeData || {};
      const personal = rd.personal || {};
      const profilePayload = {};
      if (personal.full_name || personal.name) profilePayload.full_name = personal.full_name || personal.name;
      if (personal.email) profilePayload.email = personal.email;
      if (personal.phone) profilePayload.phone = personal.phone;
      if (personal.location) profilePayload.location = personal.location;
      if (personal.headline || personal.title) profilePayload.headline = personal.headline || personal.title;
      if (personal.summary) profilePayload.summary = personal.summary;
      if (personal.linkedin) profilePayload.linkedin_url = personal.linkedin;
      if (personal.github) profilePayload.github_url = personal.github;
      if (personal.portfolio) profilePayload.portfolio_url = personal.portfolio;
      // Skills array
      if (rd.skills?.length > 0) {
        profilePayload.skills = rd.skills.map(s => typeof s === 'string' ? { name: s } : s);
      }
      await seekerAPI.updateProfile(profilePayload);
      toast.success("Profile updated with your resume data! 🎉");
      setParseResult(null);
      navigate(`/resume-builder/edit/${parseResult.draft.id}`);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to save profile. Redirecting to editor...");
      navigate(`/resume-builder/edit/${parseResult.draft.id}`);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDeleteDraft = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this draft?")) return;
    try {
      await seekerAPI.deleteDraft(id);
      toast.success("Draft deleted");
      setDrafts(drafts.filter(d => d.id !== id));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete draft");
    }
  };

  const handleScanCurrentResume = async () => {
    if (seeker?.tier !== 'premium') {
      setAtsError("ATS Compatibility Scanner is a Premium feature. Please upgrade to Premium to unlock ATS compatibility checks.");
      return;
    }
    setAtsLoading(true);
    setAtsReport(null);
    setAtsError(null);
    try {
      // Runs ATS Agent on current active profile resume
      const report = await seekerAPI.atsCheck({ uploadedResumeId: "active" });
      setAtsReport(report);
      toast.success("ATS Compatibility check completed!");
    } catch (err) {
      console.error(err);
      setAtsError(err.message || "Failed to scan resume. Please ensure you have a resume uploaded on your profile.");
      toast.error("ATS check failed");
    } finally {
      setAtsLoading(false);
    }
  };

  // â"€â"€ AI Job Roadmap Generator â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  const handleGenerateRoadmap = async () => {
    if (!jdText.trim() || jdText.trim().length < 50) {
      setRoadmapError("Please paste a complete Job Description (at least 50 characters) to generate an accurate roadmap.");
      return;
    }
    setRoadmapLoading(true);
    setRoadmapData(null);
    setRoadmapError(null);
    setCompletedNodes([]);
    try {
      const result = await seekerAPI.generateJobRoadmap({ job_description: jdText });
      setRoadmapData(result);
    } catch (err) {
      console.error(err);
      setRoadmapError(err.message || "Failed to generate roadmap. Please try again.");
    } finally {
      setRoadmapLoading(false);
    }
  };

  const handleToggleNode = (nodeId) => {
    setCompletedNodes(prev =>
      prev.includes(nodeId) ? prev.filter(n => n !== nodeId) : [...prev, nodeId]
    );
  };
  // â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

  return (
    <div className="min-h-screen bg-background rb-pro-scope">
      <Header />
      
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {/* Hero Section */}
        <section className="mb-12 text-center md:text-left border-b border-border/60 pb-8">
          <div className="max-w-2xl">

            <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              Build a <span className="google-gradient-text">Job-Winning Resume</span> with AI.
            </h1>
            <p className="mt-3 text-muted-foreground text-lg">
              Upload your resume for instant AI parsing, target specific job descriptions, and follow personalized skill-gap roadmaps - so you apply <strong>qualified, not just hopeful</strong>.
            </p>
            <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-3">
              
              {/* â"€â"€ PRIMARY: Upload & Parse â"€â"€ */}
              <label className={`pill bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-all flex items-center gap-2 shadow-elevation-1 cursor-pointer ${btnLoading ? "opacity-50 pointer-events-none" : ""}`}>
                <FileText className="h-4 w-4" />
                <span>Upload &amp; Parse Resume</span>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleUploadResume}
                  className="hidden"
                  disabled={btnLoading}
                />
              </label>

              <button
                disabled={btnLoading}
                onClick={() => navigate("/resume-builder/roadmap")}
                className="pill border border-primary/40 bg-primary/5 px-6 py-3 text-sm font-semibold text-primary hover:bg-primary/10 transition-all flex items-center gap-2 shadow-sm"
              >
                <Map className="h-4 w-4" />
                AI Target Job Roadmap
              </button>

              {/* Roadmap progress quick-resume card */}
              {roadmapProgress && (() => {
                const totalWeeks = roadmapProgress.roadmap_data?.roadmap?.length || 0;
                const doneWeeks = roadmapProgress.completed_weeks?.length || 0;
                const passedQuizzes = Object.values(roadmapProgress.quiz_scores || {}).filter(s => s?.passed).length;
                const pct = totalWeeks > 0 ? Math.round((doneWeeks / totalWeeks) * 100) : 0;
                return (
                  <div className="w-full border border-primary/15 bg-primary/4 rounded-2xl px-4 py-3 flex items-center gap-4">
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-xs font-bold text-foreground truncate">
                        📚 {totalWeeks}-Week Roadmap · {doneWeeks}/{totalWeeks} weeks · {passedQuizzes} quiz{passedQuizzes !== 1 ? "zes" : ""} passed
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-primary shrink-0">{pct}%</span>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate("/resume-builder/roadmap")}
                      className="pill bg-primary text-primary-foreground px-3 py-1.5 text-xs font-bold shrink-0 hover:opacity-90 transition-all flex items-center gap-1.5"
                    >
                      <BookOpen className="h-3 w-3" />
                      Continue
                    </button>
                  </div>
                );
              })()}

              <button
                disabled={btnLoading}
                onClick={() => handleCreateDraft("modern")}
                className="pill border border-border bg-background px-6 py-3 text-sm font-medium hover:bg-muted transition-all flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Build from scratch
              </button>

              {/*
                â"€â"€ COMMENTED OUT: Import my profile data button â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
                Replaced by "Upload & Parse Resume" as the single source of
                truth for candidate profile extraction. "Import profile data"
                was less accurate than the AI parsing pipeline.
                To restore: uncomment the block below and remove the Upload button above.

              <button
                disabled={btnLoading}
                onClick={handleImportResume}
                className="pill bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-all flex items-center gap-2 shadow-elevation-1 disabled:opacity-50"
              >
                <FileCheck className="h-4 w-4" />
                Import my profile data
              </button>
                â"€â"€ END COMMENTED OUT â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
            </div>
          </div>
        </section>

        {/* Existing Drafts */}
        {drafts.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              My Saved Resumes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drafts.map((d) => (
                <div 
                  key={d.id} 
                  className={`bg-card border rounded-3xl p-5 hover:shadow-elevation-2 transition-all relative flex flex-col justify-between ${
                    d.isActive ? "border-primary shadow-elevation-1 ring-1 ring-primary/25" : "border-border"
                  }`}
                >
                  {d.isActive && (
                    <span className="absolute top-4 right-4 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      <Check className="h-3.5 w-3.5" /> Active Resume
                    </span>
                  )}
                  <div>
                    <h3 className="text-base font-semibold pr-24 truncate">{d.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Template: {TEMPLATE_META[d.templateId]?.name || d.templateId} · Updated {new Date(d.updatedAt).toLocaleDateString()}
                    </p>
                    
                    {d.atsScore !== null && d.atsScore !== undefined && (
                      <div className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-surface px-3 py-1 text-xs font-medium text-muted-foreground border border-border">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        ATS Score: <span className="font-bold text-primary">{d.atsScore}%</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-4">
                    <button
                      onClick={() => navigate(`/resume-builder/edit/${d.id}`)}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                    >
                      <Edit3 className="h-4 w-4" /> Edit content
                    </button>
                    <button
                      onClick={(e) => handleDeleteDraft(d.id, e)}
                      className="p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-full transition-all"
                      title="Delete Draft"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Templates Gallery */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">ATS-Friendly Templates</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Select a design to instantiate a new draft. You can change templates seamlessly at any time in the editor.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(TEMPLATE_META).map(([id, meta]) => {
              const isRecommended = recommendations.includes(id);
              const isPremium = ['executive', 'creative', 'compact'].includes(id);
              return (
                <div 
                  key={id}
                  className={`group relative overflow-hidden rounded-3xl border bg-card text-left shadow-elevation-1 transition-all hover:shadow-elevation-2 flex flex-col justify-between ${
                    isRecommended ? "border-primary/50 ring-1 ring-primary/10" : "border-border"
                  }`}
                >
                  <div className="p-4 bg-muted/30 border-b border-border/60 aspect-[8.5/11] flex items-center justify-center relative overflow-hidden">
                    {isRecommended && (
                      <span className="absolute top-4 left-4 z-10 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground shadow-elevation-1">
                        <Sparkles className="h-3 w-3" /> Recommended
                      </span>
                    )}
                    {isPremium && (
                      <span className="absolute top-4 right-4 z-10 inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-elevation-1">
                        <Zap className="h-3 w-3 fill-white" /> Premium
                      </span>
                    )}
                    
                    {/* Visual Mock representation of template */}
                    <div className="absolute inset-4 bg-white border border-border rounded-xl shadow-elevation-1 overflow-hidden scale-100 group-hover:scale-[1.02] transition-all">
                      <img 
                        src={TEMPLATE_IMAGES[id]} 
                        alt={`${meta.name} Template Preview`} 
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-5">
                    <div>
                      <div className="text-base font-semibold text-foreground">{meta.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{meta.description}</div>
                    </div>
                    <button
                      disabled={btnLoading}
                      onClick={() => handleCreateDraft(id)}
                      className={`pill px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-all shrink-0 ${isPremium && seeker?.tier !== 'premium' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-primary'}`}
                    >
                      {isPremium && seeker?.tier !== 'premium' ? 'Unlock Premium' : 'Use Template'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />

      {/* PARSE RESULT MODAL */}
      {parseResult && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md" onClick={() => setParseResult(null)}>
          <div
            className="relative bg-background border border-border/80 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 shrink-0" />

            <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                  <FileCheck className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground leading-none">Resume Parsed Successfully!</h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5">AI extracted your details - review and save to profile</p>
                </div>
              </div>
              <button onClick={() => setParseResult(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-5">

              {(parseResult.name || parseResult.headline) && (
                <div className="bg-gradient-to-br from-blue-500/8 to-purple-500/8 border border-blue-500/15 rounded-2xl p-4 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shrink-0">
                    {(parseResult.name || "?")[0].toUpperCase()}
                  </div>
                  <div>
                    {parseResult.name && <p className="font-bold text-foreground text-base">{parseResult.name}</p>}
                    {parseResult.headline && <p className="text-sm text-muted-foreground mt-0.5">{parseResult.headline}</p>}
                    <div className="flex gap-3 mt-2">
                      {parseResult.experience?.length > 0 && (
                        <span className="text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full">
                          {parseResult.experience.length} experience{parseResult.experience.length > 1 ? "s" : ""}
                        </span>
                      )}
                      {parseResult.education?.length > 0 && (
                        <span className="text-[11px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded-full">
                          {parseResult.education.length} education
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {parseResult.skills?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    Skills Extracted ({parseResult.skills.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {parseResult.skills.slice(0, 20).map((s, i) => (
                      <span key={i} className="text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-1 rounded-full">
                        {typeof s === "string" ? s : (s.canonical_skill || s.name || s.skill || String(s))}
                      </span>
                    ))}
                    {parseResult.skills.length > 20 && (
                      <span className="text-[11px] text-muted-foreground px-2.5 py-1">+{parseResult.skills.length - 20} more</span>
                    )}
                  </div>
                </div>
              )}

              {parseResult.skills?.length === 0 && (
                <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  No skills detected automatically. You can add them manually in the editor.
                </div>
              )}

              <div className="bg-muted/30 rounded-2xl p-4 text-xs text-muted-foreground space-y-1.5 border border-border">
                <p className="font-semibold text-foreground text-sm mb-2">What will be saved to your profile?</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-500" /> Name & headline</span>
                  <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-500" /> Contact details</span>
                  <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-500" /> All extracted skills</span>
                  <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-500" /> Summary / bio</span>
                  <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-500" /> LinkedIn & GitHub URLs</span>
                  <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-500" /> Location</span>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 pt-3 border-t border-border flex flex-col sm:flex-row gap-3 shrink-0">
              <button
                onClick={() => { setParseResult(null); navigate(`/resume-builder/edit/${parseResult.draft.id}`); }}
                className="flex-1 rounded-2xl border border-border bg-background px-5 py-3 text-sm font-semibold hover:bg-muted transition-all flex items-center justify-center gap-2"
              >
                <Edit3 className="h-4 w-4" /> Skip - Edit in Builder
              </button>
              <button
                onClick={handleSaveToProfile}
                disabled={savingProfile}
                className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white px-5 py-3 text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-emerald-500/20"
              >
                {savingProfile ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><CheckCircle2 className="h-4 w-4" /> Save to My Profile</>}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* END PARSE RESULT MODAL */}

    </div>
  );
}
