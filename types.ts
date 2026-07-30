export type Language = 'rw' | 'en';
export type Currency = 'RWF' | 'USD';

export type SavingsGoalCategory = 
  | 'business' 
  | 'housing' 
  | 'education' 
  | 'agriculture' 
  | 'emergency' 
  | 'vehicle' 
  | 'travel' 
  | 'general';

export interface Member {
  id: string;
  name: string;
  phone: string;
  nationalId: string;
  email: string;
  accountNumber: string;
  walletBalance: number;
  totalSaved: number;
  status: 'active' | 'pending' | 'suspended';
  role: 'member' | 'admin';
  joinedDate: string;
  groupName?: 'TUZAMURANE TETERO' | 'UMUHUZA TETERO' | string;
  avatarUrl?: string;
  notes?: string;
  pin?: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  category: SavingsGoalCategory;
  targetDate: string; // YYYY-MM-DD
  createdAt: string;
  icon?: string;
  monthlyAutoDeposit?: number;
  notes?: string;
  isCompleted?: boolean;
  memberId?: string;
}

export interface Transaction {
  id: string;
  goalId: string | 'general' | 'wallet';
  goalTitle: string;
  type: 'deposit' | 'withdraw' | 'interest' | 'transfer';
  amount: number;
  date: string; // ISO string or YYYY-MM-DD
  note: string;
  memberId?: string;
  memberName?: string;
  paymentMethod?: 'MoMo' | 'Airtel' | 'Bank' | 'Cash' | 'Wallet';
  status?: 'completed' | 'pending' | 'failed';
}

export interface SavingsChallengeDay {
  dayNumber: number;
  amount: number;
  completed: boolean;
  completedAt?: string;
}

export interface BudgetProfile {
  monthlyIncome: number;
  monthlyExpenses: number;
  emergencyFundMonths: number;
  savingsPercentageGoal: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  recipientId: string;
  text: string;
  timestamp: string;
  isRead?: boolean;
  audioUrl?: string;
  audioDuration?: number;
  isEdited?: boolean;
  isDeleted?: boolean;
}

export interface PostComment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  content: string;
  createdAt: string;
}

export interface MemberLedgerRecord {
  id: string;
  memberId: string;
  memberName: string;
  date: string; // YYYY-MM-DD
  savings: number; // Ubwizigame
  totalSavings: number; // Nayo agejejemwo
  loanAmount: number; // Inguzanyo
  paidAmount: number; // Ayishyuwe
  remainingLoan: number; // Nayasigaje kwishyura
  notes?: string;
  createdAt: string;
}

export interface UserPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  likes: number;
  likedBy: string[];
  category?: 'announcement' | 'update' | 'achievement' | 'general';
  comments?: PostComment[];
  sharesCount?: number;
  isRepost?: boolean;
  originalAuthorId?: string;
  originalAuthorName?: string;
  originalAuthorAvatarUrl?: string;
  originalPostId?: string;
}

export interface AdminNotification {
  id: string;
  type: 'payment' | 'loan_request' | 'new_user_registration';
  memberName: string;
  memberId: string;
  groupName?: string;
  amount: number;
  description: string;
  date: string;
  isRead: boolean;
  isApproved?: boolean;
  isRejected?: boolean;
  isShared?: boolean;
}


