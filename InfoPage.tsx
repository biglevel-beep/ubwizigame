import React, { useState } from 'react';
import { Member, UserPost, Language } from '../types';
import { ImageLightboxModal } from './ImageLightboxModal';
import { 
  Megaphone, 
  Send, 
  Image as ImageIcon, 
  Heart,
  Clock,
  ShieldCheck,
  MessageSquare,
  User,
  ArrowLeft,
  Lock,
  Maximize2,
  Repeat,
  Share2,
  Check,
  MoreVertical,
  Edit3,
  Trash2,
  PlusCircle,
  X,
  Camera
} from 'lucide-react';

interface InfoPageProps {
  currentMember: Member;
  viewedMember?: Member;
  posts: UserPost[];
  onAddPost: (post: Omit<UserPost, 'id' | 'createdAt' | 'likes' | 'likedBy'>) => void;
  onEditPost?: (postId: string, newContent: string, newCategory?: 'announcement' | 'update' | 'achievement' | 'general', newImageUrl?: string) => void;
  onDeletePost?: (postId: string) => void;
  onLikePost: (postId: string) => void;
  onCommentPost?: (postId: string, commentText: string) => void;
  onSharePost?: (postId: string) => void;
  onRepostPost?: (postId: string) => void;
  onUpdateMemberAvatar?: (memberId: string, newAvatarUrl: string | undefined) => void;
  language: Language;
  onStartChat?: (memberId: string) => void;
  onBackToMyProfile?: () => void;
  onViewProfile?: (memberId: string) => void;
}

