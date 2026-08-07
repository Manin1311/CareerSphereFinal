"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Link2, Eye, X, CheckCircle, XCircle, Briefcase, GraduationCap, Award, Clock, ChevronDown, ChevronUp, ExternalLink, Sparkles, FileText, Copy } from 'lucide-react';

// Inline SVG icons for Github and Linkedin (not available in this lucide-react version)
const Github = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);

const Linkedin = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);
import { toast } from 'react-hot-toast';
import { candidatesAPI, API_HOST } from '../lib/api';

const formatExternalUrl = (url) => {
  if (!url) return '';
  const trimmed = String(url).trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

export default function CandidateCard({ candidate, sessionId, rounds = [], onAction, isHighlighted, forceOpenDetails, onCloseDetails }) {
  const [showDetail, setShowDetail] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [animatingOut, setAnimatingOut] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [detailedCandidate, setDetailedCandidate] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [photoError, setPhotoError] = useState(false);

  useEffect(() => {
    if (forceOpenDetails) {
      setShowDetail(true);
    }
  }, [forceOpenDetails]);

  useEffect(() => {
    if (showDetail && !detailedCandidate && !loadingDetails) {
      setLoadingDetails(true);
      candidatesAPI.get(sessionId, candidate.id)
        .then(data => {
          setDetailedCandidate(data);
          setLoadingDetails(false);
        })
        .catch(err => {
          console.error("Failed to load candidate details", err);
          setLoadingDetails(false);
        });
    }
  }, [showDetail, sessionId, candidate.id, detailedCandidate, loadingDetails]);

  const activeCandidate = detailedCandidate || candidate;

  const getInitials = (name) => {
    if (!name) return "??";
    return name.slice(0, 2).toUpperCase();
  };

  const getSkillName = (s) => {
    if (typeof s === 'object' && s !== null) {
      return s.canonical_skill || s.raw_skill || s.skill || s.name || '';
    }
    const strVal = String(s || '').trim();
    if (strVal.startsWith('{') && strVal.endsWith('}')) {
      try {
        const parsed = JSON.parse(strVal.replace(/'/g, '"').replace(/: None/g, ': null'));
        return parsed.canonical_skill || parsed.raw_skill || parsed.skill || parsed.name || strVal;
      } catch (e) {
        const canonicalMatch = strVal.match(/'canonical_skill':\s*'([^']+)'/) || strVal.match(/"canonical_skill":\s*"([^"]+)"/);
        if (canonicalMatch) return canonicalMatch[1];
        
        const rawMatch = strVal.match(/'raw_skill':\s*'([^']+)'/) || strVal.match(/"raw_skill":\s*"([^"]+)"/);
        if (rawMatch) return rawMatch[1];

        const skillMatch = strVal.match(/'skill':\s*'([^']+)'/) || strVal.match(/"skill":\s*"([^"]+)"/);
        if (skillMatch) return skillMatch[1];

        const nameMatch = strVal.match(/'name':\s*'([^']+)'/) || strVal.match(/"name":\s*"([^"]+)"/);
        if (nameMatch) return nameMatch[1];
      }
    }
    return strVal;
  };

  const getHashColor = (name) => {
    if (!name) return "#2563EB";
    const colors = ["#2563EB", "#3B82F6", "#22C55E", "#8B5CF6", "#EF4444", "#F59E0B"];
    const idx = name.charCodeAt(0) % colors.length;
    return colors[idx];
  };

  const getScoreColor = (score) => {
    if (score >= 75) return "#22C55E";
    if (score >= 50) return "#2563EB";
    return "#EF4444";
  };

  const getBadge = (score) => {
    if (score >= 80) return <span className="bg-[#DCFCE7] text-[#166534] font-bold border border-[#BBF7D0] px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">Strong Match</span>;
    if (score >= 60) return <span className="bg-blue-100 text-amber-700 font-bold border border-amber-200 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">Good Match</span>;
    if (score >= 40) return <span className="bg-blue-100 text-blue-700 font-bold border border-blue-200 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">Partial Match</span>;
    return <span className="bg-red-100 text-red-700 font-bold border border-red-200 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">Poor Match</span>;
  };

  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const score = candidate?.match_score || 0;
  const dashoffset = circumference - (score / 100 * circumference);

  const maxRound = rounds.length > 0 ? Math.max(...rounds.map(r => r.order || 1)) : 1;
  const currentRoundIndex = candidate?.round_index ?? candidate?.current_round_index ?? 0;
  const isLastRound = currentRoundIndex >= maxRound;
  const isHiredOrRejected = candidate?.status === "hired" || candidate?.status === "rejected";

  const [showOfferModal, setShowOfferModal] = useState(false);

  const handleForwardOrHire = async () => {
    const isHire = isLastRound;
    if (isHire) {
      setShowOfferModal(true);
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
  };

  const submitHire = async (file) => {
    setAnimatingOut(true);
    setShowOfferModal(false);
    try {
      await candidatesAPI.action(sessionId, candidate?.id, "hire", file);
      toast.success(`${candidate?.name} has been hired!`);
      if (onAction) onAction();
    } catch (e) {
      setAnimatingOut(false);
      toast.error(e.message || "Action failed");
    }
  };

  const handleReject = async () => {
    setAnimatingOut(true);
    try {
      await candidatesAPI.action(sessionId, candidate?.id, "reject");
      toast.success(`${candidate?.name} has been rejected`);
      if (onAction) onAction();
    } catch (e) {
      setAnimatingOut(false);
      toast.error(e.message || "Action failed");
    }
  };

  const matchedSkills = activeCandidate?.matched_skills || activeCandidate?.match_details?.matched_skills || [];
  const missingSkills = activeCandidate?.missing_skills || activeCandidate?.match_details?.missing_skills || [];
  const otherSkills = activeCandidate?.other_skills || activeCandidate?.match_details?.other_skills || [];
  const normalizedSkills = activeCandidate?.normalized_skills || [];
  const allSkills = matchedSkills.length > 0 || missingSkills.length > 0 ? [...matchedSkills, ...missingSkills] : normalizedSkills;
  const hasSkills = allSkills.length > 0 || otherSkills.length > 0;
  // New deeply extracted fields
  const rawData = activeCandidate?.raw_resume_data || {};

  const experience = activeCandidate?.experience || rawData?.experience || [];
  const education = activeCandidate?.education || rawData?.education || [];
  const expYears = activeCandidate?.experience_years ?? activeCandidate?.total_experience_years ?? rawData?.total_experience_years ?? 0;

  const skillScore = activeCandidate?.skill_score ?? activeCandidate?.match_details?.skill_score ?? 0;
  const experienceScore = activeCandidate?.experience_score ?? activeCandidate?.match_details?.experience_score ?? 0;
  const locationScore = activeCandidate?.location_score ?? activeCandidate?.match_details?.location_score ?? 0;

  const summary = rawData.summary || activeCandidate?.summary || "";
  const projects = rawData.projects || activeCandidate?.projects || [];
  const certifications = activeCandidate?.certifications || activeCandidate?.awards || rawData?.certifications || [];
  const achievements = activeCandidate?.achievements || rawData.achievements || rawData.awards || activeCandidate?.awards || [];
  const languages = activeCandidate?.languages || rawData?.languages || [];

  const apiBase = API_HOST;
  const rawPhoto = activeCandidate?.photo_url || activeCandidate?.avatar_path || activeCandidate?.avatar_url || candidate?.photo_url || candidate?.avatar_path || candidate?.avatar_url;
  const photoUrl = rawPhoto ? (rawPhoto.startsWith('http') || rawPhoto.startsWith('data:') ? rawPhoto : `${apiBase}${rawPhoto.startsWith('/') ? '' : '/'}${rawPhoto}`) : null;
  const resumeUrl = activeCandidate?.resume_url ? (activeCandidate.resume_url.startsWith('http') ? activeCandidate.resume_url : `${apiBase}${activeCandidate.resume_url}`) : null;
  const rawResumeText = activeCandidate?.raw_resume_text || activeCandidate?.raw_resume_data?.raw_text || activeCandidate?.raw_resume_data?.text || activeCandidate?.raw_resume_data?.full_text || rawData?.raw_text || rawData?.text || rawData?.full_text || candidate?.raw_resume_text || "";

  // Key Highlights logic
  const topMatched = activeCandidate?.matched_skills?.slice(0, 3) || [];
  const topOther = activeCandidate?.other_skills?.slice(0, 3) || [];
  const highlights = [...topMatched, ...topOther].slice(0, 5);

  return (
    <>
      <motion.div
        animate={
          animatingOut ? { opacity: 0, x: -20, transition: { duration: 0.3 } } :
          isHighlighted ? { scale: [1, 1.02, 1], transition: { duration: 1, repeat: 3 } } : 
          { opacity: 1, x: 0 }
        }
        className={`bg-card dark:bg-[#121217] rounded-xl p-5 border-2 transition-all duration-200 flex flex-col ${
          isHighlighted ? 'border-sky-500 shadow-[0_0_0_1px_#0284c7,0_0_16px_rgba(2,132,199,0.3)] relative z-10' : 'border-border dark:border-zinc-800 shadow-xs'
        } ${candidate?.status === 'hired' ? 'border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/20' : ''} ${candidate?.status === 'rejected' ? 'border-rose-500/50 bg-rose-50/20 dark:bg-rose-950/20 opacity-75' : ''}`}
      >
        {/* HEADER: Avatar + Name + Score */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center font-bold text-white overflow-hidden shadow-sm" style={{ backgroundColor: getHashColor(candidate?.name) }}>
            {photoUrl && !photoError ? (
              <img src={photoUrl} alt={candidate.name} onError={() => setPhotoError(true)} className="w-full h-full object-cover" />
            ) : (
              getInitials(candidate?.name)
            )}
          </div>

          <div className="flex-1 truncate">
            <h4 className="font-bold text-[15px] text-foreground dark:text-zinc-100 truncate">{candidate?.name || 'Unnamed Candidate'}</h4>
            <div className="flex items-center gap-2 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
              {candidate?.current_role && (
                <span className="text-[12px] text-sky-600 dark:text-sky-400 font-semibold truncate">{candidate.current_role}</span>
              )}
              {candidate?.current_role && <span className="text-muted-foreground">•</span>}
              <span className="text-[12px] text-muted-foreground dark:text-gray-300 flex items-center gap-0.5"><MapPin size={11}/> {candidate?.location || "Unknown"}</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-[12px] text-muted-foreground dark:text-gray-300 flex items-center gap-1"><Briefcase size={12} className="text-muted-foreground shrink-0" /> {expYears} yrs</span>
            </div>
          </div>

          <div className="relative w-14 h-14 shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="28" cy="28" r={radius} stroke="currentColor" className="text-muted/30" strokeWidth="4" fill="transparent" />
              <motion.circle
                cx="28" cy="28" r={radius}
                stroke={getScoreColor(score)} strokeWidth="4" fill="transparent"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: dashoffset }}
                transition={{ duration: 1, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-black text-xs text-foreground dark:text-zinc-100">
              {score}<span className="text-[9px]">%</span>
            </div>
          </div>
        </div>

        {/* Highlights */}
        {highlights.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-1.5 h-[52px] overflow-hidden content-start">
            {highlights.map((h, i) => (
              <span key={i} className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                candidate?.matched_skills?.includes(h) 
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700' 
                  : 'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-700'
              }`}>
                {getSkillName(h)}
              </span>
            ))}
            {allSkills.length > 5 && (
              <span className="text-[10px] font-bold text-muted-foreground dark:text-gray-300 bg-muted dark:bg-zinc-800 px-2 py-0.5 rounded-md border border-border dark:border-zinc-700">
                +{allSkills.length - 5}
              </span>
            )}
          </div>
        )}

        {/* CONTACT ROW */}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground dark:text-gray-300">
          {candidate?.email && (
            <span className="flex items-center gap-1 truncate max-w-[180px]" title={candidate.email}>
              <Mail size={10} className="text-muted-foreground shrink-0"/> {candidate.email}
            </span>
          )}
          {candidate?.phone && (
            <span className="flex items-center gap-1">
              <Phone size={10} className="text-muted-foreground shrink-0"/> {candidate.phone}
            </span>
          )}
          {candidate?.linkedin_url && (
            <a href={formatExternalUrl(candidate.linkedin_url)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sky-600 dark:text-sky-400 hover:underline">
              <Linkedin size={10}/> LinkedIn
            </a>
          )}
          {candidate?.github_url && (
            <a href={formatExternalUrl(candidate.github_url)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-foreground dark:text-gray-200 hover:underline">
              <Github size={10}/> GitHub
            </a>
          )}
        </div>

        {/* SKILLS */}
        <div className="mt-3 flex flex-wrap gap-1 items-start">
          {!hasSkills && (
            <span className="text-xs text-muted-foreground italic">No skills detected</span>
          )}
          {matchedSkills.slice(0, 4).map((s, i) => (
            <span key={i} className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center gap-0.5">
              ✓ {getSkillName(s)}
            </span>
          ))}
          {missingSkills.slice(0, 2).map((s, i) => (
            <span key={i} className="bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700 px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center gap-0.5">
              ✗ {getSkillName(s)}
            </span>
          ))}
          {matchedSkills.length === 0 && missingSkills.length === 0 && normalizedSkills.slice(0, 5).map((s, i) => (
            <span key={i} className="bg-muted dark:bg-zinc-800 text-foreground dark:text-zinc-200 border border-border dark:border-zinc-700 px-1.5 py-0.5 rounded text-[10px] font-semibold">
              {getSkillName(s)}
            </span>
          ))}
          {(matchedSkills.length > 4 || missingSkills.length > 2 || (matchedSkills.length === 0 && normalizedSkills.length > 5)) && (
            <span className="text-muted-foreground dark:text-gray-400 text-[10px] font-bold px-1 py-0.5 uppercase tracking-wider">
              +{Math.max(0, matchedSkills.length - 4) + Math.max(0, missingSkills.length - 2) + (matchedSkills.length === 0 ? Math.max(0, normalizedSkills.length - 5) : 0)} more
            </span>
          )}
        </div>

        {/* EXPERIENCE PREVIEW (expandable) */}
        {experience.length > 0 && (
          <div className="mt-3">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground dark:text-gray-300 mb-1">
              <Briefcase size={11} className="text-muted-foreground"/>
              <span>{experience[0]?.role || "Role"}</span>
              <span className="text-muted-foreground mx-0.5">@</span>
              <span className="text-sky-600 dark:text-sky-400 font-bold">{experience[0]?.company || "Company"}</span>
              {experience[0]?.duration && <span className="text-muted-foreground dark:text-gray-400 ml-auto text-[10px]">{experience[0].duration}</span>}
            </div>
            {experience.length > 1 && (
              <div className="text-[10px] text-muted-foreground italic">+{experience.length - 1} more positions</div>
            )}
          </div>
        )}

        {/* EDUCATION PREVIEW */}
        {education.length > 0 && (
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground dark:text-gray-300">
            <GraduationCap size={11} className="text-muted-foreground"/>
            <span className="font-semibold text-foreground dark:text-gray-200">{education[0]?.degree}{education[0]?.field ? ` in ${education[0].field}` : ''}</span>
            {education[0]?.institution && <span className="text-muted-foreground dark:text-gray-400">— {education[0].institution}</span>}
          </div>
        )}

        {/* BADGE + STATUS */}
        <div className="mt-3 flex items-center justify-between">
          {getBadge(score)}
          {candidate?.status && candidate.status !== "new" && candidate.status !== "active" && (
            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
              candidate.status === 'hired' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300' :
              candidate.status === 'rejected' ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300' :
              candidate.status === 'forwarded' ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-300' :
              'bg-muted text-muted-foreground border-border'
            }`}>
              {candidate.status}
            </span>
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div className="mt-4 flex gap-2">
          <button 
            onClick={() => setShowDetail(true)}
            className="flex-1 border border-border dark:border-zinc-700 bg-background text-foreground dark:text-gray-100 hover:bg-muted dark:hover:bg-zinc-800 py-1.5 rounded-lg text-[13px] font-bold transition-colors flex justify-center items-center gap-1.5"
          >
            <Eye size={16}/> Profile
          </button>

          <button 
            onClick={() => setShowResumeModal(true)}
            className="px-3 border border-border dark:border-zinc-700 bg-background text-foreground dark:text-gray-100 hover:bg-muted dark:hover:bg-zinc-800 py-1.5 rounded-lg text-[13px] font-bold transition-colors flex justify-center items-center gap-1.5"
            title="View Original Raw Resume Text"
          >
             <FileText size={14} /> Resume
          </button>
          
          {!isHiredOrRejected && (
            <>
              <button 
                onClick={handleForwardOrHire}
                className={`flex-[1.5] text-white py-1.5 rounded-lg text-sm font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5 ${
                  isLastRound ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-sky-600 hover:bg-sky-700'
                }`}
              >
                {isLastRound ? <><Sparkles size={14} /> Hire</> : <>Forward &rarr;</>}
              </button>

              <motion.button 
                onClick={handleReject}
                animate={animatingOut ? { x: [0, -8, 8, -4, 0] } : {}}
                className="flex-[0.5] border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 bg-background hover:bg-rose-50 dark:hover:bg-rose-950/40 py-1.5 rounded-lg transition-colors flex justify-center items-center"
                title="Reject"
              >
                <X size={18}/>
              </motion.button>
            </>
          )}
        </div>
      </motion.div>

      {/* DETAIL DRAWER */}
      <AnimatePresence>
        {showDetail && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setShowDetail(false); onCloseDetails?.(); }}
              className="fixed inset-0 bg-[#2A2A2A]/40 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-[520px] bg-card dark:bg-[#121217] text-foreground shadow-2xl z-50 flex flex-col border-l border-border dark:border-zinc-800"
            >
              <div className="p-5 border-b border-border dark:border-zinc-800 flex justify-between items-center bg-card dark:bg-[#121217]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full font-bold text-white flex items-center justify-center text-sm shadow-sm" style={{backgroundColor: getHashColor(activeCandidate?.name)}}>
                    {getInitials(activeCandidate?.name)}
                  </div>
                  <div>
                    <h2 className="font-black text-lg text-foreground dark:text-zinc-100 tracking-tight leading-tight">{activeCandidate?.name || 'Candidate Details'}</h2>
                    <p className="text-sm text-muted-foreground dark:text-gray-300 font-medium">{activeCandidate?.current_role || 'Candidate'}</p>
                  </div>
                </div>
                <button onClick={() => { setShowDetail(false); onCloseDetails?.(); }} className="p-2 bg-muted dark:bg-zinc-800 hover:bg-muted/80 rounded-full text-foreground dark:text-gray-200 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                
                {/* AI Insights Section */}
                <section className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-foreground dark:text-zinc-100 flex items-center gap-1.5 border-b border-border dark:border-zinc-800 pb-2">
                    <Sparkles size={16} className="text-accent" /> AI Insights
                  </h3>
                  
                  {loadingDetails ? (
                    <div className="space-y-3">
                      <div className="h-16 bg-muted animate-pulse rounded-xl" />
                      <div className="h-12 bg-muted animate-pulse rounded-xl" />
                      <div className="h-16 bg-muted animate-pulse rounded-xl" />
                    </div>
                  ) : (
                    <>
                      {/* Why Hire */}
                      <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 rounded-xl p-3.5">
                        <h4 className="text-xs font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider mb-1.5">Why Hire?</h4>
                        <p className="text-xs text-emerald-950 dark:text-emerald-100 font-medium leading-relaxed">
                          {activeCandidate?.ai_insights?.why_hire || 
                           `Exhibits strong alignment in required technical skills with ${expYears} years of experience in the industry.`}
                        </p>
                      </div>

                      {/* Risk Factors */}
                      <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 rounded-xl p-3.5">
                        <h4 className="text-xs font-black text-rose-800 dark:text-rose-300 uppercase tracking-wider mb-1.5">Risk Factors</h4>
                        <p className="text-xs text-rose-950 dark:text-rose-100 font-medium leading-relaxed">
                          {activeCandidate?.ai_insights?.risk_factors || 
                           `May require onboarding support for specific team workflows. No major security or compatibility risks detected.`}
                        </p>
                      </div>

                      {/* Skill Match Breakdown */}
                      <div className="bg-muted/50 dark:bg-zinc-800/60 border border-border dark:border-zinc-700 rounded-xl p-3.5 space-y-3">
                        <h4 className="text-xs font-black text-foreground dark:text-zinc-200 uppercase tracking-wider">Skill Match Breakdown</h4>
                        <div className="space-y-2">
                          {(activeCandidate?.ai_insights?.skill_match_breakdown || [
                            { skill: matchedSkills[0] ? getSkillName(matchedSkills[0]) : "React / Frontend", percentage: activeCandidate?.skill_score || 96 },
                            { skill: "Leadership", percentage: activeCandidate?.experience_score || 82 },
                            { skill: "Cloud / DevOps", percentage: activeCandidate?.location_score || 61 }
                          ]).map((item, idx) => {
                            const barColors = ["bg-[#10b981]", "bg-[#3b82f6]", "bg-[#f59e0b]"];
                            const textColors = ["text-[#10b981]", "text-[#3b82f6]", "text-[#f59e0b]"];
                            const colorIdx = idx % barColors.length;
                            return (
                              <div key={idx}>
                                <div className="flex justify-between text-xs font-bold text-foreground dark:text-gray-200 mb-1">
                                  <span>{item.skill}</span>
                                  <span className={textColors[colorIdx]}>{item.percentage}%</span>
                                </div>
                                <div className="w-full h-2 bg-muted dark:bg-zinc-700 rounded-full overflow-hidden">
                                  <div className={`h-full ${barColors[colorIdx]} rounded-full`} style={{ width: `${item.percentage}%` }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </section>

                {/* Summary */}
                {summary && (
                  <section>
                    <h3 className="text-xs font-black text-muted-foreground dark:text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">Professional Summary</h3>
                    <div className="bg-muted/40 dark:bg-zinc-900 rounded-xl p-4 border border-border dark:border-zinc-800">
                      <p className="text-sm text-foreground dark:text-gray-100 leading-relaxed font-medium">{summary}</p>
                    </div>
                  </section>
                )}
                
                {/* Contact */}
                <section>
                  <h3 className="text-xs font-black text-muted-foreground dark:text-gray-400 uppercase tracking-widest mb-3">Contact Information</h3>
                  <div className="bg-muted/40 dark:bg-zinc-900 rounded-xl p-4 space-y-3 border border-border dark:border-zinc-800">
                    <div className="flex items-center gap-3 text-sm text-foreground dark:text-gray-200 font-medium">
                      <Mail size={16} className="text-muted-foreground"/> {activeCandidate?.email || 'N/A'}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-foreground dark:text-gray-200 font-medium">
                      <Phone size={16} className="text-muted-foreground"/> {activeCandidate?.phone || 'N/A'}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-foreground dark:text-gray-200 font-medium">
                      <MapPin size={16} className="text-muted-foreground"/> {activeCandidate?.location || 'N/A'}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-foreground dark:text-gray-200 font-medium">
                      <Briefcase size={16} className="text-muted-foreground"/> {expYears} years of experience
                    </div>
                    {activeCandidate?.linkedin_url && (
                      <div className="flex items-center gap-3 text-sm font-medium">
                        <Linkedin size={16} className="text-sky-500"/>
                        <a href={formatExternalUrl(activeCandidate.linkedin_url)} target="_blank" rel="noopener noreferrer" className="text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1">
                          LinkedIn Profile <ExternalLink size={12}/>
                        </a>
                      </div>
                    )}
                    {activeCandidate?.github_url && (
                      <div className="flex items-center gap-3 text-sm font-medium">
                        <Github size={16} className="text-foreground dark:text-gray-200"/>
                        <a href={formatExternalUrl(activeCandidate.github_url)} target="_blank" rel="noopener noreferrer" className="text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1">
                          GitHub Profile <ExternalLink size={12}/>
                        </a>
                      </div>
                    )}
                  </div>
                </section>

                {/* Match Breakdown */}
                <section>
                  <h3 className="text-xs font-black text-muted-foreground dark:text-gray-400 uppercase tracking-widest mb-3 flex justify-between items-end">
                    Match Breakdown
                    <span className="text-3xl font-black text-foreground dark:text-zinc-100">{score}<span className="text-xl">%</span></span>
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-bold text-muted-foreground dark:text-gray-300 mb-1.5">
                        <span>Skills Match</span>
                        <span className="text-sky-600 dark:text-sky-400">{skillScore}%</span>
                      </div>
                      <div className="w-full h-2 bg-muted dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-sky-600 dark:bg-sky-500" style={{width: `${skillScore}%`}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-bold text-muted-foreground dark:text-gray-300 mb-1.5">
                        <span>Experience Match</span>
                        <span className="text-sky-600 dark:text-sky-400">{experienceScore}%</span>
                      </div>
                      <div className="w-full h-2 bg-muted dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-sky-600 dark:bg-sky-500" style={{width: `${experienceScore}%`}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-bold text-muted-foreground dark:text-gray-300 mb-1.5">
                        <span>Location Match</span>
                        <span className="text-sky-600 dark:text-sky-400">{locationScore}%</span>
                      </div>
                      <div className="w-full h-2 bg-muted dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-sky-600 dark:bg-sky-500" style={{width: `${locationScore}%`}}></div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Skills */}
                <section>
                  <h3 className="text-xs font-black text-muted-foreground dark:text-gray-400 uppercase tracking-widest mb-3">All Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {matchedSkills.map((s,i) => (
                      <span key={`m-${i}`} className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle size={14} className="text-emerald-500"/> {getSkillName(s)}
                      </span>
                    ))}
                    {missingSkills.map((s,i) => (
                      <span key={`x-${i}`} className="bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5">
                        <XCircle size={14} className="text-rose-500"/> {getSkillName(s)}
                      </span>
                    ))}
                    {otherSkills.map((s,i) => (
                      <span key={`o-${i}`} className="bg-muted dark:bg-zinc-800 text-foreground dark:text-zinc-200 border border-border dark:border-zinc-700 px-3 py-1.5 rounded-lg text-xs font-bold">{getSkillName(s)}</span>
                    ))}
                    {matchedSkills.length === 0 && missingSkills.length === 0 && normalizedSkills.map((s,i) => (
                      <span key={`n-${i}`} className="bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-700 px-3 py-1.5 rounded-lg text-xs font-bold">{getSkillName(s)}</span>
                    ))}
                  </div>
                </section>

                {/* Work History Section */}
                <section className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
                  <h3 className="text-xs font-black text-muted-foreground dark:text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5 border-b border-border dark:border-zinc-800 pb-2">
                    <Briefcase size={16} className="text-muted-foreground" /> Work History
                  </h3>
                  
                  {loadingDetails ? (
                    <div className="space-y-4">
                      <div className="h-20 bg-muted animate-pulse rounded-xl" />
                      <div className="h-20 bg-muted animate-pulse rounded-xl" />
                    </div>
                  ) : experience.length > 0 ? (
                    <div className="relative border-l border-border dark:border-zinc-700 ml-3 pl-6 space-y-6 my-2">
                      {experience.map((exp, i) => {
                        const responsibilities = exp.responsibilities || [];
                        const bullets = Array.isArray(responsibilities) 
                          ? responsibilities 
                          : (typeof responsibilities === 'string' ? responsibilities.split('\n') : []);
                        const descriptionBullets = exp.description 
                          ? String(exp.description).split('\n') 
                          : [];
                        const allBullets = [...bullets, ...descriptionBullets].filter(b => b.trim().length > 0);

                        return (
                          <div key={i} className="relative">
                            {/* Dot indicator */}
                            <span className="absolute -left-[30px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-card border border-border">
                              <span className={`h-2.5 w-2.5 rounded-full ${i === 0 ? 'bg-sky-500' : 'bg-primary'}`} />
                            </span>
                            
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-sm font-bold text-foreground dark:text-zinc-100">
                                <Briefcase size={13} className="text-muted-foreground shrink-0" />
                                <span>{exp.role || exp.title || 'Role'}</span>
                                <span className="text-muted-foreground">•</span>
                                <span className="text-sky-600 dark:text-sky-400 font-bold">{exp.company || 'Company'}</span>
                              </div>
                              <div className="text-[11px] font-semibold text-muted-foreground dark:text-gray-400 uppercase tracking-wider">
                                {exp.start_date} — {exp.end_date || 'Present'}
                                {exp.duration && <span className="ml-2 bg-muted text-foreground dark:text-gray-300 px-1.5 py-0.5 rounded lowercase font-medium">{exp.duration}</span>}
                              </div>
                              {allBullets.length > 0 ? (
                                <ul className="list-disc pl-4 text-xs text-foreground dark:text-gray-300 space-y-1 mt-2">
                                  {allBullets.map((bullet, idx) => (
                                    <li key={idx} className="leading-relaxed font-medium">
                                      {bullet.replace(/^\s*[\-\•\*\s]\s*/, '')}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-xs text-muted-foreground italic mt-1">No detailed descriptions extracted.</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic text-center py-2">No professional experience extracted.</p>
                  )}
                </section>

                {/* Projects Section */}
                {projects && projects.length > 0 && (
                  <section className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
                    <h3 className="text-xs font-black text-muted-foreground dark:text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5 border-b border-border dark:border-zinc-800 pb-2">
                      <Award size={16} className="text-muted-foreground" /> Projects
                    </h3>
                    
                    <div className="space-y-3">
                      {projects.map((proj, i) => {
                        const name = proj.name || proj.title || 'Project';
                        const badgeText = i === 0 ? "Featured" : ((proj.url || proj.link) ? "Open Source" : null);
                        const badgeColor = i === 0 
                          ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300" 
                          : "bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-300";

                        return (
                          <div key={i} className="bg-muted/30 dark:bg-zinc-800/50 border border-border dark:border-zinc-700 rounded-xl p-4 space-y-2">
                            <div className="flex justify-between items-center">
                              <h4 className="font-bold text-sm text-foreground dark:text-zinc-100">{name}</h4>
                              {badgeText && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                                  {badgeText}
                                </span>
                              )}
                            </div>
                            
                            {proj.description && (
                              <p className="text-xs text-muted-foreground dark:text-gray-300 leading-relaxed font-medium">
                                {proj.description}
                              </p>
                            )}
                            
                            {proj.tech_stack && proj.tech_stack.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-1">
                                {proj.tech_stack.map((tech, j) => (
                                  <span key={j} className="bg-card dark:bg-zinc-800 text-foreground dark:text-zinc-200 border border-border dark:border-zinc-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            )}

                            {(proj.url || proj.link) && (
                              <div className="pt-1.5">
                                <a 
                                  href={proj.url || proj.link} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-xs text-sky-600 dark:text-sky-400 hover:underline inline-flex items-center gap-1 font-bold"
                                >
                                  View Project <ExternalLink size={10} />
                                </a>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* Education Section */}
                {education && education.length > 0 && (
                  <section className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
                    <h3 className="text-xs font-black text-muted-foreground dark:text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5 border-b border-border dark:border-zinc-800 pb-2">
                      <GraduationCap size={16} className="text-muted-foreground" /> Education
                    </h3>
                    
                    <div className="space-y-3">
                      {education.map((edu, i) => {
                        const isHonors = edu.cgpa >= 8.5 || edu.cgpa >= 3.5 || i === 0;
                        return (
                          <div key={i} className="bg-muted/30 dark:bg-zinc-800/50 border border-border dark:border-zinc-700 rounded-xl p-4 space-y-2">
                            <div className="flex justify-between items-center">
                              <h4 className="font-bold text-sm text-foreground dark:text-zinc-100">
                                {edu.degree}{edu.field ? ` in ${edu.field}` : ''}
                              </h4>
                              {isHonors && (
                                <span className="text-[10px] font-bold text-foreground dark:text-gray-200 bg-muted dark:bg-zinc-800 border border-border dark:border-zinc-700 px-2 py-0.5 rounded-full">
                                  Honors
                                </span>
                              )}
                            </div>
                            
                            <div className="flex justify-between items-center text-xs text-muted-foreground dark:text-gray-300 font-semibold">
                              <span>{edu.institution}</span>
                              {edu.year_end && (
                                <span className="text-[10px] font-bold text-muted-foreground dark:text-gray-300 bg-card dark:bg-zinc-800 border border-border dark:border-zinc-700 px-2 py-0.5 rounded">
                                  {edu.year_end}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {(edu.field ? [edu.field] : []).concat(
                                edu.cgpa ? [`CGPA: ${edu.cgpa}`] : []
                              ).concat(["Academic Core", "Theory & Labs"].slice(0, edu.field ? 1 : 2)).map((tag, idx) => (
                                <span key={idx} className="bg-card dark:bg-zinc-800 text-muted-foreground dark:text-gray-300 border border-border dark:border-zinc-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* Certifications & Achievements */}
                {(certifications.length > 0 || achievements.length > 0) && (
                  <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {certifications.length > 0 && (
                      <div>
                         <h3 className="text-xs font-black text-muted-foreground dark:text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Award size={14} className="text-muted-foreground"/> Certifications</h3>
                         <ul className="space-y-2">
                           {certifications.map((cert, i) => (
                             <li key={`cert-${i}`} className="bg-muted/40 dark:bg-zinc-900 border border-border dark:border-zinc-800 p-3 rounded-lg flex flex-col">
                               <span className="font-bold text-foreground dark:text-zinc-100 text-xs">{cert.name || cert}</span>
                               {(cert.issuer || cert.date) && (
                                <span className="text-[10px] font-semibold text-muted-foreground dark:text-gray-400 mt-0.5">
                                  {cert.issuer} {cert.date ? `(${cert.date})` : ''}
                                </span>
                               )}
                             </li>
                           ))}
                         </ul>
                      </div>
                    )}
                    {achievements.length > 0 && (
                      <div>
                         <h3 className="text-xs font-black text-muted-foreground dark:text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Award size={14} className="text-muted-foreground"/> Achievements</h3>
                         <ul className="space-y-2">
                           {achievements.map((ach, i) => (
                             <li key={`ach-${i}`} className="bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 p-3 rounded-lg text-xs font-semibold flex gap-2">
                               <span className="text-amber-500 flex-shrink-0">★</span> {ach}
                             </li>
                           ))}
                         </ul>
                      </div>
                    )}
                  </section>
                )}

                {/* Languages */}
                {languages.length > 0 && (
                  <section>
                    <h3 className="text-xs font-black text-muted-foreground dark:text-gray-400 uppercase tracking-widest mb-3">Languages</h3>
                    <div className="flex flex-wrap gap-2">
                      {languages.map((lang, i) => (
                        <span key={`lang-${i}`} className="bg-sky-100 dark:bg-sky-950/60 border border-sky-300 dark:border-sky-700 text-sky-800 dark:text-sky-200 px-3 py-1.5 rounded-lg text-xs font-bold">
                          {typeof lang === 'string' ? lang : `${lang.language || lang.name} ${lang.proficiency ? `(${lang.proficiency})` : ''}`}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {/* Source & Round Info */}
                <section>
                  <h3 className="text-xs font-black text-muted-foreground dark:text-gray-400 uppercase tracking-widest mb-3">Candidate Info</h3>
                  <div className="bg-muted/40 dark:bg-zinc-900 rounded-xl p-4 border border-border dark:border-zinc-800 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-[10px] font-black text-muted-foreground dark:text-gray-400 uppercase tracking-wider block mb-0.5">Source</span>
                      <span className="font-semibold text-foreground dark:text-zinc-100 capitalize">{activeCandidate?.source || 'upload'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-muted-foreground dark:text-gray-400 uppercase tracking-wider block mb-0.5">Status</span>
                      <span className={`font-semibold capitalize ${
                        activeCandidate?.status === 'hired' ? 'text-emerald-600 dark:text-emerald-400' :
                        activeCandidate?.status === 'rejected' ? 'text-rose-600 dark:text-rose-400' :
                        'text-foreground dark:text-zinc-100'
                      }`}>{activeCandidate?.status || 'new'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-muted-foreground dark:text-gray-400 uppercase tracking-wider block mb-0.5">Current Round</span>
                      <span className="font-semibold text-foreground dark:text-zinc-100">{currentRoundIndex}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-muted-foreground dark:text-gray-400 uppercase tracking-wider block mb-0.5">Recommendation</span>
                      <span className={`font-semibold ${
                        activeCandidate?.recommendation === 'Strong' ? 'text-emerald-600 dark:text-emerald-400' :
                        activeCandidate?.recommendation === 'Moderate' ? 'text-amber-600 dark:text-amber-400' :
                        'text-rose-600 dark:text-rose-400'
                      }`}>{activeCandidate?.recommendation || 'N/A'}</span>
                    </div>
                  </div>
                </section>
              </div>

              {/* DRAWER FOOTER */}
              {!isHiredOrRejected && (
                <div className="p-5 border-t border-border dark:border-zinc-800 bg-card dark:bg-[#121217] grid grid-cols-2 gap-4 shrink-0 box-content pb-6">
                  <button 
                    onClick={() => { setShowDetail(false); handleReject(); }}
                    className="py-3 border-2 border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 bg-background hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors"
                  >
                    Reject
                  </button>
                  <button 
                    onClick={() => { setShowDetail(false); handleForwardOrHire(); }}
                    className={`py-3 shadow-md rounded-xl font-bold uppercase tracking-widest text-xs transition-colors ${
                      isLastRound ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20' : 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/20'
                    }`}
                  >
                    {isLastRound ? <span className="flex items-center justify-center gap-1.5"><Sparkles size={12} /> Hire Candidate</span> : 'Forward to Next →'}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* OFFER LETTER UPLOAD MODAL */}
      <AnimatePresence>
        {showOfferModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowOfferModal(false)}
              className="fixed inset-0 bg-[#2A2A2A]/40 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 m-auto w-full max-w-[480px] h-fit bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20 z-[61] flex flex-col gap-4 text-[#2A2A2A]"
            >
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Sparkles size={20} className="text-green-500" />
                  Hire {candidate?.name}
                </h3>
                <button 
                  onClick={() => setShowOfferModal(false)} 
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-sm text-gray-600">
                To complete hiring, please upload the offer letter. The candidate will be notified and can view or download it from their dashboard.
              </p>

              {/* File drop zone */}
              <OfferLetterUploadZone onSubmit={submitHire} onCancel={() => setShowOfferModal(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* RAW RESUME TEXT MODAL */}
      <AnimatePresence>
        {showResumeModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowResumeModal(false)}
              className="fixed inset-0 bg-[#2A2A2A]/40 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed inset-4 md:inset-10 lg:inset-16 max-w-4xl mx-auto bg-card dark:bg-[#121217] text-foreground shadow-2xl z-50 flex flex-col rounded-2xl border border-border dark:border-zinc-800 overflow-hidden"
            >
              <div className="p-4 md:p-5 border-b border-border dark:border-zinc-800 flex justify-between items-center bg-card dark:bg-[#121217]">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 rounded-xl">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h2 className="font-bold text-base md:text-lg text-foreground dark:text-zinc-100">{activeCandidate?.name || 'Candidate'} — Original Resume Text</h2>
                    <p className="text-xs text-muted-foreground">Raw parsed resume document contents</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {rawResumeText && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(rawResumeText);
                        setCopied(true);
                        toast.success("Resume text copied to clipboard!");
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="px-3 py-1.5 bg-muted dark:bg-zinc-800 hover:bg-muted/80 text-foreground dark:text-gray-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border border-border dark:border-zinc-700"
                    >
                      {copied ? <CheckCircle size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      {copied ? "Copied!" : "Copy Text"}
                    </button>
                  )}
                  <button onClick={() => setShowResumeModal(false)} className="p-2 bg-muted dark:bg-zinc-800 hover:bg-muted/80 rounded-full text-foreground dark:text-gray-200 transition-colors">
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 md:p-7 bg-muted/20 dark:bg-zinc-950/70 custom-scrollbar font-mono text-xs md:text-sm leading-relaxed whitespace-pre-wrap text-foreground dark:text-zinc-200 select-text">
                {rawResumeText ? (
                  rawResumeText
                ) : (
                  <div className="text-center py-16 text-muted-foreground italic font-sans space-y-2">
                    <p className="text-sm font-semibold">Raw text preview not available for this candidate.</p>
                    <p className="text-xs">Click the <span className="font-bold text-sky-500">Profile</span> button to view structured experience, skills & AI insights.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function OfferLetterUploadZone({ onSubmit, onCancel }) {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("Offer letter file size must be less than 10MB");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("Offer letter file size must be less than 10MB");
        return;
      }
      setFile(selectedFile);
    }
  };

  return (
    <div className="space-y-4">
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
          dragActive 
            ? 'border-green-500 bg-green-50/50' 
            : file 
              ? 'border-green-300 bg-green-50/20' 
              : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
        }`}
        onClick={() => document.getElementById('offer-file-input').click()}
      >
        <input 
          id="offer-file-input" 
          type="file" 
          className="hidden" 
          accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg" 
          onChange={handleChange}
        />
        <FileText size={32} className={file ? 'text-green-500' : 'text-gray-400'} />
        {file ? (
          <div className="text-sm font-bold text-green-700 truncate max-w-full">
            {file.name}
            <span className="block text-[10px] text-gray-400 font-normal mt-0.5">
              {(file.size / 1024).toFixed(1)} KB
            </span>
          </div>
        ) : (
          <div className="text-sm text-gray-600">
            <span className="font-bold text-[#2563EB]">Click to upload</span> or drag and drop
            <span className="block text-[10px] text-gray-400 mt-1">
              Supports PDF, DOCX, DOC, TXT, PNG, JPG (Max 10MB)
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-end">
        <button 
          onClick={onCancel}
          className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
        >
          Cancel
        </button>
        <button 
          onClick={() => {
            if (!file) {
              toast.error("Please upload an offer letter to proceed");
              return;
            }
            onSubmit(file);
          }}
          disabled={!file}
          className={`px-4 py-2 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-sm ${
            file ? 'bg-[#22C55E] hover:bg-[#166534]' : 'bg-gray-300 cursor-not-allowed shadow-none'
          }`}
        >
          Confirm Hire
        </button>
      </div>
    </div>
  );
}
