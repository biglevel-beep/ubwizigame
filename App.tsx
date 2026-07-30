import React, { useState, useEffect } from 'react';
import { SavingsGoal, Transaction, SavingsChallengeDay, Language, Currency, Member, ChatMessage, UserPost, MemberLedgerRecord, AdminNotification } from './types';
import { initialGoals, initialTransactions, generateInitialChallengeDays, initialMembers, initialChatMessages, initialUserPosts, initialLedgerRecords } from './data/initialData';
import {
  fetchDatabaseSync,
  saveDatabaseMember,
  saveDatabaseGoal,
  deleteDatabaseGoal,
  saveDatabaseTransaction,
  saveDatabaseChallengeDay,
  resetDatabaseChallenge,
  saveDatabasePost,
  addDatabasePostComment,
  saveDatabaseChatMessage,
  saveDatabaseLedgerRecord,
  saveDatabaseNotification
} from './lib/api';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { OverviewCards } from './components/OverviewCards';
import { GoalsSection } from './components/GoalsSection';
import { SavingsChallenge } from './components/SavingsChallenge';
import { BudgetCalculator } from './components/BudgetCalculator';
import { AiAdvisor } from './components/AiAdvisor';
import { AnalyticsAndHistory } from './components/AnalyticsAndHistory';
import { AdminDashboard } from './components/AdminDashboard';
import { WalletPage } from './components/WalletPage';
import { AuthScreen } from './components/AuthScreen';
import { PrivateChat } from './components/PrivateChat';
import { InfoPage } from './components/InfoPage';
import { AboutUs } from './components/AboutUs';
import { PrivacyPolicy } from './components/PrivacyPolicy';