export const InfoPage: React.FC<InfoPageProps> = ({
  currentMember,
  viewedMember,
  posts,
  onAddPost,
  onEditPost,
  onDeletePost,
  onLikePost,
  onCommentPost,
  onSharePost,
  onRepostPost,
  onUpdateMemberAvatar,
  language,
  onStartChat,
  onBackToMyProfile,
  onViewProfile,
}) => {
  const activeProfileMember = viewedMember || currentMember;
  const isOwnProfile = activeProfileMember.id === currentMember.id;

  const [postText, setPostText] = useState('');
  const [postImageUrl, setPostImageUrl] = useState('');
  const [lightboxPost, setLightboxPost] = useState<UserPost | null>(null);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentInputMap, setCommentInputMap] = useState<Record<string, string>>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showPhotoControls, setShowPhotoControls] = useState(false);

  // Post 3-dots Menu & Modal states
  const [activePostMenuId, setActivePostMenuId] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<UserPost | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState<'announcement' | 'update' | 'achievement' | 'general'>('update');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  // Filter posts so only the target member's posts are shown
  const profilePosts = posts.filter((post) => post.authorId === activeProfileMember.id);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPostImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

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

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpdateMemberAvatar) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onUpdateMemberAvatar(activeProfileMember.id, reader.result);
          setToastMsg(language === 'rw' ? 'Ifoto ya Profile yashyizweho neza!' : 'Profile photo updated!');
          setTimeout(() => setToastMsg(null), 2500);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim() || !isOwnProfile) return;

    onAddPost({
      authorId: currentMember.id,
      authorName: currentMember.name,
      authorAvatarUrl: currentMember.avatarUrl,
      content: postText.trim(),
      imageUrl: postImageUrl || undefined,
      category: 'general',
    });

    setPostText('');
    setPostImageUrl('');
    setToastMsg(language === 'rw' ? 'Ibyo utangaje byaguye ku feed!' : 'Post published!');
    setTimeout(() => setToastMsg(null), 2500);
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
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto relative">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-blue-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl shadow-2xl border border-blue-500 flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-amber-300" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. PROFILE HERO HEADER */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-6 sm:p-8 text-white border border-slate-800 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-72 h-72 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            
            {/* AVATAR DISPLAY WITH (+) ADD & DELETE BUTTONS */}
            <div 
              className="relative shrink-0 group cursor-pointer"
              onClick={() => setShowPhotoControls(!showPhotoControls)}
              title="Click to toggle photo controls"
            >
              {activeProfileMember.avatarUrl ? (
                <img
                  src={activeProfileMember.avatarUrl}
                  alt={activeProfileMember.name}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxPost({
                      id: `profile-avatar-${activeProfileMember.id}`,
                      authorId: activeProfileMember.id,
                      authorName: activeProfileMember.name,
                      authorAvatarUrl: activeProfileMember.avatarUrl,
                      content: `${activeProfileMember.name} - Profile Photo`,
                      imageUrl: activeProfileMember.avatarUrl,
                      createdAt: activeProfileMember.joinedDate || 'Member',
                      likes: 0,
                      likedBy: [],
                      category: 'general'
                    });
                  }}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-blue-400/50 shadow-lg hover:opacity-90 transition-all"
                  style={{ imageRendering: 'high-quality' }}
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white font-black flex items-center justify-center text-3xl shadow-lg border-2 border-blue-400/50 shrink-0">
                  {activeProfileMember.name.charAt(0)}
                </div>
              )}

              {/* Profile Photo Controls (For Profile Owner) */}
              {isOwnProfile && (
                <div className={`absolute -bottom-2 -right-2 flex items-center gap-1.5 z-20 transition-all duration-200 ${showPhotoControls ? 'opacity-100 scale-100' : 'opacity-0 sm:opacity-0 group-hover:opacity-100'}`}>
                  {/* Upload / Add Photo Button (+) */}
                  <label
                    htmlFor="profile-avatar-input"
                    className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white border-2 border-slate-900 flex items-center justify-center shadow-lg cursor-pointer transition-transform hover:scale-110"
                    title={language === 'rw' ? 'Shyiraho / Hindura Ifoto (Add/Update Photo)' : 'Add/Update Profile Photo'}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <PlusCircle className="w-4 h-4 text-white" />
                    <input
                      type="file"
                      id="profile-avatar-input"
                      accept="image/*"
                      onChange={handleAvatarFileUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Delete Profile Photo Button */}
                  {activeProfileMember.avatarUrl && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onUpdateMemberAvatar) {
                          onUpdateMemberAvatar(activeProfileMember.id, undefined);
                          setToastMsg(language === 'rw' ? 'Ifoto ya Profile yasibwe!' : 'Profile photo deleted!');
                          setTimeout(() => setToastMsg(null), 2500);
                        }
                      }}
                      className="w-8 h-8 rounded-full bg-rose-600 hover:bg-rose-700 text-white border-2 border-slate-900 flex items-center justify-center shadow-lg transition-transform hover:scale-110"
                      title={language === 'rw' ? 'Siba Ifoto ya Profile (Delete Photo permanently)' : 'Delete Profile Photo'}
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {isOwnProfile 
                  ? 'Profile Picture'
                  : activeProfileMember.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {isOwnProfile
                  ? 'Profile Picture'
                  : (language === 'rw'
                    ? `Uri kureba profile n’amafoto byatangajwe na ${activeProfileMember.name}.`
                    : `Viewing profile and updates published by ${activeProfileMember.name}.`)}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex flex-wrap items-center gap-3">
            {!isOwnProfile && (
              <button
                onClick={() => onStartChat && onStartChat(activeProfileMember.id)}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-amber-300" />
                <span>{language === 'rw' ? `Andikira ${activeProfileMember.name}` : `Send Message`}</span>
              </button>
            )}

            {!isOwnProfile && onBackToMyProfile && (
              <button
                onClick={onBackToMyProfile}
                className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs border border-slate-700 transition-all flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4 text-blue-400" />
                <span>{language === 'rw' ? 'Subira Kuri Profile Yanjye' : 'My Profile'}</span>
              </button>
            )}

            <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700 text-center">
              <div className="text-xl font-black text-blue-400">{profilePosts.length}</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                {language === 'rw' ? 'Ibyatangajwe' : 'Posts'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. POST PUBLISHER BOX (ONLY FOR PROFILE OWNER) */}
      {isOwnProfile ? (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <form onSubmit={handleSubmitPost} className="space-y-3">
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder={
                language === 'rw'
                  ? 'Andika ibyo utangaza, amakuru y’ibyo wagezeho cyangwa ibyo usaba abanyamuryango...'
                  : 'Write an update, announcement, or request for the group...'
              }
              rows={3}
              className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all resize-none"
            />

            {/* Image Preview */}
            {postImageUrl && (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 max-h-60">
                <img src={postImageUrl} alt="Upload preview" className="w-full h-60 object-contain bg-slate-900" />
                <button
                  type="button"
                  onClick={() => setPostImageUrl('')}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white text-xs font-bold hover:bg-slate-900"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Options & Action */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="info-image-upload"
                  className="p-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5"
                  title="Shyiraho Ifoto"
                >
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  <span>{language === 'rw' ? 'Shyiraho Ifoto' : 'Add Photo'}</span>
                  <input
                    type="file"
                    id="info-image-upload"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={!postText.trim()}
                className="py-2.5 px-6 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-extrabold text-xs shadow-md shadow-blue-700/20 transition-all flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{language === 'rw' ? 'Tangaza Post' : 'Post Online'}</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-slate-50 rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-100 text-blue-800 shrink-0">
              <Lock className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-900">
                {language === 'rw' ? `Profile ya ${activeProfileMember.name}` : `${activeProfileMember.name}'s Profile`}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {language === 'rw' 
                  ? 'Kanda ku amafoto n’izina urebe ibyo yatangaje n’ubutumwa bw’ibanga.' 
                  : 'View published posts and click Send Message for private peer chat.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => onStartChat && onStartChat(activeProfileMember.id)}
            className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <MessageSquare className="w-4 h-4 text-amber-300" />
            <span>{language === 'rw' ? 'Mwandikire Ibiganiro' : 'Send Message'}</span>
          </button>
        </div>
      )}

      {/* 3. PUBLISHED POSTS & PHOTOS FEED */}
      <div className="space-y-4">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2 px-1">
          <Megaphone className="w-4 h-4 text-blue-700" />
          <span>
            {isOwnProfile
              ? (language === 'rw' ? 'Posts & Photos' : 'Posts & Photos')
              : (language === 'rw' ? `Ibyatangajwe na ${activeProfileMember.name}` : `Posts by ${activeProfileMember.name}`)}
          </span>
        </h3>

        {profilePosts.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-2">
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {isOwnProfile
                ? (language === 'rw'
                  ? 'Nta mafoto cyangwa itangazo urashyiraho. Andika cyangwa ushyireho ifoto ukeneye kugaragaza!'
                  : 'You have not published any photos or announcements yet. Use the form above to share your first post!')
                : (language === 'rw'
                  ? `Nta mafoto cyangwa amatangazo ${activeProfileMember.name} arashyiraho.`
                  : `${activeProfileMember.name} has not published any photos or updates yet.`)}
            </p>
          </div>
        ) : (
          profilePosts.map((post) => {
            const hasLiked = post.likedBy.includes(currentMember.id);
            const commentsList = post.comments || [];
            const sharesCount = post.sharesCount || 0;
            const isExpanded = !!expandedComments[post.id];
            const canManagePost = post.authorId === currentMember.id || currentMember.role === 'admin';

            return (
              <div
                key={post.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4 hover:border-slate-300 transition-all relative"
              >
                {/* Repost Indicator */}
                {post.isRepost && (
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-2xl border border-emerald-200/80">
                    <Repeat className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      {language === 'rw' 
                        ? `Yakozweho Repost iturutse kuri ${post.originalAuthorName || 'umunyamuryango'}` 
                        : `Reposted from ${post.originalAuthorName || 'member'}`}
                    </span>
                  </div>
                )}

                {/* Author Header & 3-DOTS OPTIONS MENU */}
                <div className="flex items-center justify-between">
                  <div 
                    onClick={() => onViewProfile && onViewProfile(post.authorId)}
                    className="flex items-center gap-3 cursor-pointer group"
                    title={`Reba profile ya ${post.authorName}`}
                  >
                    {post.authorAvatarUrl ? (
                      <img
                        src={post.authorAvatarUrl}
                        alt={post.authorName}
                        className="w-11 h-11 rounded-xl object-cover border border-slate-200 shadow-xs group-hover:border-blue-500"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-blue-700 text-white font-black flex items-center justify-center text-sm shadow-xs group-hover:bg-blue-800">
                        {post.authorName.charAt(0)}
                      </div>
                    )}

                    <div>
                      <div className="text-sm font-black text-slate-900 group-hover:text-blue-700 flex items-center gap-2">
                        <span>{post.authorName}</span>
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                          post.category === 'announcement'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : post.category === 'achievement'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {post.category === 'announcement' ? 'Itangazo' : post.category === 'achievement' ? 'Ibyagezweho' : 'Update'}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{post.createdAt}</span>
                      </div>
                    </div>
                  </div>

                  {/* 3-DOTS MENU (UTUDOMO TUTATU 3) */}
                  {canManagePost && (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setActivePostMenuId(activePostMenuId === post.id ? null : post.id)}
                        className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                        title="Hitamo amahitamo ya post (3-dots menu)"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {activePostMenuId === post.id && (
                        <div className="absolute right-0 top-10 z-30 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 text-xs font-extrabold text-slate-800 animate-fade-in">
                          <button
                            type="button"
                            onClick={() => {
                              setActivePostMenuId(null);
                              setEditingPost(post);
                              setEditContent(post.content);
                              setEditCategory(post.category || 'update');
                              setEditImageUrl(post.imageUrl || '');
                            }}
                            className="w-full text-left px-4 py-2.5 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 transition-colors"
                          >
                            <Edit3 className="w-4 h-4 text-blue-600" />
                            <span>{language === 'rw' ? 'Hindura Post (Edit)' : 'Edit Post'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActivePostMenuId(null);
                              setDeletingPostId(post.id);
                            }}
                            className="w-full text-left px-4 py-2.5 hover:bg-rose-50 hover:text-rose-700 flex items-center gap-2 text-rose-600 border-t border-slate-100 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-rose-600" />
                            <span>{language === 'rw' ? 'Siba Post (Delete)' : 'Delete Post'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Text Content */}
                <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>

                {/* Attached Image with HD Lightbox View & Crisp Desktop Scaling */}
                {post.imageUrl && (
                  <div 
                    onClick={() => setLightboxPost(post)}
                    className="rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm bg-slate-950 cursor-pointer group relative w-full flex items-center justify-center min-h-[220px] max-h-[460px] sm:max-h-[540px]"
                  >
                    <img
                      src={post.imageUrl}
                      alt="Post attachment"
                      className="w-full h-auto max-h-[460px] sm:max-h-[540px] object-contain group-hover:scale-[1.01] transition-transform duration-300"
                      style={{ imageRendering: 'high-quality' }}
                    />
                    <div className="absolute bottom-3 right-3 bg-slate-950/80 text-white text-[11px] font-extrabold px-3 py-1.5 rounded-xl border border-slate-700/80 backdrop-blur-sm flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity shadow-lg">
                      <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>{language === 'rw' ? 'Kugura Ifoto (HD View)' : 'View Full HD Photo'}</span>
                    </div>
                  </div>
                )}

                {/* Social Action Footer */}
                <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs font-bold text-slate-600 gap-2">
                  <button
                    type="button"
                    onClick={() => onLikePost(post.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                      hasLiked
                        ? 'bg-rose-50 text-rose-600 font-extrabold border border-rose-200'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${hasLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
                    <span>{post.likes}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setExpandedComments((prev) => ({
                        ...prev,
                        [post.id]: !prev[post.id],
                      }))
                    }
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                      isExpanded ? 'bg-blue-50 text-blue-700 font-extrabold' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span>{commentsList.length}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onRepostPost) onRepostPost(post.id);
                      setToastMsg(language === 'rw' ? 'Yakozweho Repost kuri Profile yawe!' : 'Reposted to your profile feed!');
                      setTimeout(() => setToastMsg(null), 2500);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 transition-all"
                  >
                    <Repeat className="w-4 h-4 text-emerald-600" />
                    <span className="hidden sm:inline">Repost</span>
                  </button>

                  <button
                    type="button"
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
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-all"
                  >
                    <Share2 className="w-4 h-4 text-blue-600" />
                    <span className="hidden sm:inline">{sharesCount > 0 ? sharesCount : ''} Share</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* EDIT POST MODAL */}
      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 relative text-slate-900 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingPost(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                <Edit3 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  {language === 'rw' ? 'Hindura Ibyo Watangaje (Edit Post)' : 'Edit Published Post'}
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'rw' ? 'Vugurura inyandiko cyangwa ugaragaze ifoto nshya.' : 'Update content, category, or photo attachment.'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveEditPost} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Inyandiko ya Post *
                </label>
                <textarea
                  required
                  rows={4}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:outline-none focus:border-blue-700"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Category (Icyo itangazo ryerekeye)
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-blue-700"
                >
                  <option value="update">Amakuru (General Update)</option>
                  <option value="announcement">Itangazo (Announcement)</option>
                  <option value="achievement">Ibyagezweho (Achievement)</option>
                </select>
              </div>

              {/* Edit Image Attachment */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Ifoto y'Itangazo (Photo Attachment)
                </label>
                {editImageUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 max-h-48 mb-2">
                    <img src={editImageUrl} alt="Post attachment preview" className="w-full h-48 object-contain" />
                    <button
                      type="button"
                      onClick={() => setEditImageUrl('')}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-md"
                    >
                      ✕ Siba Ifoto
                    </button>
                  </div>
                ) : (
                  <label className="p-3 bg-slate-50 border border-slate-300 border-dashed rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-100 font-bold text-slate-700">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    <span>{language === 'rw' ? 'Shyiraho Ifoto Nshya' : 'Add New Photo'}</span>
                    <input type="file" accept="image/*" onChange={handleEditFileUpload} className="hidden" />
                  </label>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingPost(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                >
                  Regana (Cancel)
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-extrabold shadow-md"
                >
                  {language === 'rw' ? 'Bika Ibyahinduwe' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE POST CONFIRMATION MODAL */}
      {deletingPostId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-slate-900 text-center">
            <div className="w-14 h-14 bg-rose-100 border border-rose-200 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Trash2 className="w-7 h-7" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900">
                {language === 'rw' ? 'Siba Iyi Post?' : 'Delete Post?'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'rw' ? 'Waba wizeye ko ushaka gusiba iyi post burundu?' : 'Are you sure you want to permanently delete this post?'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDeletingPostId(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
              >
                Hagarara (Cancel)
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

      {/* LIGHTBOX MODAL */}
      {lightboxPost && (
        <ImageLightboxModal
          isOpen={!!lightboxPost}
          onClose={() => setLightboxPost(null)}
          postId={lightboxPost.id}
          imageUrl={lightboxPost.imageUrl || lightboxPost.authorAvatarUrl || ''}
          authorName={lightboxPost.authorName}
          authorAvatarUrl={lightboxPost.authorAvatarUrl}
          caption={lightboxPost.content}
          createdAt={lightboxPost.createdAt}
          likesCount={lightboxPost.likes}
          comments={lightboxPost.comments}
          sharesCount={lightboxPost.sharesCount}
          isRepost={lightboxPost.isRepost}
          originalAuthorName={lightboxPost.originalAuthorName}
          language={language}
          onLike={() => onLikePost(lightboxPost.id)}
          onComment={(text) => onCommentPost && onCommentPost(lightboxPost.id, text)}
          onShare={() => onSharePost && onSharePost(lightboxPost.id)}
          onRepost={() => onRepostPost && onRepostPost(lightboxPost.id)}
          hasLiked={lightboxPost.likedBy.includes(currentMember.id)}
        />
      )}
    </div>
  );
};
