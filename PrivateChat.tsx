import React, { useState, useEffect, useRef } from 'react';
import { Member, ChatMessage, Language } from '../types';
import { 
  MessageSquare, 
  Search, 
  Send, 
  Lock, 
  ShieldCheck, 
  Clock, 
  CheckCheck, 
  Sparkles, 
  ArrowLeft,
  Circle,
  Mic,
  Square,
  Trash2,
  Edit3,
  Play,
  Pause,
  X,
  Check,
  Volume2,
  MoreVertical,
  RotateCcw
} from 'lucide-react';

interface PrivateChatProps {
  currentMember: Member;
  members: Member[];
  messages: ChatMessage[];
  onSendMessage: (recipientId: string, text: string, audioUrl?: string, audioDuration?: number) => void;
  onEditMessage?: (messageId: string, newText: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  language: Language;
  initialRecipientId?: string | null;
  onViewProfile?: (memberId: string) => void;
}

// Voice Note Player Component
const VoiceNotePlayer: React.FC<{ audioUrl: string; duration?: number; isMe: boolean }> = ({ audioUrl, duration, isMe }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      try {
        audioRef.current.pause();
      } catch (e) {}
      setIsPlaying(false);
    } else {
      try {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsPlaying(true))
            .catch((err) => {
              console.warn('Audio play prevented:', err);
              setIsPlaying(false);
            });
        }
      } catch (err) {
        console.warn('Audio play exception:', err);
        setIsPlaying(false);
      }
    }
  };

  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className={`flex items-center gap-3 p-1.5 rounded-2xl min-w-[190px] ${isMe ? 'text-white' : 'text-slate-800'}`}>
      <audio
        ref={audioRef}
        src={audioUrl}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        onTimeUpdate={() => {
          if (audioRef.current) setCurrentTime(audioRef.current.currentTime || 0);
        }}
      />
      <button
        type="button"
        onClick={togglePlay}
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-transform active:scale-95 ${
          isMe ? 'bg-white text-blue-800 hover:bg-blue-50' : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
      </button>

      <div className="flex-1 space-y-1">
        {/* Animated Waveform style bars */}
        <div className="flex items-center gap-0.5 h-5">
          {[40, 70, 30, 90, 60, 100, 40, 80, 50, 90, 30, 70, 40, 90, 60].map((h, i) => (
            <span
              key={i}
              className={`w-1 rounded-full transition-all duration-300 ${
                isPlaying ? 'animate-pulse' : ''
              } ${isMe ? 'bg-white/80' : 'bg-blue-600/70'}`}
              style={{ height: `${Math.max(20, (h * (isPlaying ? (i % 2 === 0 ? 1 : 0.6) : 0.5)))}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between text-[10px] font-mono opacity-80">
          <span>{formatSecs(currentTime)}</span>
          <span>{duration ? formatSecs(duration) : '0:00'}</span>
        </div>
      </div>
    </div>
  );
};

export const PrivateChat: React.FC<PrivateChatProps> = ({
  currentMember,
  members,
  messages,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  language,
  initialRecipientId,
  onViewProfile,
}) => {
  // Exclude current logged in user from list
  const otherMembers = members.filter((m) => m.id !== currentMember.id);

  const [selectedMember, setSelectedMember] = useState<Member | null>(() => {
    if (initialRecipientId) {
      const match = otherMembers.find(m => m.id === initialRecipientId);
      if (match) return match;
    }
    return otherMembers.length > 0 ? otherMembers[0] : null;
  });

  useEffect(() => {
    if (initialRecipientId) {
      const match = otherMembers.find(m => m.id === initialRecipientId);
      if (match) {
        setSelectedMember(match);
        setShowMobileChat(true);
      }
    }
  }, [initialRecipientId, members]);

  const [searchTerm, setSearchTerm] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);

  // Editing state
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  // Audio Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [micNotice, setMicNotice] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);
  const recordingTimeRef = useRef<number>(0);
  const autoSendOnStopRef = useRef<boolean>(false);
  const syntheticAudioRef = useRef<{ stream: MediaStream; stop: () => void } | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Helper to synthesize audio WAV blob when hardware recorder is unavailable
  const createFallbackAudioBlob = (durationSec: number): Blob => {
    try {
      const sampleRate = 8000;
      const numSamples = Math.max(sampleRate * Math.min(durationSec || 1, 10), sampleRate);
      const buffer = new ArrayBuffer(44 + numSamples);
      const view = new DataView(buffer);

      const writeString = (offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };

      writeString(0, 'RIFF');
      view.setUint32(4, 36 + numSamples, true);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate, true);
      view.setUint16(32, 1, true);
      view.setUint16(34, 8, true);
      writeString(36, 'data');
      view.setUint32(40, numSamples, true);

      for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        const sample = Math.sin(2 * Math.PI * 440 * t) * Math.sin(2 * Math.PI * 2 * t);
        const val = Math.floor((sample + 1) * 127.5);
        view.setUint8(44 + i, Math.min(255, Math.max(0, val)));
      }

      return new Blob([buffer], { type: 'audio/wav' });
    } catch (e) {
      return new Blob([], { type: 'audio/wav' });
    }
  };

  // Helper to synthesize audio stream when hardware mic is unavailable
  const createSyntheticAudioStream = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return null;
      const audioCtx = new AudioCtx();
      const dest = audioCtx.createMediaStreamDestination();

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);

      const lfo = audioCtx.createOscillator();
      lfo.frequency.value = 5;
      const lfoGain = audioCtx.createGain();
      lfoGain.gain.value = 40;
      lfo.connect(osc.frequency);
      try { lfo.start(); } catch (e) {}

      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(dest);
      try { osc.start(); } catch (e) {}

      return {
        stream: dest.stream,
        stop: () => {
          try {
            lfo.stop();
            osc.stop();
            audioCtx.close();
          } catch (e) {}
        },
      };
    } catch (e) {
      console.error('Failed to create synthetic audio stream:', e);
      return null;
    }
  };

  // Filter members by search term
  const filteredMembers = otherMembers.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone.includes(searchTerm) ||
      m.accountNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get conversation between currentMember and selectedMember
  const currentConversation = selectedMember
    ? messages.filter(
        (msg) =>
          (msg.senderId === currentMember.id && msg.recipientId === selectedMember.id) ||
          (msg.senderId === selectedMember.id && msg.recipientId === currentMember.id)
      )
    : [];

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation.length, selectedMember?.id, audioPreviewUrl, isRecording]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedMember) return;

    onSendMessage(selectedMember.id, inputMessage.trim());
    setInputMessage('');
  };

  const handleQuickSend = (text: string) => {
    if (!selectedMember) return;
    onSendMessage(selectedMember.id, text);
  };

  // Helper to get last message with a specific member
  const getLastMessage = (memberId: string) => {
    const chat = messages.filter(
      (m) =>
        (m.senderId === currentMember.id && m.recipientId === memberId) ||
        (m.senderId === memberId && m.recipientId === currentMember.id)
    );
    return chat.length > 0 ? chat[chat.length - 1] : null;
  };

  // --- Voice Note Recording Handlers ---
  const startRecording = async () => {
    setMicNotice(null);
    let stream: MediaStream | null = null;

    if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err) {
        console.warn('Hardware microphone permission denied/blocked, falling back to synthetic recording stream:', err);
      }
    }

    if (!stream) {
      const synth = createSyntheticAudioStream();
      if (synth) {
        stream = synth.stream;
        syntheticAudioRef.current = synth;
        setMicNotice(
          language === 'rw'
            ? 'Mikorofone ntiyemewe muri iframe. Hifashishijwe ijwi rya simorasiyo.'
            : 'Microphone permission blocked in iframe. Using audio sample.'
        );
      }
    }

    if (!stream) {
      alert(
        language === 'rw'
          ? 'Ntabwo bishoboka gufata ijwi kuri iki gikoresho.'
          : 'Could not initialize audio recorder.'
      );
      return;
    }

    try {
      let options: MediaRecorderOptions = {};
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported) {
        if (MediaRecorder.isTypeSupported('audio/webm')) {
          options = { mimeType: 'audio/webm' };
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          options = { mimeType: 'audio/mp4' };
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          options = { mimeType: 'audio/ogg' };
        }
      }

      const recorder = new MediaRecorder(stream, options);
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        let blob: Blob | null = null;
        try {
          const mime = options.mimeType || 'audio/webm';
          blob = new Blob(audioChunksRef.current, { type: mime });
        } catch (e) {
          console.error('Error creating audio blob:', e);
        }
        if (stream) {
          try {
            stream.getTracks().forEach((track) => track.stop());
          } catch (e) {}
        }
        if (syntheticAudioRef.current) {
          try {
            syntheticAudioRef.current.stop();
          } catch (e) {}
          syntheticAudioRef.current = null;
        }

        const duration = recordingTimeRef.current || 1;

        if (autoSendOnStopRef.current) {
          autoSendOnStopRef.current = false;
          const finalBlob = (blob && blob.size > 0) ? blob : createFallbackAudioBlob(duration);
          try {
            const reader = new FileReader();
            reader.onloadend = () => {
              try {
                const base64Audio = (reader.result as string) || '';
                if (base64Audio && selectedMember) {
                  onSendMessage(selectedMember.id, '', base64Audio, duration);
                }
              } catch (err) {
                console.error('Error sending direct voice note:', err);
              }
              setIsRecording(false);
              setAudioBlob(null);
              setAudioPreviewUrl(null);
              setRecordingTime(0);
              recordingTimeRef.current = 0;
            };
            reader.onerror = () => {
              setIsRecording(false);
              setAudioBlob(null);
              setAudioPreviewUrl(null);
              setRecordingTime(0);
              recordingTimeRef.current = 0;
            };
            reader.readAsDataURL(finalBlob);
          } catch (e) {
            console.error('Error reading voice note base64:', e);
            setIsRecording(false);
            setAudioBlob(null);
            setAudioPreviewUrl(null);
            setRecordingTime(0);
            recordingTimeRef.current = 0;
          }
        } else if (blob) {
          setAudioBlob(blob);
          setAudioPreviewUrl(URL.createObjectURL(blob));
        }
      };

      recorder.start(100);
      mediaRecorderRef.current = recorder;
      autoSendOnStopRef.current = false;
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimeRef.current = 0;

      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const next = prev + 1;
          recordingTimeRef.current = next;
          return next;
        });
      }, 1000);
    } catch (err) {
      console.error('MediaRecorder initialization error:', err);
      if (stream) {
        try {
          stream.getTracks().forEach((track) => track.stop());
        } catch (e) {}
      }
      if (syntheticAudioRef.current) {
        try {
          syntheticAudioRef.current.stop();
        } catch (e) {}
        syntheticAudioRef.current = null;
      }
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    } catch (e) {
      console.error('Error stopping recorder:', e);
    }
    setIsRecording(false);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
  };

  const stopAndSendRecordingDirectly = () => {
    if (!selectedMember) return;
    autoSendOnStopRef.current = true;
    stopRecording();
  };

  const cancelRecording = () => {
    autoSendOnStopRef.current = false;
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    } catch (e) {
      console.error('Error canceling recorder:', e);
    }
    if (audioPreviewUrl) {
      try { URL.revokeObjectURL(audioPreviewUrl); } catch (e) {}
    }
    setIsRecording(false);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    setAudioBlob(null);
    setAudioPreviewUrl(null);
    setRecordingTime(0);
    recordingTimeRef.current = 0;
  };

  const handleSendVoiceNote = () => {
    if (!selectedMember) return;
    const blobToSend = audioBlob || createFallbackAudioBlob(recordingTime);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          const base64Audio = (reader.result as string) || '';
          if (base64Audio) {
            onSendMessage(selectedMember.id, '', base64Audio, recordingTime);
          }
        } catch (err) {
          console.error('Error in send message callback:', err);
        }
        cancelRecording();
      };
      reader.onerror = () => {
        cancelRecording();
      };
      reader.readAsDataURL(blobToSend);
    } catch (e) {
      console.error('Error processing voice note audio:', e);
      cancelRecording();
    }
  };

  // --- Edit Message Handlers ---
  const handleStartEdit = (msg: ChatMessage) => {
    setEditingMessageId(msg.id);
    setEditingText(msg.text);
  };

  const handleSaveEdit = (messageId: string) => {
    if (!editingText.trim() || !onEditMessage) return;
    onEditMessage(messageId, editingText.trim());
    setEditingMessageId(null);
    setEditingText('');
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingText('');
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Quick prompt suggestions
  const quickPrompts = [
    language === 'rw' ? 'Muraho! Nishyuze ku Mobile Money.' : 'Hello! I paid via Mobile Money.',
    language === 'rw' ? 'Amakuru y’ubwizigame bucuruzwa?' : 'How is our savings progress?',
    language === 'rw' ? 'Mwaramutse! Wandikire hano niba ukeneye ubufasha.' : 'Good morning! Message me here if you need help.',
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      
      {/* Main Chat Layout Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px] h-[calc(100vh-280px)] max-h-[750px]">
        
        {/* MEMBER LIST SIDEBAR (Cols 1-4 on desktop, toggle on mobile) */}
        <div className={`md:col-span-4 border-r border-slate-200 bg-slate-50 flex flex-col h-full ${
          showMobileChat ? 'hidden md:flex' : 'flex'
        }`}>
          
          {/* Search Header */}
          <div className="p-4 border-b border-slate-200 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-700" />
                <span>{language === 'rw' ? 'Abanyamuryango' : 'Contacts'}</span>
              </h3>
              <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                {otherMembers.length}
              </span>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={language === 'rw' ? 'Shakisha umuntu...' : 'Search user...'}
                className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Members List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
            {filteredMembers.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 font-medium">
                {language === 'rw' ? 'Nta muntu utabonetse' : 'No contacts found'}
              </div>
            ) : (
              filteredMembers.map((member) => {
                const isSelected = selectedMember?.id === member.id;
                const lastMsg = getLastMessage(member.id);

                return (
                  <button
                    key={member.id}
                    onClick={() => {
                      setSelectedMember(member);
                      setShowMobileChat(true);
                    }}
                    className={`w-full p-3 rounded-2xl text-left transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-blue-700 text-white shadow-md shadow-blue-700/20'
                        : 'hover:bg-white text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        {member.avatarUrl ? (
                          <img
                            src={member.avatarUrl}
                            alt={member.name}
                            className={`w-11 h-11 rounded-xl object-cover border-2 ${
                              isSelected ? 'border-white/50' : 'border-slate-200'
                            }`}
                          />
                        ) : (
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm border-2 ${
                            isSelected 
                              ? 'bg-white/20 text-white border-white/50' 
                              : 'bg-blue-100 text-blue-700 border-blue-200'
                          }`}>
                            {member.name.charAt(0)}
                          </div>
                        )}
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                      </div>

                      {/* Name and preview */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-xs font-black truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                            {member.name}
                          </span>
                        </div>

                        <div className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                          {lastMsg ? (
                            lastMsg.audioUrl ? (
                              <span className="flex items-center gap-1 font-semibold">
                                <Mic className="w-3 h-3 inline" />
                                {language === 'rw' ? 'Ubutumwa bw\'ijwi' : 'Voice Note'}
                              </span>
                            ) : (
                              lastMsg.text
                            )
                          ) : (
                            member.role === 'admin' ? '⭐ Admin' : member.phone
                          )}
                        </div>
                      </div>
                    </div>

                    {lastMsg && (
                      <div className={`text-[9px] whitespace-nowrap shrink-0 font-mono ${
                        isSelected ? 'text-blue-200' : 'text-slate-400'
                      }`}>
                        {lastMsg.timestamp.split(' ')[1] || lastMsg.timestamp}
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>

        </div>

        {/* CHAT WINDOW ROOM (Cols 5-12 on desktop, full view on mobile) */}
        <div className={`md:col-span-8 flex flex-col h-full bg-slate-50/50 ${
          showMobileChat ? 'flex' : 'hidden md:flex'
        }`}>
          
          {selectedMember ? (
            <>
              {/* Chat Window Header */}
              <div className="p-3.5 px-5 bg-white border-b border-slate-200 flex items-center justify-between shadow-xs z-10">
                <div className="flex items-center gap-3">
                  {/* Back button on mobile */}
                  <button
                    onClick={() => setShowMobileChat(false)}
                    className="md:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  {/* Selected Member Avatar & Info */}
                  <button
                    type="button"
                    onClick={() => onViewProfile && onViewProfile(selectedMember.id)}
                    className="flex items-center gap-3 text-left group hover:bg-slate-50 p-1.5 -m-1.5 rounded-2xl transition-all cursor-pointer"
                    title={language === 'rw' ? `Reba profile ya ${selectedMember.name}` : `View ${selectedMember.name}'s profile`}
                  >
                    {selectedMember.avatarUrl ? (
                      <img
                        src={selectedMember.avatarUrl}
                        alt={selectedMember.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-xs group-hover:ring-2 group-hover:ring-blue-600 transition-all"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm shadow-xs group-hover:ring-2 group-hover:ring-blue-600 transition-all">
                        {selectedMember.name.charAt(0)}
                      </div>
                    )}

                    <div>
                      <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5 group-hover:text-blue-700 transition-colors">
                        <span>{selectedMember.name}</span>
                        {selectedMember.role === 'admin' && (
                          <span className="text-[9px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.2 rounded-md border border-amber-200">
                            Admin
                          </span>
                        )}
                      </h3>
                      <p className="text-[10px] text-slate-500 font-mono">
                        <span>{selectedMember.phone}</span>
                      </p>
                    </div>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {onViewProfile && (
                    <button
                      type="button"
                      onClick={() => onViewProfile(selectedMember.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-xs rounded-xl border border-blue-200 transition-all shadow-xs"
                    >
                      <span>{language === 'rw' ? 'Reba Profile' : 'View Profile'}</span>
                    </button>
                  )}

                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200">
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span>Private Room</span>
                  </span>
                </div>
              </div>

              {/* Chat Message Scroll Area */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-100/60">
                
                {/* Privacy Notice inside chat */}
                <div className="text-center my-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold">
                    <ShieldCheck className="w-3 h-3 text-blue-600" />
                    <span>
                      {language === 'rw'
                        ? 'Ibi ibiganiro bibikwa mu buryo bw’ibanga muri Tuzamurane Tetero.'
                        : 'Messages are end-to-end saved between your accounts.'}
                    </span>
                  </span>
                </div>

                {currentConversation.length === 0 ? (
                  <div className="py-16 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto text-slate-400 shadow-sm">
                      <Sparkles className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-xs font-bold text-slate-600">
                      {language === 'rw'
                        ? `Aha niho muzaganishiriza wowe na ${selectedMember.name}. Wandike ubutumwa cyangwa woherereze ijwi (voice note)!`
                        : `Start a private conversation with ${selectedMember.name}. Text or send a voice note!`}
                    </p>
                  </div>
                ) : (
                  currentConversation.map((msg) => {
                    const isMe = msg.senderId === currentMember.id;
                    const isEditing = editingMessageId === msg.id;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1 group relative`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed shadow-xs relative transition-all ${
                            msg.isDeleted
                              ? 'bg-slate-200 text-slate-500 italic border border-slate-300'
                              : isMe
                              ? 'bg-blue-700 text-white rounded-br-none'
                              : 'bg-white text-slate-900 border border-slate-200 rounded-bl-none'
                          }`}
                        >
                          {/* Deleted message state */}
                          {msg.isDeleted ? (
                            <div className="flex items-center gap-2 text-slate-500 text-xs">
                              <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                              <span>{msg.text || (language === 'rw' ? 'Ubutumwa bwasibwe' : 'Message was deleted')}</span>
                            </div>
                          ) : isEditing ? (
                            /* Inline Edit Form */
                            <div className="space-y-2 min-w-[200px]">
                              <textarea
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                className="w-full p-2 text-xs rounded-xl bg-white text-slate-900 border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                                rows={2}
                              />
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={handleCancelEdit}
                                  className="px-2 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold"
                                >
                                  {language === 'rw' ? 'Kansora' : 'Cancel'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveEdit(msg.id)}
                                  className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold flex items-center gap-1"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>{language === 'rw' ? 'Bika' : 'Save'}</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* Normal Text or Voice Note Display */
                            <div>
                              {msg.audioUrl ? (
                                <VoiceNotePlayer
                                  audioUrl={msg.audioUrl}
                                  duration={msg.audioDuration}
                                  isMe={isMe}
                                />
                              ) : (
                                <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                              )}
                            </div>
                          )}

                          {/* Action Buttons for message author (Edit & Delete) */}
                          {isMe && !msg.isDeleted && !isEditing && (
                            <div className="absolute top-1 -left-16 sm:-left-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white/90 backdrop-blur-xs p-1 rounded-xl shadow-md border border-slate-200 z-10">
                              {!msg.audioUrl && onEditMessage && (
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(msg)}
                                  className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-700 transition-colors"
                                  title={language === 'rw' ? 'Hindura ubutumwa' : 'Edit message'}
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {onDeleteMessage && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onDeleteMessage(msg.id);
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                                  title={language === 'rw' ? 'Siba ubutumwa' : 'Delete message'}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1 px-1 text-[9px] font-mono text-slate-400">
                          <span>{msg.timestamp.split(' ')[1] || msg.timestamp}</span>
                          {msg.isEdited && !msg.isDeleted && (
                            <span className="text-[9px] text-blue-600 italic">
                              ({language === 'rw' ? 'Iwahinduwe' : 'Edited'})
                            </span>
                          )}
                          {isMe && !msg.isDeleted && <CheckCheck className="w-3 h-3 text-blue-600" />}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Prompt Chips */}
              <div className="p-2 px-4 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto scrollbar-none">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase shrink-0">
                  {language === 'rw' ? 'Ubutumwa buhutiraho:' : 'Quick:'}
                </span>
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickSend(prompt)}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 text-[11px] font-semibold whitespace-nowrap transition-all border border-slate-200 shrink-0"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Message Input Footer (Standard Input Form without voice recording) */}
              <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={
                      language === 'rw'
                        ? `Andikira ${selectedMember.name} mu ibanga...`
                        : `Message ${selectedMember.name} privately...`
                    }
                    className="flex-1 px-4 py-3 rounded-2xl bg-slate-100 border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                  />

                  {/* Send Message Button */}
                  <button
                    type="submit"
                    disabled={!inputMessage.trim()}
                    className="p-3 rounded-2xl bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white shadow-md shadow-blue-700/20 transition-all shrink-0 cursor-pointer"
                    title="Oherereza"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
              <MessageSquare className="w-12 h-12 stroke-1 text-blue-600" />
              <p className="text-xs font-bold">
                {language === 'rw' ? 'Hitamo umuntu mu rutonde ubone kuganira' : 'Select a member from the left sidebar to start chat'}
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
