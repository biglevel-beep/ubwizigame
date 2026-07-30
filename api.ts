import { Member, SavingsGoal, Transaction, SavingsChallengeDay, UserPost, ChatMessage, MemberLedgerRecord, AdminNotification } from '../types';

export interface SyncDataResponse {
  members: Member[];
  goals: SavingsGoal[];
  transactions: Transaction[];
  challengeDays: SavingsChallengeDay[];
  posts: UserPost[];
  chatMessages: ChatMessage[];
  ledgerRecords: MemberLedgerRecord[];
  notifications: AdminNotification[];
}

export async function fetchDatabaseSync(): Promise<SyncDataResponse> {
  const res = await fetch('/api/db/sync');
  if (!res.ok) {
    throw new Error('Failed to sync database data');
  }
  return res.json();
}

export async function saveDatabaseMember(member: Member): Promise<void> {
  await fetch('/api/db/members', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(member),
  });
}

export async function saveDatabaseGoal(goal: SavingsGoal): Promise<void> {
  await fetch('/api/db/goals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(goal),
  });
}

export async function deleteDatabaseGoal(id: string): Promise<void> {
  await fetch(`/api/db/goals/${id}`, {
    method: 'DELETE',
  });
}

export async function saveDatabaseTransaction(tx: Transaction): Promise<void> {
  await fetch('/api/db/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tx),
  });
}

export async function saveDatabaseChallengeDay(dayNumber: number, completed: boolean, completedAt?: string, memberId?: string): Promise<void> {
  await fetch('/api/db/challenge-days', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dayNumber, completed, completedAt, memberId }),
  });
}

export async function resetDatabaseChallenge(memberId?: string): Promise<void> {
  await fetch('/api/db/challenge-days/reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ memberId }),
  });
}

export async function saveDatabasePost(post: UserPost): Promise<void> {
  await fetch('/api/db/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(post),
  });
}

export async function addDatabasePostComment(postId: string, comment: any): Promise<void> {
  await fetch(`/api/db/posts/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(comment),
  });
}

export async function saveDatabaseChatMessage(msg: ChatMessage): Promise<void> {
  await fetch('/api/db/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(msg),
  });
}

export async function saveDatabaseLedgerRecord(record: MemberLedgerRecord): Promise<void> {
  await fetch('/api/db/ledger', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(record),
  });
}

export async function saveDatabaseNotification(notif: AdminNotification): Promise<void> {
  await fetch('/api/db/notifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(notif),
  });
}
