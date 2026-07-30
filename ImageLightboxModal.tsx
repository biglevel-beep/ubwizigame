import React, { useState } from 'react';
import { X, Heart, Download, User, Calendar, Maximize2, MessageSquare, Share2, Repeat, Send, Check } from 'lucide-react';
import { Language, PostComment } from '../types';

interface ImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId?: string;
  imageUrl: string;
  authorName?: string;
  authorAvatarUrl?: string;
  caption?: string;
  createdAt?: string;
  likesCount?: number;
  comments?: PostComment[];
  sharesCount?: number;
  isRepost?: boolean;
  originalAuthorName?: string;
  language?: Language;
  onLike?: () => void;
  onComment?: (commentText: string) => void;
  onShare?: () => void;
  onRepost?: () => void;
  hasLiked?: boolean;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  authorName,
  authorAvatarUrl,
  caption,
  createdAt,
  likesCount = 0,
  comments = [],
  sharesCount = 0,
  isRepost = false,
  originalAuthorName,
  language = 'rw',
  onLike,
  onComment,
  onShare,
  onRepost,
  hasLiked = false,
}) => {
  const [commentInput, setCommentInput] = useState('');
  const [showNotification, setShowNotification] = useState<string | null>(null);

  if (!isOpen || !imageUrl) return null;

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !onComment) return;
    onComment(commentInput.trim());
    setCommentInput('');
  };

  const handleCopyShare = () => {
    if (onShare) onShare();
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(window.location.href).catch(() => {});
      }
    } catch (e) {
      // Ignore clipboard permission errors in restricted iframe
    }
    setShowNotification(language === 'rw' ? 'Irakoze! Link y’ifoto yakopyowe.' : 'Photo link copied to clipboard!');
    setTimeout(() => setShowNotification(null), 2500);
  };

  const handleTriggerRepost = () => {
    if (onRepost) onRepost();
    setShowNotification(language === 'rw' ? 'Ifoto yakozweho Repost kuri Feed yawe!' : 'Photo reposted to your profile feed!');
    setTimeout(() => setShowNotification(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-6 bg-slate-950/90 backdrop-blur-md animate-fadeIn transition-all">
      {/* Background click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Lightbox Container */}
      <div className="relative z-10 max-w-5xl w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col lg:flex-row max-h-[92vh]">
        
        {/* Top Notification Toast */}
        {showNotification && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-emerald-600 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-xl border border-emerald-400 flex items-center gap-2 animate-bounce">
            <Check className="w-4 h-4" />
            <span>{showNotification}</span>
          </div>
        )}

        {/* Top Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-slate-800/90 text-slate-300 hover:text-white hover:bg-slate-700 transition-all border border-slate-700"
          title="Funga (Close)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* High Resolution Image Canvas */}
        <div className="flex-1 bg-slate-950 flex items-center justify-center p-2 sm:p-4 overflow-hidden min-h-[300px] lg:min-h-[500px]">
          <img
            src={imageUrl}
            alt={caption || 'High Resolution Photo'}
            className="max-w-full max-h-[75vh] lg:max-h-[85vh] object-contain rounded-xl shadow-2xl transition-transform duration-300 hover:scale-[1.01]"
            style={{ imageRendering: 'high-quality' }}
          />
        </div>

        {/* Info & Comments Sidebar */}
        <div className="w-full lg:w-96 p-5 sm:p-6 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col justify-between space-y-4 shrink-0 overflow-y-auto">
          <div className="space-y-4">
            
            {/* Repost Header if applicable */}
            {isRepost && originalAuthorName && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                <Repeat className="w-3 h-3 text-emerald-400" />
                <span>{language === 'rw' ? `Yakozweho Repost kurikora ${originalAuthorName}` : `Reposted from ${originalAuthorName}`}</span>
              </div>
            )}

            {/* Header Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[10px] font-black uppercase tracking-wider">
              <Maximize2 className="w-3 h-3 text-amber-400" />
              <span>{language === 'rw' ? 'Ifoto Ntulirwa (HD Quality)' : 'Full HD Image'}</span>
            </div>

            {/* Author Info */}
            {authorName && (
              <div className="flex items-center gap-3 p-3 bg-slate-800/60 rounded-2xl border border-slate-800">
                {authorAvatarUrl ? (
                  <img
                    src={authorAvatarUrl}
                    alt={authorName}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-blue-700 text-white font-black flex items-center justify-center text-sm">
                    {authorName.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="text-xs font-black text-white">{authorName}</div>
                  {createdAt && (
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>{createdAt}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Caption Text */}
            {caption && (
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  {language === 'rw' ? 'Ibisobanuro' : 'Caption'}
                </span>
                <p className="text-xs text-slate-200 font-medium leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                  {caption}
                </p>
              </div>
            )}

            {/* Comments Stream */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                  <span>{language === 'rw' ? `Ibitekerezo (${comments.length})` : `Comments (${comments.length})`}</span>
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {comments.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic p-2 text-center">
                    {language === 'rw' ? 'Nta gitekerezo kirajyaho. Ba uwa mbere!' : 'No comments yet. Be the first to comment!'}
                  </p>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-blue-300">{c.authorName}</span>
                        <span className="text-[9px] text-slate-400 font-mono">{c.createdAt}</span>
                      </div>
                      <p className="text-xs text-slate-200">{c.content}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Input */}
              {onComment && (
                <form onSubmit={handleSendComment} className="flex items-center gap-1.5 pt-2">
                  <input
                    type="text"
                    placeholder={language === 'rw' ? 'Andika igitekerezo...' : 'Add a comment...'}
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!commentInput.trim()}
                    className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 transition-all shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>

          </div>

          {/* Social Buttons Footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
            {onLike && (
              <button
                onClick={onLike}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all ${
                  hasLiked
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                <Heart className={`w-4 h-4 ${hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{likesCount}</span>
              </button>
            )}

            {/* Repost Button */}
            {onRepost && (
              <button
                onClick={handleTriggerRepost}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs font-extrabold transition-all"
                title={language === 'rw' ? 'Gukora Repost kuri Feed yawe' : 'Repost to your feed'}
              >
                <Repeat className="w-4 h-4" />
                <span>Repost</span>
              </button>
            )}

            {/* Share Button */}
            <button
              onClick={handleCopyShare}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 text-xs font-extrabold transition-all"
              title={language === 'rw' ? 'Sangiza abandi' : 'Share photo'}
            >
              <Share2 className="w-4 h-4" />
              <span>{sharesCount > 0 ? sharesCount : ''}</span>
            </button>

            {/* HD Download Button */}
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              download="photo.jpg"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold shadow-lg shadow-blue-600/20 transition-all ml-auto"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'rw' ? 'Kura (HD)' : 'Download'}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
