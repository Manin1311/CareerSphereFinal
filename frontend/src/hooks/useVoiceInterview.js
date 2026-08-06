import { useState, useRef, useCallback } from "react";
import { testAPI } from "../lib/api";

export function useVoiceInterview({ token, onTranscriptReady, onLiveTranscript }) {
  const [phase, setPhase] = useState("idle");
  // "idle" | "ai_speaking" | "recording" | "transcribing" | "complete"
  
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const audioStreamRef = useRef(null);
  const silenceIntervalRef = useRef(null);
  const silenceContextRef = useRef(null);

  // Speak text with natural speech settings
  const speakText = useCallback((text, onDone) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setPhase("idle");
      onDone?.();
      return;
    }

    setPhase("ai_speaking");
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92; // Natural, conversational speed
    utterance.pitch = 1.0;
    
    // Attempt to use a natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) => v.name.includes("Google") && v.lang.startsWith("en")
    ) || voices.find(
      (v) => v.lang.startsWith("en")
    ) || voices[0];
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => {
      setPhase("idle");
      onDone?.();
    };

    utterance.onerror = () => {
      setPhase("idle");
      onDone?.();
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  // Speech recognition ref for live speech-to-text
  const recognitionRef = useRef(null);
  const liveTranscriptRef = useRef("");

  // Start recording microphone
  const startRecording = useCallback(async () => {
    try {
      liveTranscriptRef.current = "";
      onLiveTranscript?.("");
      
      // High sensitivity audio constraints with noise suppression & gain control
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 48000
        }
      });
      audioStreamRef.current = stream;
      
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      // Live Web Speech Recognition for real-time ON-SCREEN text preview
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const rec = new SpeechRecognition();
          rec.continuous = true;
          rec.interimResults = true;
          rec.lang = "en-US";
          rec.onresult = (event) => {
            let accumulated = "";
            for (let i = 0; i < event.results.length; ++i) {
              accumulated += event.results[i][0].transcript + " ";
            }
            const cleanText = accumulated.trim();
            if (cleanText) {
              liveTranscriptRef.current = cleanText;
              onLiveTranscript?.(cleanText); // Only updates live UI preview, DOES NOT submit answer!
            }
          };
          rec.onerror = (e) => console.warn("Live WebSpeech warning:", e.error);
          rec.start();
          recognitionRef.current = rec;
        } catch (recErr) {
          console.warn("SpeechRecognition init skipped:", recErr);
        }
      }

      recorder.onstop = async () => {
        // Stop SpeechRecognition if active
        if (recognitionRef.current) {
          try { recognitionRef.current.stop(); } catch (_) {}
          recognitionRef.current = null;
        }

        // Clear silence detection timers
        if (silenceIntervalRef.current) {
          clearInterval(silenceIntervalRef.current);
          silenceIntervalRef.current = null;
        }
        if (silenceContextRef.current) {
          silenceContextRef.current.close().catch(() => {});
          silenceContextRef.current = null;
        }

        setPhase("transcribing");
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        
        let finalAnswerText = "";
        try {
          const res = await testAPI.transcribeAudio(blob);
          if (res && res.text && res.text.trim().length > 1) {
            finalAnswerText = res.text.trim();
          } else if (liveTranscriptRef.current && liveTranscriptRef.current.trim().length > 1) {
            finalAnswerText = liveTranscriptRef.current.trim();
          }
        } catch (err) {
          console.error("Audio transcription fallback to live text", err);
          if (liveTranscriptRef.current) {
            finalAnswerText = liveTranscriptRef.current.trim();
          }
        } finally {
          setPhase("idle");
          // Signal answer completion ONLY NOW when recording has officially stopped!
          onTranscriptReady?.(finalAnswerText);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start(500); // chunk every 500ms
      setPhase("recording");

      // Setup Voice Activity Detection (VAD)
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioCtx();
        silenceContextRef.current = audioCtx;
        
        const analyser = audioCtx.createAnalyser();
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 256;
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        let silenceStart = null;
        let hasSpoken = false;

        silenceIntervalRef.current = setInterval(() => {
          if (recorder.state !== "recording") return;
          analyser.getByteFrequencyData(dataArray);
          
          const sum = dataArray.reduce((a, b) => a + b, 0);
          const avg = sum / bufferLength;

          // Detect voice activity (lowered threshold to 2 for sensitive mics)
          if (avg > 2 || (liveTranscriptRef.current && liveTranscriptRef.current.length > 5)) {
            hasSpoken = true;
          }

          if (hasSpoken) {
            // Allow 8 seconds of continuous silence AFTER candidate has finished speaking
            if (avg < 2) {
              if (silenceStart === null) {
                silenceStart = Date.now();
              } else if (Date.now() - silenceStart > 8000) {
                console.log("Auto-stopping recording after 8s post-speech silence.");
                if (recorder.state === "recording") {
                  recorder.stop();
                }
                stream.getTracks().forEach((track) => track.stop());
              }
            } else {
              silenceStart = null;
            }
          }
        }, 150);

      } catch (vadErr) {
        console.warn("VAD setup skipped/failed:", vadErr);
      }

    } catch (err) {
      console.error("Failed to start voice capture", err);
      alert("Microphone permission denied or not found. Please enable microphone permissions in your browser.");
      setPhase("idle");
    }
  }, [onTranscriptReady, onLiveTranscript]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
      recognitionRef.current = null;
    }
    if (silenceIntervalRef.current) {
      clearInterval(silenceIntervalRef.current);
      silenceIntervalRef.current = null;
    }
    if (silenceContextRef.current) {
      silenceContextRef.current.close().catch(() => {});
      silenceContextRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      setPhase("transcribing");
    }
  }, []);

  return {
    phase,
    startRecording,
    stopRecording,
    speakText,
    isAiSpeaking: phase === "ai_speaking",
    isRecording: phase === "recording",
    isTranscribing: phase === "transcribing"
  };
}
