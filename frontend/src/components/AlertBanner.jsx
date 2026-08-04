import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useSeekerAuthStore } from '../stores/seekerAuthStore';
import { usePortalAuthStore } from '../stores/portalAuthStore';
import { ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import VerificationModal from './VerificationModal';
import toast from 'react-hot-toast';

export default function AlertBanner() {
  const recruiter = useAuthStore((state) => state.company);
  const seeker = useSeekerAuthStore((state) => state.seeker);
  const developer = usePortalAuthStore((state) => state.developer);
  const navigate = useNavigate();

  const [showBanner, setShowBanner] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState(false);
  const [unverifiedPhone, setUnverifiedPhone] = useState(false);
  const [verifyModal, setVerifyModal] = useState(null);

  useEffect(() => {
    if (developer) {
      setUnverifiedEmail(!developer.is_verified);
      setUnverifiedPhone(false);
      setShowBanner(!developer.is_verified);
    } else if (recruiter) {
      setUnverifiedEmail(!recruiter.email_verified);
      setUnverifiedPhone(false);
      setShowBanner(!recruiter.email_verified);
    } else {
      const localSeeker = (() => {
        try { return JSON.parse(localStorage.getItem('cs_seeker_data') || 'null'); } catch { return null; }
      })();
      const activeSeeker = seeker || localSeeker;
      if (activeSeeker) {
        const emailUnverified = !activeSeeker.email_verified;
        const phoneUnverified = !activeSeeker.phone_verified;
        setUnverifiedEmail(emailUnverified);
        setUnverifiedPhone(phoneUnverified);
        setShowBanner(emailUnverified || phoneUnverified);
      } else {
        setShowBanner(false);
      }
    }
  }, [recruiter, seeker, developer]);

  if (!showBanner && !verifyModal) return null;

  const handleOpenVerification = (type) => {
    let role = 'recruiter';
    let userEmail = '';
    let val = '';

    if (developer) {
      role = 'developer';
      userEmail = developer.email || '';
      val = developer.email || '';
    } else if (recruiter) {
      role = 'recruiter';
      userEmail = recruiter.email || '';
      val = type === 'email' ? (recruiter.email || '') : (recruiter.phone || '');
    } else {
      const localSeeker = (() => {
        try { return JSON.parse(localStorage.getItem('cs_seeker_data') || 'null'); } catch { return null; }
      })();
      const activeSeeker = seeker || localSeeker;
      role = 'seeker';
      userEmail = activeSeeker?.email || '';
      val = type === 'email' ? (activeSeeker?.email || '') : (activeSeeker?.phone || '');
    }

    if (!val) {
      // Fallback navigate if email/phone value is missing
      if (recruiter) navigate('/dashboard/settings');
      else if (seeker) navigate('/jobs/profile');
      else if (developer) navigate('/developer/portal/settings');
      return;
    }

    setVerifyModal({ type, value: val, role, userEmail });
  };

  const handleVerificationSuccess = () => {
    if (!verifyModal) return;
    const { type } = verifyModal;

    if (recruiter) {
      const field = type === 'email' ? 'email_verified' : 'phone_verified';
      useAuthStore.getState().setAuth({
        ...recruiter,
        [field]: true
      });
    } else if (seeker) {
      const field = type === 'email' ? 'email_verified' : 'phone_verified';
      useSeekerAuthStore.getState().updateSeeker({ [field]: true });
    } else if (developer) {
      usePortalAuthStore.getState().setAuth({ is_verified: true });
    }

    toast.success(`${type === 'email' ? 'Email' : 'Phone'} verified successfully!`);
    setVerifyModal(null);
  };

  return (
    <>
      {showBanner && (
        <div className="w-full bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-900/30 py-2.5 px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-amber-800 dark:text-amber-300 backdrop-blur-md z-30 relative transition-all duration-300">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="font-medium text-xs sm:text-sm">
              {unverifiedEmail && unverifiedPhone
                ? 'Your email and phone number are not verified.'
                : unverifiedEmail
                ? 'Your email address is not verified.'
                : 'Your phone number is not verified.'} Please complete verification.
            </span>
          </div>
          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            {unverifiedEmail && (
              <button
                type="button"
                onClick={() => handleOpenVerification('email')}
                className="px-3 py-1 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white transition-all shadow-sm focus:outline-none cursor-pointer"
              >
                Verify Email
              </button>
            )}
            {unverifiedPhone && (
              <button
                type="button"
                onClick={() => handleOpenVerification('phone')}
                className="px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white transition-all shadow-sm focus:outline-none cursor-pointer"
              >
                Verify Phone
              </button>
            )}
          </div>
        </div>
      )}

      {verifyModal && (
        <VerificationModal
          isOpen={true}
          onClose={() => setVerifyModal(null)}
          type={verifyModal.type}
          value={verifyModal.value}
          role={verifyModal.role}
          userEmail={verifyModal.userEmail}
          onSuccess={handleVerificationSuccess}
        />
      )}
    </>
  );
}