export default function App() {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('ubwizigame_lang') as Language) || 'rw';
  });

  const [currency, setCurrency] = useState<Currency>(() => {
    return (localStorage.getItem('ubwizigame_curr') as Currency) || 'RWF';
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('ubwizigame_dark_mode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('ubwizigame_dark_mode', String(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const [activeTab, setActiveTab] = useState<string>('overview');

  // Auth & Login State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem('ubwizigame_is_logged_in');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Members State with Persistence
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('ubwizigame_members');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialMembers;
  });

  const [currentMemberId, setCurrentMemberId] = useState<string>(() => {
    const saved = localStorage.getItem('ubwizigame_current_member_id');
    return saved || 'mem-1';
  });

  // Current active member (derived safely)
  const currentMember = members.find(m => m.id === currentMemberId) || members[0] || initialMembers[0];

  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(true);

  // Sync Auth State
  useEffect(() => {
    localStorage.setItem('ubwizigame_is_logged_in', JSON.stringify(isLoggedIn));
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('ubwizigame_current_member_id', currentMemberId);
  }, [currentMemberId]);

  // Sync with Cloud SQL Database on Mount
  useEffect(() => {
    let isMounted = true;
    fetchDatabaseSync()
      .then((data) => {
        if (!isMounted) return;
        if (data.members && data.members.length > 0) setMembers(data.members);
        if (data.goals && data.goals.length > 0) setGoals(data.goals);
        if (data.transactions && data.transactions.length > 0) setTransactions(data.transactions);
        if (data.challengeDays && data.challengeDays.length > 0) setChallengeDays(data.challengeDays);
        if (data.posts && data.posts.length > 0) setUserPosts(data.posts);
        if (data.chatMessages && data.chatMessages.length > 0) setChatMessages(data.chatMessages);
        if (data.ledgerRecords && data.ledgerRecords.length > 0) setLedgerRecords(data.ledgerRecords);
        if (data.notifications && data.notifications.length > 0) setAdminNotifications(data.notifications);
      })
      .catch((err) => {
        console.warn('Could not sync with Cloud SQL database on mount:', err);
      });
    return () => { isMounted = false; };
  }, []);

  // Auth Handlers
  const handleLogin = (memberId: string) => {
    setCurrentMemberId(memberId);
    setIsLoggedIn(true);
  };

  const handleSignup = (newMemberData: Omit<Member, 'id' | 'accountNumber' | 'totalSaved' | 'joinedDate'>) => {
    const newId = `mem-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const accNum = `IGH-2026-00${members.length + 1}`;
    const newMember: Member = {
      ...newMemberData,
      id: newId,
      accountNumber: accNum,
      totalSaved: 0,
      joinedDate: new Date().toISOString().split('T')[0],
    };

    setMembers(prev => [newMember, ...prev]);
    setCurrentMemberId(newId);
    setIsLoggedIn(true);
    saveDatabaseMember(newMember).catch(console.error);

    // Create default starter savings goal for new member
    const defaultGoal: SavingsGoal = {
      id: `goal-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: language === 'rw' ? "Ubwizigame bw'Ibanze" : "General Savings",
      targetAmount: 500000,
      currentAmount: 0,
      category: 'general',
      targetDate: '2026-12-31',
      createdAt: new Date().toISOString().split('T')[0],
      memberId: newId,
      notes: language === 'rw' ? "Intego y'ubwizigame mu ikimina" : "General group savings goal",
    };
    setGoals(prev => [defaultGoal, ...prev]);
    saveDatabaseGoal(defaultGoal).catch(console.error);

    // Create admin approval notification for new registration request
    const group = newMemberData.groupName || 'TUZAMURANE TETERO';
    const newNotif: AdminNotification = {
      id: `notif-user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type: 'new_user_registration',
      memberName: newMemberData.name,
      memberId: newId,
      groupName: group,
      amount: newMemberData.walletBalance || 0,
      description: language === 'rw' 
        ? `Saba kwinjira mu itsinda rya ${group} (${newMemberData.phone})` 
        : `Registration request for group ${group} (${newMemberData.phone})`,
      date: new Date().toISOString().split('T')[0],
      isRead: false,
    };
    setAdminNotifications(prev => [newNotif, ...prev]);
    saveDatabaseNotification(newNotif).catch(console.error);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const handleUpdateMemberPin = (memberId: string, newPin: string) => {
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, pin: newPin } : m));
  };

  // Goals State with Persistence
  const [goals, setGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem('ubwizigame_goals');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialGoals;
  });

  // Transactions State with Persistence
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('ubwizigame_transactions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialTransactions;
  });

  // 30-Day Challenge State with Persistence
  const [challengeDays, setChallengeDays] = useState<SavingsChallengeDay[]>(() => {
    const saved = localStorage.getItem('ubwizigame_challenge');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return generateInitialChallengeDays();
  });

  // Private Chat Messages State with Persistence
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('ubwizigame_chat_messages');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialChatMessages;
  });

  // User Announcements / Posts State with Persistence
  const [userPosts, setUserPosts] = useState<UserPost[]>(() => {
    const saved = localStorage.getItem('ubwizigame_user_posts');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialUserPosts;
  });

  // Financial Table Ledger Records State with Persistence
  const [ledgerRecords, setLedgerRecords] = useState<MemberLedgerRecord[]>(() => {
    const saved = localStorage.getItem('ubwizigame_ledger_records');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialLedgerRecords;
  });

  useEffect(() => {
    localStorage.setItem('ubwizigame_ledger_records', JSON.stringify(ledgerRecords));
  }, [ledgerRecords]);

  const handleAddLedgerRecord = (recordData: Omit<MemberLedgerRecord, 'id' | 'createdAt'>) => {
    const newRecord: MemberLedgerRecord = {
      ...recordData,
      id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    setLedgerRecords(prev => [newRecord, ...prev]);
  };

  const handleUpdateLedgerRecord = (updatedRecord: MemberLedgerRecord) => {
    setLedgerRecords(prev => prev.map(rec => rec.id === updatedRecord.id ? updatedRecord : rec));
  };

  const handleDeleteLedgerRecord = (recordId: string) => {
    setLedgerRecords(prev => prev.filter(rec => rec.id !== recordId));
  };

  // Admin Notifications State with Persistence
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>(() => {
    const saved = localStorage.getItem('ubwizigame_admin_notifications');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      {
        id: 'init-notif-1',
        type: 'payment',
        memberName: 'Mucyo Jean',
        memberId: 'mem-1',
        amount: 25000,
        description: 'Ubwizigame bw\'icyumweru bwa MoMo',
        date: new Date().toISOString().split('T')[0],
        isRead: false
      },
      {
        id: 'init-notif-2',
        type: 'loan_request',
        memberName: 'Teta Liliane',
        memberId: 'mem-2',
        amount: 150000,
        description: 'Gusaba inguzanyo yo kugura imbuto z\'ubuhinzi',
        date: new Date().toISOString().split('T')[0],
        isRead: false
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('ubwizigame_admin_notifications', JSON.stringify(adminNotifications));
  }, [adminNotifications]);

  const handleLoanRequest = (memberId: string, amount: number, description: string) => {
    const targetMember = members.find(m => m.id === memberId);
    const newNotif: AdminNotification = {
      id: `notif-loan-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type: 'loan_request',
      memberName: targetMember ? targetMember.name : 'Umunyamuryango',
      memberId,
      amount,
      description,
      date: new Date().toISOString().split('T')[0],
      isRead: false
    };
    setAdminNotifications(prev => [newNotif, ...prev]);
  };

  const handleApproveLoanRequest = (notifId: string, memberId: string, amount: number, description: string) => {
    // 1. Update member's wallet balance
    setMembers(prev => prev.map(m => m.id === memberId ? { 
      ...m, 
      walletBalance: m.walletBalance + amount 
    } : m));

    // 2. Add Transaction of type 'deposit' with goalId: 'wallet' and goalTitle: 'Loan Approved'
    const targetMember = members.find(m => m.id === memberId);
    const newTx: Transaction = {
      id: `tx-loan-approved-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      goalId: 'wallet',
      goalTitle: language === 'rw' ? 'Inguzanyo Yemejwe' : 'Loan Approved',
      type: 'deposit',
      amount,
      date: new Date().toISOString().split('T')[0],
      note: description || (language === 'rw' ? 'Inguzanyo yemejwe na Admin' : 'Loan request approved by Admin'),
      memberId,
      memberName: targetMember?.name || 'Member',
      paymentMethod: 'Bank',
      status: 'completed',
    };
    setTransactions(prev => [newTx, ...prev]);

    // 3. Add a MemberLedgerRecord in the financial table
    const newRecord: MemberLedgerRecord = {
      id: `rec-loan-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      memberId,
      memberName: targetMember?.name || 'Member',
      date: new Date().toISOString().split('T')[0],
      savings: 0,
      totalSavings: targetMember ? targetMember.totalSaved : 0,
      loanAmount: amount,
      paidAmount: 0,
      remainingLoan: amount,
      notes: description || (language === 'rw' ? 'Inguzanyo Yemejwe' : 'Approved Loan'),
      createdAt: new Date().toISOString(),
    };
    setLedgerRecords(prev => [newRecord, ...prev]);

    // 4. Update the notification: set isApproved = true, isRead = true
    setAdminNotifications(prev => prev.map(n => n.id === notifId ? { 
      ...n, 
      isApproved: true, 
      isRead: true,
      description: language === 'rw' 
        ? `${n.description} (YEMEJEWE / APPROVED)` 
        : `${n.description} (APPROVED)`
    } : n));
  };

  const handleShareLoanRequest = (notifId: string, memberName: string, amount: number, description: string) => {
    // Create a new post in the community newsfeed (UserPost)
    const now = new Date();
    const formattedTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const content = language === 'rw'
      ? `📢 AMANGAZO: Umunyamuryango wetu ${memberName} yasabye inguzanyo ya Frw ${amount.toLocaleString()} kubera iyi mpamvu: "${description}".`
      : `📢 ANNOUNCEMENT: Our member ${memberName} has requested a loan of RWF ${amount.toLocaleString()} for the following reason: "${description}".`;

    const newPost: UserPost = {
      id: `post-loan-share-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      authorId: 'admin',
      authorName: language === 'rw' ? 'Umuyobozi w\'Ikimina (Admin)' : 'Savings Group Admin',
      content,
      createdAt: formattedTime,
      likes: 0,
      likedBy: [],
      category: 'announcement',
      comments: [],
    };
    
    setUserPosts(prev => [newPost, ...prev]);

    // Update the notification: set isShared = true
    setAdminNotifications(prev => prev.map(n => n.id === notifId ? { ...n, isShared: true } : n));
  };

  const handleApproveNewUser = (notifId: string, memberId: string) => {
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, status: 'active' } : m));
    setAdminNotifications(prev => prev.map(n => n.id === notifId ? {
      ...n,
      isApproved: true,
      isRead: true,
      description: language === 'rw'
        ? `${n.description} (YEMEJEWE / ACCEPTED)`
        : `${n.description} (ACCEPTED)`
    } : n));
  };

  const handleRejectNewUser = (notifId: string, memberId: string) => {
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, status: 'suspended' } : m));
    setAdminNotifications(prev => prev.map(n => n.id === notifId ? {
      ...n,
      isRejected: true,
      isRead: true,
      description: language === 'rw'
        ? `${n.description} (YAHANAGUWE / REJECTED)`
        : `${n.description} (REJECTED)`
    } : n));
  };

  const handleMarkNotifAsRead = (notifId: string) => {
    setAdminNotifications(prev => prev.map(n => n.id === notifId ? { ...n, isRead: true } : n));
  };

  const handleClearNotif = (notifId: string) => {
    setAdminNotifications(prev => prev.filter(n => n.id !== notifId));
  };

  // Modals state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedDepositGoalId, setSelectedDepositGoalId] = useState<string | null>(null);
  
  // Profile viewing & private messaging state
  const [viewedProfileMemberId, setViewedProfileMemberId] = useState<string | null>(null);
  const [selectedChatRecipientId, setSelectedChatRecipientId] = useState<string | null>(null);

  const handleViewProfile = (memberId: string) => {
    setViewedProfileMemberId(memberId);
    setActiveTab('info');
  };

  const handleStartChat = (memberId: string) => {
    setSelectedChatRecipientId(memberId);
    setActiveTab('chat');
  };

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('ubwizigame_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('ubwizigame_curr', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('ubwizigame_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('ubwizigame_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('ubwizigame_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('ubwizigame_challenge', JSON.stringify(challengeDays));
  }, [challengeDays]);

  useEffect(() => {
    localStorage.setItem('ubwizigame_chat_messages', JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem('ubwizigame_user_posts', JSON.stringify(userPosts));
  }, [userPosts]);

  // Handle Add New Post
  const handleAddPost = (post: Omit<UserPost, 'id' | 'createdAt' | 'likes' | 'likedBy'>) => {
    const now = new Date();
    const formattedTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newPost: UserPost = {
      ...post,
      id: `post-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      createdAt: formattedTime,
      likes: 0,
      likedBy: [],
    };

    setUserPosts((prev) => [newPost, ...prev]);
  };

  // Handle Like Post
  const handleLikePost = (postId: string) => {
    setUserPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        const hasLiked = post.likedBy.includes(currentMemberId);
        if (hasLiked) {
          return {
            ...post,
            likes: Math.max(0, post.likes - 1),
            likedBy: post.likedBy.filter((id) => id !== currentMemberId),
          };
        } else {
          return {
            ...post,
            likes: post.likes + 1,
            likedBy: [...post.likedBy, currentMemberId],
          };
        }
      })
    );
  };

  // Handle Add Comment to Post
  const handleCommentPost = (postId: string, commentText: string) => {
    if (!commentText.trim()) return;
    const now = new Date();
    const formattedTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newComment = {
      id: `c-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      authorId: currentMemberId,
      authorName: currentMember.name,
      authorAvatarUrl: currentMember.avatarUrl,
      content: commentText.trim(),
      createdAt: formattedTime,
    };

    setUserPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        return {
          ...post,
          comments: [...(post.comments || []), newComment],
        };
      })
    );
  };

  // Handle Share Post
  const handleSharePost = (postId: string) => {
    setUserPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        return {
          ...post,
          sharesCount: (post.sharesCount || 0) + 1,
        };
      })
    );
  };

  // Handle Repost Post to Current Member's Profile Feed
  const handleRepostPost = (postId: string) => {
    const targetPost = userPosts.find((p) => p.id === postId);
    if (!targetPost) return;

    const now = new Date();
    const formattedTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const repost: UserPost = {
      id: `post-repost-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      authorId: currentMemberId,
      authorName: currentMember.name,
      authorAvatarUrl: currentMember.avatarUrl,
      content: targetPost.content,
      imageUrl: targetPost.imageUrl,
      createdAt: formattedTime,
      likes: 0,
      likedBy: [],
      category: targetPost.category || 'general',
      comments: [],
      sharesCount: 0,
      isRepost: true,
      originalAuthorId: targetPost.authorId,
      originalAuthorName: targetPost.authorName,
      originalAuthorAvatarUrl: targetPost.authorAvatarUrl,
      originalPostId: targetPost.id,
    };

    setUserPosts((prev) => [repost, ...prev]);

    // Also increment original post shares count
    handleSharePost(postId);
  };

  // Handle Edit Post
  const handleEditPost = (
    postId: string,
    newContent: string,
    newCategory?: 'announcement' | 'update' | 'achievement' | 'general',
    newImageUrl?: string
  ) => {
    setUserPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          content: newContent,
          category: newCategory || p.category,
          imageUrl: newImageUrl !== undefined ? newImageUrl : p.imageUrl,
        };
      })
    );
  };

  // Handle Delete Post
  const handleDeletePost = (postId: string) => {
    setUserPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  // Handle Update Member Avatar (Upload or Delete)
  const handleUpdateMemberAvatar = (memberId: string, newAvatarUrl: string | undefined) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, avatarUrl: newAvatarUrl } : m))
    );
    // Sync avatar across author fields in posts and comments
    setUserPosts((prev) =>
      prev.map((post) => {
        let updated = { ...post };
        if (post.authorId === memberId) {
          updated.authorAvatarUrl = newAvatarUrl;
        }
        if (post.originalAuthorId === memberId) {
          updated.originalAuthorAvatarUrl = newAvatarUrl;
        }
        if (post.comments) {
          updated.comments = post.comments.map((c) =>
            c.authorId === memberId ? { ...c, authorAvatarUrl: newAvatarUrl } : c
          );
        }
        return updated;
      })
    );
  };


  // Handle Send Private Chat Message
  const handleSendChatMessage = (
    recipientId: string, 
    text: string, 
    audioUrl?: string, 
    audioDuration?: number
  ) => {
    const now = new Date();
    const formattedTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      senderId: currentMemberId,
      recipientId: recipientId,
      text: text,
      timestamp: formattedTime,
      isRead: false,
      audioUrl: audioUrl,
      audioDuration: audioDuration,
    };

    setChatMessages((prev) => [...prev, newMsg]);
  };

  // Handle Edit Private Chat Message
  const handleEditChatMessage = (messageId: string, newText: string) => {
    setChatMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, text: newText, isEdited: true } : msg
      )
    );
  };

  // Handle Delete Private Chat Message
  const handleDeleteChatMessage = (messageId: string) => {
    setChatMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              text: language === 'rw' ? 'Ubutumwa bwasibwe' : 'Message was deleted',
              isDeleted: true,
              audioUrl: undefined,
              audioDuration: undefined,
            }
          : msg
      )
    );
  };

  // Total Savings across all goals
  const totalSavedRWF = goals.reduce((sum, g) => sum + g.currentAmount, 0);

  // MEMBER CRUD OPERATIONS (Admin)
  const handleAddMember = (newMemberData: Omit<Member, 'id' | 'accountNumber' | 'totalSaved' | 'joinedDate'>) => {
    const newId = `mem-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const accNum = `IGH-2026-00${members.length + 1}`;
    const newMember: Member = {
      ...newMemberData,
      id: newId,
      accountNumber: accNum,
      totalSaved: 0,
      joinedDate: new Date().toISOString().split('T')[0],
    };
    setMembers(prev => [newMember, ...prev]);
    saveDatabaseMember(newMember).catch(console.error);
  };

  const handleUpdateMember = (updatedMember: Member) => {
    setMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
    saveDatabaseMember(updatedMember).catch(console.error);
  };

  const handleDeleteMember = (memberId: string) => {
    setMembers(prev => prev.filter(m => m.id !== memberId));
    if (currentMemberId === memberId && members.length > 1) {
      const remaining = members.filter(m => m.id !== memberId);
      setCurrentMemberId(remaining[0].id);
    }
  };

  const handleAdminDepositToWallet = (memberId: string, amount: number, note: string) => {
    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        const updated = { ...m, walletBalance: m.walletBalance + amount };
        saveDatabaseMember(updated).catch(console.error);
        return updated;
      }
      return m;
    }));
    
    const targetMember = members.find(m => m.id === memberId);
    const newTx: Transaction = {
      id: `tx-admin-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      goalId: 'wallet',
      goalTitle: 'Wallet Account Top Up',
      type: 'deposit',
      amount,
      date: new Date().toISOString().split('T')[0],
      note,
      memberId,
      memberName: targetMember?.name || 'Member',
      paymentMethod: 'Cash',
      status: 'completed',
    };
    setTransactions(prev => [newTx, ...prev]);
    saveDatabaseTransaction(newTx).catch(console.error);
  };

  const handleAdminWithdrawFromWallet = (memberId: string, amount: number, note: string) => {
    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        const updated = { ...m, walletBalance: Math.max(0, m.walletBalance - amount) };
        saveDatabaseMember(updated).catch(console.error);
        return updated;
      }
      return m;
    }));
    
    const targetMember = members.find(m => m.id === memberId);
    const newTx: Transaction = {
      id: `tx-admin-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      goalId: 'wallet',
      goalTitle: 'Wallet Account Withdrawal',
      type: 'withdraw',
      amount,
      date: new Date().toISOString().split('T')[0],
      note,
      memberId,
      memberName: targetMember?.name || 'Member',
      paymentMethod: 'Cash',
      status: 'completed',
    };
    setTransactions(prev => [newTx, ...prev]);
    saveDatabaseTransaction(newTx).catch(console.error);
  };

  // WALLET OPERATIONS
  const handleTopUpWallet = (memberId: string, amount: number, paymentMethod: 'MoMo' | 'Airtel' | 'Bank', note: string) => {
    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        const updated = { ...m, walletBalance: m.walletBalance + amount };
        saveDatabaseMember(updated).catch(console.error);
        return updated;
      }
      return m;
    }));
    
    const targetMember = members.find(m => m.id === memberId);
    const newTx: Transaction = {
      id: `tx-topup-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      goalId: 'wallet',
      goalTitle: 'Wallet Top Up',
      type: 'deposit',
      amount,
      date: new Date().toISOString().split('T')[0],
      note,
      memberId,
      memberName: targetMember?.name || 'Member',
      paymentMethod,
      status: 'completed',
    };
    setTransactions(prev => [newTx, ...prev]);
    saveDatabaseTransaction(newTx).catch(console.error);

    // Create Admin Notification
    const newNotif: AdminNotification = {
      id: `notif-topup-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type: 'payment',
      memberName: targetMember ? targetMember.name : 'Umunyamuryango',
      memberId,
      amount,
      description: note || `Yishyuye Frw ${amount} binyuze kuri ${paymentMethod}`,
      date: new Date().toISOString().split('T')[0],
      isRead: false
    };
    setAdminNotifications(prev => [newNotif, ...prev]);
    saveDatabaseNotification(newNotif).catch(console.error);
  };

  const handleWithdrawWallet = (memberId: string, amount: number, paymentMethod: 'MoMo' | 'Airtel' | 'Bank', note: string) => {
    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        const updated = { ...m, walletBalance: Math.max(0, m.walletBalance - amount) };
        saveDatabaseMember(updated).catch(console.error);
        return updated;
      }
      return m;
    }));
    
    const targetMember = members.find(m => m.id === memberId);
    const newTx: Transaction = {
      id: `tx-withdraw-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      goalId: 'wallet',
      goalTitle: 'Wallet Withdrawal',
      type: 'withdraw',
      amount,
      date: new Date().toISOString().split('T')[0],
      note,
      memberId,
      memberName: targetMember?.name || 'Member',
      paymentMethod,
      status: 'completed',
    };
    setTransactions(prev => [newTx, ...prev]);
    saveDatabaseTransaction(newTx).catch(console.error);
  };

  const handleTransferWalletToGoal = (memberId: string, goalId: string, amount: number) => {
    const targetGoal = goals.find(g => g.id === goalId);
    const targetMember = members.find(m => m.id === memberId);
    if (!targetGoal || !targetMember) return;

    // Deduct from member wallet balance and increment member total saved
    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        const updated = { 
          ...m, 
          walletBalance: Math.max(0, m.walletBalance - amount),
          totalSaved: m.totalSaved + amount
        };
        saveDatabaseMember(updated).catch(console.error);
        return updated;
      }
      return m;
    }));

    // Add to goal currentAmount
    setGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        const updated = { ...g, currentAmount: g.currentAmount + amount };
        saveDatabaseGoal(updated).catch(console.error);
        return updated;
      }
      return g;
    }));

    // Record Transaction
    const newTx: Transaction = {
      id: `tx-transfer-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      goalId,
      goalTitle: targetGoal.title,
      type: 'transfer',
      amount,
      date: new Date().toISOString().split('T')[0],
      note: `Transfer from Wallet to ${targetGoal.title}`,
      memberId,
      memberName: targetMember.name,
      paymentMethod: 'Wallet',
      status: 'completed',
    };
    setTransactions(prev => [newTx, ...prev]);
    saveDatabaseTransaction(newTx).catch(console.error);
  };

  // Add Goal Handler
  const handleAddGoal = (newGoalData: Omit<SavingsGoal, 'id' | 'createdAt' | 'currentAmount'>) => {
    const newGoal: SavingsGoal = {
      ...newGoalData,
      id: `goal-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      currentAmount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      memberId: currentMember.id,
    };
    setGoals(prev => [newGoal, ...prev]);
    saveDatabaseGoal(newGoal).catch(console.error);
  };

  // Deposit Handler
  const handleDeposit = (goalId: string, amount: number, note: string) => {
    const targetGoal = goals.find(g => g.id === goalId);
    if (!targetGoal) return;

    // Update Goal Amount
    setGoals(prev =>
      prev.map(g => {
        if (g.id === goalId) {
          const updatedGoal = { ...g, currentAmount: g.currentAmount + amount };
          saveDatabaseGoal(updatedGoal).catch(console.error);
          return updatedGoal;
        }
        return g;
      })
    );

    // Update Member total saved
    setMembers(prev => prev.map(m => {
      if (m.id === currentMember.id) {
        const updatedMember = { ...m, totalSaved: m.totalSaved + amount };
        saveDatabaseMember(updatedMember).catch(console.error);
        return updatedMember;
      }
      return m;
    }));

    // Add Transaction
    const newTx: Transaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      goalId,
      goalTitle: targetGoal.title,
      type: 'deposit',
      amount,
      date: new Date().toISOString().split('T')[0],
      note,
      memberId: currentMember.id,
      memberName: currentMember.name,
      paymentMethod: 'MoMo',
      status: 'completed',
    };
    setTransactions(prev => [newTx, ...prev]);
    saveDatabaseTransaction(newTx).catch(console.error);
  };

  // Withdraw Handler
  const handleWithdraw = (goalId: string, amount: number, note: string) => {
    const targetGoal = goals.find(g => g.id === goalId);
    if (!targetGoal) return;

    // Update Goal Amount
    setGoals(prev =>
      prev.map(g => {
        if (g.id === goalId) {
          const updatedGoal = { ...g, currentAmount: Math.max(0, g.currentAmount - amount) };
          saveDatabaseGoal(updatedGoal).catch(console.error);
          return updatedGoal;
        }
        return g;
      })
    );

    // Add Transaction
    const newTx: Transaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      goalId,
      goalTitle: targetGoal.title,
      type: 'withdraw',
      amount,
      date: new Date().toISOString().split('T')[0],
      note,
      memberId: currentMember.id,
      memberName: currentMember.name,
      paymentMethod: 'MoMo',
      status: 'completed',
    };
    setTransactions(prev => [newTx, ...prev]);
    saveDatabaseTransaction(newTx).catch(console.error);
  };

  // Delete Goal Handler
  const handleDeleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
    deleteDatabaseGoal(goalId).catch(console.error);
  };

  // Challenge Toggle Handler
  const handleToggleChallengeDay = (dayNumber: number) => {
    setChallengeDays(prev =>
      prev.map(d => {
        if (d.dayNumber === dayNumber) {
          const nextCompleted = !d.completed;
          const dateStr = nextCompleted ? new Date().toISOString().split('T')[0] : undefined;
          
          if (nextCompleted) {
            const newTx: Transaction = {
              id: `tx-challenge-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              goalId: 'general',
              goalTitle: `Challenge Day ${dayNumber}`,
              type: 'deposit',
              amount: d.amount,
              date: dateStr || new Date().toISOString().split('T')[0],
              note: `Umukoro w'Ubwizigame Day ${dayNumber}`,
              memberId: currentMember.id,
              memberName: currentMember.name,
              paymentMethod: 'MoMo',
              status: 'completed',
            };
            setTransactions(t => [newTx, ...t]);
            saveDatabaseTransaction(newTx).catch(console.error);
          }

          saveDatabaseChallengeDay(dayNumber, nextCompleted, dateStr, currentMember.id).catch(console.error);

          return {
            ...d,
            completed: nextCompleted,
            completedAt: dateStr,
          };
        }
        return d;
      })
    );
  };

  const handleResetChallenge = () => {
    setChallengeDays(generateInitialChallengeDays());
    resetDatabaseChallenge(currentMember.id).catch(console.error);
  };

  // Export Data Handler
  const handleExportData = () => {
    const exportObj = {
      exportDate: new Date().toISOString(),
      totalSavedRWF,
      members,
      goals,
      transactions,
      challengeDays,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ubwizigame_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (!isLoggedIn) {
    return (
      <AuthScreen
        members={members}
        onLogin={handleLogin}
        onSignup={handleSignup}
        onUpdatePin={handleUpdateMemberPin}
        language={language}
        currency={currency}
      />
    );
  }

  return (
    <div className={`min-h-screen font-sans selection:bg-blue-700 selection:text-white flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100 dark' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Header */}
      <Header
        language={language}
        setLanguage={setLanguage}
        currency={currency}
        setCurrency={setCurrency}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'info') setViewedProfileMemberId(null);
          setActiveTab(tab);
        }}
        totalSavedRWF={totalSavedRWF}
        currentMember={currentMember}
        onLogout={handleLogout}
        onViewProfile={handleViewProfile}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28 sm:pb-36 space-y-8">
        
        {activeTab === 'overview' && (
          <OverviewCards
            currentMember={currentMember}
            members={members}
            goals={goals}
            transactions={transactions}
            challengeDays={challengeDays}
            posts={userPosts}
            onEditPost={handleEditPost}
            onDeletePost={handleDeletePost}
            onLikePost={handleLikePost}
            onCommentPost={handleCommentPost}
            onSharePost={handleSharePost}
            onRepostPost={handleRepostPost}
            language={language}
            currency={currency}
            onOpenAddGoal={() => {
              setActiveTab('goals');
              setShowAddModal(true);
            }}
            onOpenDeposit={(goalId) => {
              setActiveTab('goals');
              if (goalId) setSelectedDepositGoalId(goalId);
              else if (goals.length > 0) setSelectedDepositGoalId(goals[0].id);
              else setShowAddModal(true);
            }}
            setActiveTab={(tab) => {
              if (tab === 'info') setViewedProfileMemberId(null);
              setActiveTab(tab);
            }}
            onViewProfile={handleViewProfile}
          />
        )}

        {activeTab === 'goals' && (
          <GoalsSection
            goals={goals}
            language={language}
            currency={currency}
            onAddGoal={handleAddGoal}
            onDeposit={handleDeposit}
            onWithdraw={handleWithdraw}
            onDeleteGoal={handleDeleteGoal}
            showAddModal={showAddModal}
            setShowAddModal={setShowAddModal}
            selectedDepositGoalId={selectedDepositGoalId}
            setSelectedDepositGoalId={setSelectedDepositGoalId}
          />
        )}

        {activeTab === 'challenge' && (
          <SavingsChallenge
            challengeDays={challengeDays}
            onToggleDay={handleToggleChallengeDay}
            onResetChallenge={handleResetChallenge}
            language={language}
            currency={currency}
          />
        )}

        {activeTab === 'info' && (
          <InfoPage
            currentMember={currentMember}
            viewedMember={viewedProfileMemberId ? members.find(m => m.id === viewedProfileMemberId) || currentMember : currentMember}
            posts={userPosts}
            onAddPost={handleAddPost}
            onEditPost={handleEditPost}
            onDeletePost={handleDeletePost}
            onLikePost={handleLikePost}
            onCommentPost={handleCommentPost}
            onSharePost={handleSharePost}
            onRepostPost={handleRepostPost}
            onUpdateMemberAvatar={handleUpdateMemberAvatar}
            language={language}
            onStartChat={handleStartChat}
            onBackToMyProfile={() => setViewedProfileMemberId(null)}
            onViewProfile={handleViewProfile}
          />
        )}

        {activeTab === 'chat' && (
          <PrivateChat
            currentMember={currentMember}
            members={members}
            messages={chatMessages}
            onSendMessage={handleSendChatMessage}
            onEditMessage={handleEditChatMessage}
            onDeleteMessage={handleDeleteChatMessage}
            language={language}
            initialRecipientId={selectedChatRecipientId}
            onViewProfile={handleViewProfile}
          />
        )}


        {activeTab === 'wallet' && (
          <WalletPage
            currentMember={currentMember}
            members={members}
            setCurrentMemberId={setCurrentMemberId}
            goals={goals}
            transactions={transactions}
            ledgerRecords={ledgerRecords}
            onAddLedgerRecord={handleAddLedgerRecord}
            onUpdateLedgerRecord={handleUpdateLedgerRecord}
            onDeleteLedgerRecord={handleDeleteLedgerRecord}
            language={language}
            currency={currency}
            onTopUpWallet={handleTopUpWallet}
            onLoanRequest={handleLoanRequest}
            onTransferWalletToGoal={handleTransferWalletToGoal}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            members={members}
            goals={goals}
            transactions={transactions}
            language={language}
            currency={currency}
            isAdminUnlocked={isAdminUnlocked}
            setIsAdminUnlocked={setIsAdminUnlocked}
            onAddMember={handleAddMember}
            onUpdateMember={handleUpdateMember}
            onDeleteMember={handleDeleteMember}
            onAdminDepositToWallet={handleAdminDepositToWallet}
            onAdminWithdrawFromWallet={handleAdminWithdrawFromWallet}
            notifications={adminNotifications}
            onMarkNotifAsRead={handleMarkNotifAsRead}
            onClearNotif={handleClearNotif}
            onApproveLoanRequest={handleApproveLoanRequest}
            onShareLoanRequest={handleShareLoanRequest}
            onApproveNewUser={handleApproveNewUser}
            onRejectNewUser={handleRejectNewUser}
          />
        )}

        {activeTab === 'privacy' && (
          <PrivacyPolicy
            language={language}
            onBack={() => setActiveTab('overview')}
          />
        )}

        {activeTab === 'about' && (
          <AboutUs
            language={language}
          />
        )}

        {activeTab === 'budget' && (
          <BudgetCalculator
            language={language}
            currency={currency}
            onAddGoal={handleAddGoal}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'ai-advisor' && (
          <AiAdvisor
            goals={goals}
            language={language}
            currency={currency}
            onAddGoal={handleAddGoal}
          />
        )}

        {activeTab === 'history' && (
          <AnalyticsAndHistory
            transactions={transactions}
            goals={goals}
            language={language}
            currency={currency}
            onExportData={handleExportData}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500 shadow-sm mb-16 sm:mb-20">
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="text-left">
              <span className="font-extrabold text-slate-900 block mb-0.5">
                {language === 'rw' ? 'TUVUGISHE (CONTACT US)' : 'CONTACT US'}
              </span>
              <p className="text-slate-600 font-medium leading-relaxed">
                📞 {language === 'rw' ? 'Telefone: +250 788 123 456 / +250 782 999 000' : 'Phone: +250 788 123 456 / +250 782 999 000'} <br />
                ✉️ {language === 'rw' ? 'Imeri: contact@tuzamuranetetero.rw' : 'Email: contact@tuzamuranetetero.rw'} <br />
                📍 {language === 'rw' ? 'Ibiro: Nyarugenge, KN 2 St, Kigali, Rwanda' : 'Office: Nyarugenge, KN 2 St, Kigali, Rwanda'}
              </p>
            </div>
            <div className="text-right sm:text-right text-slate-400 font-semibold space-y-1">
              <button 
                onClick={() => setActiveTab('privacy')}
                className="text-blue-700 hover:underline font-extrabold text-xs block"
              >
                {language === 'rw' ? 'Soma Amategeko ya Privacy' : 'Read Privacy Policy'}
              </button>
              <span>{language === 'rw' ? 'Kuvugurura: Buri gihe • Umutekano Wizewe' : 'Updates: Constant • Bank-grade Security'}</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
            <span>© 2026 Ubwizigame - Professional Financial Services Rwanda</span>
            <span className="font-medium text-slate-600">Umutekano n'Inyungu Nyabyo 🇷🇼</span>
          </div>
        </div>
      </footer>

      {/* Sticky Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'info') setViewedProfileMemberId(null);
          setActiveTab(tab);
        }}
        language={language}
        setLanguage={setLanguage}
        currency={currency}
        setCurrency={setCurrency}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        currentMember={currentMember}
        onLogout={handleLogout}
        goals={goals}
        challengeDays={challengeDays}
      />

    </div>
  );
}

