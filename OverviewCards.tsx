import React, { useState } from 'react';
import { SavingsGoal, Transaction, Language, Currency, Member, UserPost, SavingsChallengeDay } from '../types';
import { getTranslation } from '../data/translations';
import { formatCurrency } from '../utils/formatters';
import { ImageLightboxModal } from './ImageLightboxModal';
import { 
  PiggyBank, 
  Wallet, 
  Target, 
  PlusCircle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle2, 
  History, 
  Sparkles, 
  Clock, 
  ArrowRight,
  TrendingUp,
  Coins,
  Megaphone,
  Heart,
  MessageSquare,
  Search,
  User,
  Maximize2,
  ZoomIn,
  Repeat,
  Share2,
  Send,
  Check,
  MoreVertical,
  Edit3,
  Trash2,
  X,
  Image as ImageIcon
} from 'lucide-react';

interface OverviewCardsProps {
  currentMember: Member;
  members?: Member[];
  goals: SavingsGoal[];
  transactions: Transaction[];
  challengeDays: SavingsChallengeDay[];
  posts?: UserPost[];
  onEditPost?: (postId: string, newContent: string, newCategory?: 'announcement' | 'update' | 'achievement' | 'general', newImageUrl?: string) => void;
  onDeletePost?: (postId: string) => void;
  onLikePost?: (postId: string) => void;
  onCommentPost?: (postId: string, commentText: string) => void;
  onSharePost?: (postId: string) => void;
  onRepostPost?: (postId: string) => void;
  language: Language;
  currency: Currency;
  onOpenAddGoal: () => void;
  onOpenDeposit: (goalId?: string) => void;
  setActiveTab: (tab: string) => void;
  onViewProfile?: (memberId: string) => void;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({
  currentMember,
  members = [],
  goals,
  transactions,
  challengeDays,
  posts = [],
  onEditPost,
  onDeletePost,
  onLikePost,
  onCommentPost,
  onSharePost,
  onRepostPost,
  language,
  currency,
  onOpenAddGoal,
  onOpenDeposit,
  setActiveTab,
  onViewProfile,
}) => {

  const t = getTranslation(language);
  const [searchQuery, setSearchQuery] = useState('');
  const [lightboxPost, setLightboxPost] = useState<UserPost | null>(null);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentInputMap, setCommentInputMap] = useState<Record<string, string>>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // 3-Dots Menu & Edit/Delete Post States
  const [activePostMenuId, setActivePostMenuId] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<UserPost | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState<'announcement' | 'update' | 'achievement' | 'general'>('update');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  const handleEditFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setEditImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEditPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost || !onEditPost || !editContent.trim()) return;

    onEditPost(editingPost.id, editContent.trim(), editCategory, editImageUrl || undefined);
    setEditingPost(null);
    setToastMsg(language === 'rw' ? 'Ibyahinduwe byabitswe neza!' : 'Post updated successfully!');
    setTimeout(() => setToastMsg(null), 2500);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. PERSONAL HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-6 sm:p-8 text-white border border-slate-800 shadow-xl">
        {/* Glow backdrop effects */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-10 w-72 h-72 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          {/* Member Profile Greeting */}
          <div className="flex items-center gap-4">
            {currentMember.avatarUrl ? (
              <img
                src={currentMember.avatarUrl}
                alt={currentMember.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-blue-400/40 shadow-lg shrink-0"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white font-black flex items-center justify-center text-2xl shadow-lg border-2 border-blue-400/40 shrink-0">
                {currentMember.name.charAt(0)}
              </div>
            )}

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {language === 'rw' ? `Muraho, ${currentMember.name}!` : `Welcome, ${currentMember.name}!`}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-mono">
                {currentMember.accountNumber} • {currentMember.phone}
              </p>
            </div>
          </div>

          {/* Quick Primary Actions */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button
              onClick={() => onOpenDeposit()}
              className="flex-1 lg:flex-initial flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5"
            >
              <PiggyBank className="w-4 h-4" />
              <span>{language === 'rw' ? 'Tanga Ubwizigame' : 'Deposit Money'}</span>
            </button>

            <button
              onClick={() => setActiveTab('wallet')}
              className="flex-1 lg:flex-initial flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-blue-700/20 transition-all transform hover:-translate-y-0.5"
            >
              <Wallet className="w-4 h-4" />
              <span>{language === 'rw' ? 'Isanduku (Wallet)' : 'My Wallet'}</span>
            </button>

            <button
              onClick={onOpenAddGoal}
              className="flex-1 lg:flex-initial flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs sm:text-sm border border-white/20 transition-all"
            >
              <PlusCircle className="w-4 h-4 text-blue-300" />
              <span>{language === 'rw' ? 'Shyiraho Intego' : 'New Goal'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* MEMBER SEARCH & PHOTOS FEED ON HOME PAGE */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-slate-900 dark:text-slate-100">
        
        {/* User Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pb-2">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            {/* Search Bar Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'rw' ? 'Shakisha umunyamuryango...' : 'Search member name...'}
                className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              onClick={() => setActiveTab('info')}
              className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-xs shadow-md shadow-blue-700/20 transition-all flex items-center justify-center gap-2 shrink-0"
            >
              <PlusCircle className="w-4 h-4 text-amber-300" />
              <span>{language === 'rw' ? 'Shyiraho Ifoto Muri Profile' : 'Post in Profile'}</span>
            </button>
          </div>
        </div>

        {/* SEARCH RESULTS CARDS (if user typed in search bar) */}
        {searchQuery.trim() && (
          <div className="bg-slate-50 rounded-2xl p-4 border border-blue-100 space-y-3">
            <div className="text-xs font-extrabold text-blue-900 flex items-center justify-between">
              <span>{language === 'rw' ? `Ibisubizo bya search: "${searchQuery}"` : `Search Results for: "${searchQuery}"`}</span>
              <span className="text-[10px] font-mono text-slate-500">
                {members.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.phone.includes(searchQuery)).length} {language === 'rw' ? 'abashakishwa' : 'found'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {members
                .filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.phone.includes(searchQuery) || m.accountNumber.toLowerCase().includes(searchQuery.toLowerCase()))
                .slice(0, 6)
                .map((member) => (
                  <div
                    key={member.id}
                    onClick={() => onViewProfile && onViewProfile(member.id)}
                    className="p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {member.avatarUrl ? (
                        <img
                          src={member.avatarUrl}
                          alt={member.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-blue-700 text-white font-black flex items-center justify-center text-xs shrink-0">
                          {member.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-xs font-black text-slate-900 group-hover:text-blue-700 truncate">
                          {member.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {member.accountNumber}
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 group-hover:bg-blue-700 group-hover:text-white px-2 py-1 rounded-lg border border-blue-200 transition-all shrink-0">
                      Reba Profile →
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* FEED POSTS GRID */}
        {posts.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 font-medium">
            {language === 'rw' ? 'Nta muryango urashyiraho amakuru' : 'No published photos or posts yet'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts
              .filter((post) => 
                !searchQuery.trim() || 
                post.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.content.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((post) => {
                const hasLiked = post.likedBy.includes(currentMember.id);
                const commentsList = post.comments || [];
                const sharesCount = post.sharesCount || 0;
                const isExpanded = !!expandedComments[post.id];

                return (
                  <div
                    key={post.id}
                    className="bg-white rounded-2xl p-4 border border-slate-200/90 flex flex-col justify-between space-y-3 hover:border-slate-300 transition-all shadow-xs"
                  >
                    <div className="space-y-3">
                      
                      {/* Repost Header if applicable */}
                      {post.isRepost && (
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200/80">
                          <Repeat className="w-3 h-3 text-emerald-600" />
                          <span>
                            {language === 'rw' 
                              ? `Yakozweho Repost iturutse kuri ${post.originalAuthorName || 'umunyamuryango'}` 
                              : `Reposted from ${post.originalAuthorName || 'member'}`}
                          </span>
                        </div>
                      )}

                      {/* Author Bar (CLICKABLE TO GO TO USER'S PROFILE + 3-DOTS OPTIONS MENU) */}
                      <div className="flex items-center justify-between gap-2">
                        <div
                          onClick={() => onViewProfile && onViewProfile(post.authorId)}
                          className="flex items-center gap-3 cursor-pointer group hover:bg-blue-50/50 p-1.5 -m-1.5 rounded-xl transition-all flex-1 min-w-0"
                          title={language === 'rw' ? `Reba profile ya ${post.authorName}` : `View ${post.authorName}'s profile`}
                        >
                          {post.authorAvatarUrl ? (
                            <img
                              src={post.authorAvatarUrl}
                              alt={post.authorName}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 group-hover:border-blue-500 transition-all shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-blue-700 group-hover:bg-blue-800 text-white font-black flex items-center justify-center text-sm transition-all shrink-0">
                              {post.authorName.charAt(0)}
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-black text-slate-900 group-hover:text-blue-700 transition-colors truncate flex items-center gap-1">
                              <span>{post.authorName}</span>
                              <span className="text-[9px] text-blue-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">→ Reba Profile</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {post.createdAt}
                            </div>
                          </div>

                          <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 shrink-0">
                            {post.category === 'announcement' ? 'Itangazo' : post.category === 'achievement' ? 'Ibyagezweho' : 'Update'}
                          </span>
                        </div>

                        {/* 3-DOTS MENU BUTTON FOR AUTHOR OR ADMIN */}
                        {(post.authorId === currentMember.id || currentMember.role === 'admin') && (
                          <div className="relative shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActivePostMenuId(activePostMenuId === post.id ? null : post.id);
                              }}
                              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all"
                              title="Amahitamo (Options)"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {/* Dropdown Menu */}
                            {activePostMenuId === post.id && (
                              <div className="absolute right-0 top-8 z-30 w-40 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 animate-in fade-in zoom-in-95">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActivePostMenuId(null);
                                    setEditingPost(post);
                                    setEditContent(post.content);
                                    setEditCategory(post.category);
                                    setEditImageUrl(post.imageUrl || '');
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                                  <span>{language === 'rw' ? 'Hindura (Edit)' : 'Edit Post'}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActivePostMenuId(null);
                                    setDeletingPostId(post.id);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-extrabold text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                  <span>{language === 'rw' ? 'Siba (Delete)' : 'Delete Post'}</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Text Content */}
                      <p className="text-xs text-slate-800 font-medium leading-relaxed">
                        {post.content}
                      </p>

                      {/* Photo if present with High Resolution Crisp Display & Fullscreen Lightbox */}
                      {post.imageUrl && (
                        <div className="rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm bg-slate-900 group relative">
                          <img
                            src={post.imageUrl}
                            alt="Uploaded by member"
                            className="w-full h-56 sm:h-64 object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                            style={{ imageRendering: 'high-quality' }}
                            onClick={() => setLightboxPost(post)}
                          />

                          {/* Overlay Controls */}
                          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex items-center justify-between gap-2 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setLightboxPost(post);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-blue-600/90 hover:bg-blue-600 text-white text-[10px] font-extrabold flex items-center gap-1 shadow-md"
                            >
                              <Maximize2 className="w-3 h-3 text-amber-300" />
                              <span>{language === 'rw' ? 'Kugura Ifoto (HD View)' : 'View HD Photo'}</span>
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onViewProfile && onViewProfile(post.authorId);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-900 text-slate-200 text-[10px] font-extrabold flex items-center gap-1"
                            >
                              <User className="w-3 h-3 text-blue-400" />
                              <span>Profile</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Social Action Bar */}
                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1 text-[11px]">
                      {/* Like Button */}
                      <button
                        onClick={() => onLikePost && onLikePost(post.id)}
                        className={`flex items-center gap-1.5 font-extrabold px-2.5 py-1.5 rounded-xl transition-all ${
                          hasLiked ? 'text-rose-600 bg-rose-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                        title="Bakanda hano gukora Like"
                      >
                        <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-rose-600' : ''}`} />
                        <span>{post.likes}</span>
                      </button>

                      {/* Comment Toggle Button */}
                      <button
                        onClick={() =>
                          setExpandedComments((prev) => ({
                            ...prev,
                            [post.id]: !prev[post.id],
                          }))
                        }
                        className={`flex items-center gap-1.5 font-extrabold px-2.5 py-1.5 rounded-xl transition-all ${
                          isExpanded ? 'text-blue-700 bg-blue-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                        title="Igitekerezo / Comment"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                        <span>{commentsList.length}</span>
                      </button>

                      {/* Repost Button */}
                      <button
                        onClick={() => {
                          if (onRepostPost) onRepostPost(post.id);
                          setToastMsg(language === 'rw' ? 'Yakozweho Repost kuri Profile yawe!' : 'Reposted to your profile!');
                          setTimeout(() => setToastMsg(null), 2500);
                        }}
                        className="flex items-center gap-1 font-extrabold px-2 py-1.5 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-all"
                        title={language === 'rw' ? 'Gukora Repost' : 'Repost'}
                      >
                        <Repeat className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="hidden sm:inline">Repost</span>
                      </button>

                      {/* Share Button */}
                      <button
                        onClick={() => {
                          if (onSharePost) onSharePost(post.id);
                          try {
                            if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
                              navigator.clipboard.writeText(window.location.href).catch(() => {});
                            }
                          } catch (e) {}
                          setToastMsg(language === 'rw' ? 'Link ya post yakopyowe!' : 'Post link copied to clipboard!');
                          setTimeout(() => setToastMsg(null), 2500);
                        }}
                        className="flex items-center gap-1 font-extrabold px-2 py-1.5 rounded-xl text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-all ml-auto"
                        title={language === 'rw' ? 'Gusangiza' : 'Share'}
                      >
                        <Share2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>{sharesCount > 0 ? sharesCount : ''}</span>
                      </button>
                    </div>

                    {/* Expandable Comment Section */}
                    {isExpanded && (
                      <div className="pt-2 border-t border-slate-100 space-y-2 bg-slate-50/80 p-3 rounded-xl">
                        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                          {commentsList.length === 0 ? (
                            <p className="text-[10px] text-slate-400 italic text-center py-1">
                              {language === 'rw' ? 'Nta gitekerezo kirajyaho. Tanga igitekerezo cyawe!' : 'No comments yet. Write the first one!'}
                            </p>
                          ) : (
                            commentsList.map((c) => (
                              <div key={c.id} className="text-[11px] bg-white p-2 rounded-lg border border-slate-200/60 space-y-0.5">
                                <div className="flex items-center justify-between font-bold text-slate-800">
                                  <span className="text-blue-700">{c.authorName}</span>
                                  <span className="text-[9px] text-slate-400 font-mono">{c.createdAt}</span>
                                </div>
                                <p className="text-slate-700 font-medium">{c.content}</p>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Add Comment Input */}
                        <div className="flex items-center gap-1.5 pt-1">
                          <input
                            type="text"
                            placeholder={language === 'rw' ? 'Tanga igitekerezo...' : 'Add a comment...'}
                            value={commentInputMap[post.id] || ''}
                            onChange={(e) =>
                              setCommentInputMap((prev) => ({
                                ...prev,
                                [post.id]: e.target.value,
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const txt = commentInputMap[post.id];
                                if (txt && onCommentPost) {
                                  onCommentPost(post.id, txt);
                                  setCommentInputMap((prev) => ({ ...prev, [post.id]: '' }));
                                }
                              }
                            }}
                            className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                          />
                          <button
                            onClick={() => {
                              const txt = commentInputMap[post.id];
                              if (txt && onCommentPost) {
                                onCommentPost(post.id, txt);
                                setCommentInputMap((prev) => ({ ...prev, [post.id]: '' }));
                              }
                            }}
                            className="p-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white shrink-0"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* TOAST NOTIFICATION */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* EDIT POST MODAL */}
      {editingPost && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                <span>{language === 'rw' ? 'Hindura Ibyo Watangaje' : 'Edit Published Post'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingPost(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditPost} className="space-y-4">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={4}
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
              />

              {editImageUrl && (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 max-h-48">
                  <img src={editImageUrl} alt="Preview" className="w-full h-48 object-cover" />
                  <button
                    type="button"
                    onClick={() => setEditImageUrl('')}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-950/80 text-white text-xs hover:bg-slate-900"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as any)}
                    className="py-2 px-3 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700"
                  >
                    <option value="update">{language === 'rw' ? 'Amakuru' : 'Update'}</option>
                    <option value="announcement">{language === 'rw' ? 'Itangazo' : 'Announcement'}</option>
                    <option value="achievement">{language === 'rw' ? 'Ibyagezweho' : 'Achievement'}</option>
                  </select>

                  <label
                    htmlFor="edit-overview-file-upload"
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    <span>{language === 'rw' ? 'Hindura Ifoto' : 'Change Photo'}</span>
                    <input
                      type="file"
                      id="edit-overview-file-upload"
                      accept="image/*"
                      onChange={handleEditFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingPost(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!editContent.trim()}
                    className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-extrabold text-xs shadow-md"
                  >
                    {language === 'rw' ? 'Bika Ibyahinduwe' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingPostId && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-2xl">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {language === 'rw' ? 'Gusiba Post Burundu?' : 'Delete Post Permanently?'}
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'rw' ? 'Ntabwo uzakora undo kuriyi post nusiba.' : 'This action cannot be undone.'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingPostId(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeletePost && deletingPostId) {
                    onDeletePost(deletingPostId);
                    setToastMsg(language === 'rw' ? 'Post yasibwe burundu!' : 'Post deleted permanently!');
                    setTimeout(() => setToastMsg(null), 2500);
                  }
                  setDeletingPostId(null);
                }}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md"
              >
                {language === 'rw' ? 'Yego, Siba' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL HD IMAGE LIGHTBOX MODAL */}
      <ImageLightboxModal
        isOpen={!!lightboxPost}
        onClose={() => setLightboxPost(null)}
        postId={lightboxPost?.id}
        imageUrl={lightboxPost?.imageUrl || ''}
        authorName={lightboxPost?.authorName}
        authorAvatarUrl={lightboxPost?.authorAvatarUrl}
        caption={lightboxPost?.content}
        createdAt={lightboxPost?.createdAt}
        likesCount={lightboxPost?.likes}
        comments={lightboxPost?.comments || []}
        sharesCount={lightboxPost?.sharesCount || 0}
        isRepost={lightboxPost?.isRepost}
        originalAuthorName={lightboxPost?.originalAuthorName}
        language={language}
        onLike={() => lightboxPost && onLikePost && onLikePost(lightboxPost.id)}
        onComment={(commentText) => lightboxPost && onCommentPost && onCommentPost(lightboxPost.id, commentText)}
        onShare={() => lightboxPost && onSharePost && onSharePost(lightboxPost.id)}
        onRepost={() => lightboxPost && onRepostPost && onRepostPost(lightboxPost.id)}
        hasLiked={lightboxPost ? lightboxPost.likedBy.includes(currentMember.id) : false}
      />

    </div>
  );
};

