import { pgTable, text, integer, doublePrecision, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const members = pgTable('members', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  nationalId: text('national_id').notNull(),
  email: text('email').notNull(),
  accountNumber: text('account_number').notNull(),
  walletBalance: doublePrecision('wallet_balance').notNull().default(0),
  totalSaved: doublePrecision('total_saved').notNull().default(0),
  status: text('status').notNull().default('active'),
  role: text('role').notNull().default('member'),
  joinedDate: text('joined_date').notNull(),
  groupName: text('group_name'),
  avatarUrl: text('avatar_url'),
  notes: text('notes'),
  pin: text('pin'),
});

export const savingsGoals = pgTable('savings_goals', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  targetAmount: doublePrecision('target_amount').notNull(),
  currentAmount: doublePrecision('current_amount').notNull().default(0),
  category: text('category').notNull().default('general'),
  targetDate: text('target_date').notNull(),
  createdAt: text('created_at').notNull(),
  icon: text('icon'),
  monthlyAutoDeposit: doublePrecision('monthly_auto_deposit'),
  notes: text('notes'),
  isCompleted: boolean('is_completed').default(false),
  memberId: text('member_id'),
});

export const transactions = pgTable('transactions', {
  id: text('id').primaryKey(),
  goalId: text('goal_id').notNull(),
  goalTitle: text('goal_title').notNull(),
  type: text('type').notNull(), // 'deposit' | 'withdraw' | 'interest' | 'transfer'
  amount: doublePrecision('amount').notNull(),
  date: text('date').notNull(),
  note: text('note').notNull().default(''),
  memberId: text('member_id'),
  memberName: text('member_name'),
  paymentMethod: text('payment_method'),
  status: text('status').default('completed'),
});

export const savingsChallengeDays = pgTable('savings_challenge_days', {
  id: text('id').primaryKey(),
  memberId: text('member_id').notNull().default('mem-1'),
  dayNumber: integer('day_number').notNull(),
  amount: doublePrecision('amount').notNull(),
  completed: boolean('completed').notNull().default(false),
  completedAt: text('completed_at'),
});

export const memberLedgerRecords = pgTable('member_ledger_records', {
  id: text('id').primaryKey(),
  memberId: text('member_id').notNull(),
  memberName: text('member_name').notNull(),
  date: text('date').notNull(),
  savings: doublePrecision('savings').notNull().default(0),
  totalSavings: doublePrecision('total_savings').notNull().default(0),
  loanAmount: doublePrecision('loan_amount').notNull().default(0),
  paidAmount: doublePrecision('paid_amount').notNull().default(0),
  remainingLoan: doublePrecision('remaining_loan').notNull().default(0),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
});

export const userPosts = pgTable('user_posts', {
  id: text('id').primaryKey(),
  authorId: text('author_id').notNull(),
  authorName: text('author_name').notNull(),
  authorAvatarUrl: text('author_avatar_url'),
  content: text('content').notNull(),
  imageUrl: text('image_url'),
  createdAt: text('created_at').notNull(),
  likes: integer('likes').notNull().default(0),
  likedBy: jsonb('liked_by').$type<string[]>().notNull().default([]),
  category: text('category').default('general'),
  sharesCount: integer('shares_count').default(0),
  isRepost: boolean('is_repost').default(false),
  originalAuthorId: text('original_author_id'),
  originalAuthorName: text('original_author_name'),
  originalAuthorAvatarUrl: text('original_author_avatar_url'),
  originalPostId: text('original_post_id'),
});

export const postComments = pgTable('post_comments', {
  id: text('id').primaryKey(),
  postId: text('post_id').notNull(),
  authorId: text('author_id').notNull(),
  authorName: text('author_name').notNull(),
  authorAvatarUrl: text('author_avatar_url'),
  content: text('content').notNull(),
  createdAt: text('created_at').notNull(),
});

export const chatMessages = pgTable('chat_messages', {
  id: text('id').primaryKey(),
  senderId: text('sender_id').notNull(),
  recipientId: text('recipient_id').notNull(),
  text: text('text').notNull(),
  timestamp: text('timestamp').notNull(),
  isRead: boolean('is_read').default(false),
  audioUrl: text('audio_url'),
  audioDuration: doublePrecision('audio_duration'),
  isEdited: boolean('is_edited').default(false),
  isDeleted: boolean('is_deleted').default(false),
});

export const adminNotifications = pgTable('admin_notifications', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  memberName: text('member_name').notNull(),
  memberId: text('member_id').notNull(),
  groupName: text('group_name'),
  amount: doublePrecision('amount').notNull().default(0),
  description: text('description').notNull(),
  date: text('date').notNull(),
  isRead: boolean('is_read').notNull().default(false),
  isApproved: boolean('is_approved'),
  isRejected: boolean('is_rejected'),
  isShared: boolean('is_shared'),
});
