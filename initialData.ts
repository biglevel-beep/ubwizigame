import { SavingsGoal, Transaction, SavingsChallengeDay, Member, MemberLedgerRecord } from '../types';

export const initialMembers: Member[] = [
  {
    id: 'mem-1',
    name: 'Jean Paul Habimana',
    phone: '+250 788 123 456',
    nationalId: '1 1992 8 0045123 0 45',
    email: 'j.habimana@gmail.com',
    accountNumber: 'IGH-2026-001',
    walletBalance: 150000,
    totalSaved: 680000,
    status: 'active',
    role: 'admin',
    joinedDate: '2025-01-10',
    groupName: 'TUZAMURANE TETERO',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    notes: 'Admin TUZAMURANE TETERO',
  },
  {
    id: 'mem-2',
    name: 'Marie Claire Mukamana',
    phone: '+250 785 987 654',
    nationalId: '1 1995 7 0012890 1 12',
    email: 'm.mukamana@yahoo.fr',
    accountNumber: 'IGH-2026-002',
    walletBalance: 85000,
    totalSaved: 1100000,
    status: 'active',
    role: 'admin',
    joinedDate: '2025-02-15',
    groupName: 'UMUHUZA TETERO',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    notes: 'Admin UMUHUZA TETERO',
  },
  {
    id: 'mem-3',
    name: 'Eric Nshimiyimana',
    phone: '+250 783 456 789',
    nationalId: '1 1988 8 0098234 0 88',
    email: 'eric.nshimi@hotmail.com',
    accountNumber: 'IGH-2026-003',
    walletBalance: 40000,
    totalSaved: 320000,
    status: 'active',
    role: 'member',
    joinedDate: '2025-03-01',
    groupName: 'TUZAMURANE TETERO',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
    notes: 'Ubucuruzi bw\'imyenda',
  },
  {
    id: 'mem-4',
    name: 'Divine Keza Uwase',
    phone: '+250 789 222 333',
    nationalId: '1 1999 7 0034112 0 09',
    email: 'divine.keza@gmail.com',
    accountNumber: 'IGH-2026-004',
    walletBalance: 120000,
    totalSaved: 180000,
    status: 'pending',
    role: 'member',
    joinedDate: '2026-06-20',
    groupName: 'UMUHUZA TETERO',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    notes: 'Saba kwinjira mu itsinda rya UMUHUZA TETERO',
  }
];

export const initialGoals: SavingsGoal[] = [
  {
    id: 'goal-1',
    title: 'Ikegera cy\'Ubutabazi (Emergency Fund)',
    targetAmount: 600000,
    currentAmount: 250000,
    category: 'emergency',
    targetDate: '2026-12-31',
    createdAt: '2026-01-15',
    icon: 'ShieldAlert',
    notes: 'Amezi 3 y\'ibyibanze mu buzima mu gihe cy\'ubutabazi.',
    memberId: 'mem-1',
  },
  {
    id: 'goal-2',
    title: 'Kugura Isambu / Inzu (Housing & Land)',
    targetAmount: 3500000,
    currentAmount: 1100000,
    category: 'housing',
    targetDate: '2027-06-30',
    createdAt: '2026-02-01',
    icon: 'Home',
    notes: 'Avance yo kugura isambu muri Kigali / Bugesera.',
    memberId: 'mem-2',
  },
  {
    id: 'goal-3',
    title: 'Amashuri y\'Ukwezi Guhasa (School Fees)',
    targetAmount: 300000,
    currentAmount: 180000,
    category: 'education',
    targetDate: '2026-09-01',
    createdAt: '2026-03-10',
    icon: 'GraduationCap',
    notes: 'Ishuri n\'iboresho by\'abana.',
    memberId: 'mem-1',
  },
  {
    id: 'goal-4',
    title: 'Gufungura Ubucuruzi Muto (Small Business)',
    targetAmount: 800000,
    currentAmount: 320000,
    category: 'business',
    targetDate: '2026-11-15',
    createdAt: '2026-04-05',
    icon: 'Briefcase',
    notes: 'Igishoro cy\'ubucuruzi bwa boutique cyangwa ubuhinzi.',
    memberId: 'mem-3',
  },
];

export const initialTransactions: Transaction[] = [
  {
    id: 'tx-1',
    goalId: 'goal-1',
    goalTitle: 'Ikegera cy\'Ubutabazi (Emergency Fund)',
    type: 'deposit',
    amount: 100000,
    date: '2026-07-01',
    note: 'Iza ku muhembo w\'ukwezi kwa 6',
    memberId: 'mem-1',
    memberName: 'Jean Paul Habimana',
    paymentMethod: 'MoMo',
    status: 'completed',
  },
  {
    id: 'tx-2',
    goalId: 'goal-2',
    goalTitle: 'Kugura Isambu / Inzu (Housing & Land)',
    type: 'deposit',
    amount: 250000,
    date: '2026-07-10',
    note: 'Inyungu z\'ubucuruzi',
    memberId: 'mem-2',
    memberName: 'Marie Claire Mukamana',
    paymentMethod: 'Bank',
    status: 'completed',
  },
  {
    id: 'tx-3',
    goalId: 'goal-3',
    goalTitle: 'Amashuri y\'Ukwezi Guhasa (School Fees)',
    type: 'deposit',
    amount: 50000,
    date: '2026-07-15',
    note: 'Ubwizigame w\'icyumweru',
    memberId: 'mem-1',
    memberName: 'Jean Paul Habimana',
    paymentMethod: 'MoMo',
    status: 'completed',
  },
  {
    id: 'tx-4',
    goalId: 'goal-4',
    goalTitle: 'Gufungura Ubucuruzi Muto (Small Business)',
    type: 'deposit',
    amount: 70000,
    date: '2026-07-20',
    note: 'Bika kuri Mobile Money',
    memberId: 'mem-3',
    memberName: 'Eric Nshimiyimana',
    paymentMethod: 'Airtel',
    status: 'completed',
  },
];


// 30 day incremental savings challenge (Day 1: 500 Frw, Day 2: 1000 Frw, Day 3: 1500 Frw...)
export const generateInitialChallengeDays = (): SavingsChallengeDay[] => {
  const days: SavingsChallengeDay[] = [];
  for (let i = 1; i <= 30; i++) {
    days.push({
      dayNumber: i,
      amount: i * 500, // 500 RWF increment per day
      completed: i <= 5, // First 5 days pre-completed as example
      completedAt: i <= 5 ? `2026-07-2${i}` : undefined,
    });
  }
  return days;
};

export const initialChatMessages = [
  {
    id: 'msg-1',
    senderId: 'mem-2', // Marie Claire
    recipientId: 'mem-1', // Jean Paul
    text: 'Muraho Mwalimu Jean Paul! Bya kwa nyuma kuri gahunda y’ubwizigame bw’inzu biriko biragenda neza.',
    timestamp: '2026-07-26 18:30',
    isRead: true,
  },
  {
    id: 'msg-2',
    senderId: 'mem-1', // Jean Paul
    recipientId: 'mem-2', // Marie Claire
    text: 'Muraho cyane Marie Claire! Amakuru meza, twabonye umusanzu wawe wa 250,000 Frw. Komeza uwo muhate!',
    timestamp: '2026-07-26 18:35',
    isRead: true,
  },
  {
    id: 'msg-3',
    senderId: 'mem-3', // Eric
    recipientId: 'mem-1', // Jean Paul
    text: 'Mwiriwe Chairman! Nashakaga kubaza niba Mobile Money yanjye yakiriwe ku mukoro w’icyumweru.',
    timestamp: '2026-07-26 19:10',
    isRead: false,
  },
];

export const initialUserPosts = [
  {
    id: 'post-1',
    authorId: 'mem-1',
    authorName: 'Jean Paul Habimana',
    authorAvatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    content: '🎉 Nshimiye abanyamuryango bose bitabiriye icyumweru cy’ubwizigame! Tugeze kuri 85% by’intego yacu y’ukwezi mu kimina. Komeza umurate n’umurava!',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0a675409b7cc?auto=format&fit=crop&q=80&w=800',
    createdAt: '2026-07-26 20:00',
    likes: 12,
    likedBy: ['mem-2', 'mem-3'],
    category: 'announcement' as const,
    comments: [
      {
        id: 'c-1',
        authorId: 'mem-2',
        authorName: 'Marie Claire Uwase',
        authorAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        content: 'Bravo cyane ku banyamuryango bose! Umurava ni wose.',
        createdAt: '2026-07-26 20:15'
      },
      {
        id: 'c-2',
        authorId: 'mem-3',
        authorName: 'Eric Nshimiyimana',
        authorAvatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
        content: 'Imana iguhe umugisha Chairman!',
        createdAt: '2026-07-26 20:30'
      }
    ],
    sharesCount: 3
  },
  {
    id: 'post-2',
    authorId: 'mem-2',
    authorName: 'Marie Claire Uwase',
    authorAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    content: '🏡 Kuri uyu munsi nabashije kuzigama 250,000 Frw ku intego yanjye y’Inzu y’Iruhande! Ndashimira ikimina na Wallet yacu irimo kudufasha kwizigamira neza.',
    imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800',
    createdAt: '2026-07-26 17:45',
    likes: 8,
    likedBy: ['mem-1'],
    category: 'achievement' as const,
    comments: [
      {
        id: 'c-3',
        authorId: 'mem-1',
        authorName: 'Jean Paul Habimana',
        authorAvatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
        content: 'Komeza utere imbere Marie Claire!',
        createdAt: '2026-07-26 18:00'
      }
    ],
    sharesCount: 2
  },
  {
    id: 'post-3',
    authorId: 'mem-3',
    authorName: 'Eric Niyonzima',
    authorAvatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
    content: '🚀 Nashyizeho intego nshya y’Ubucuruzi bw’Imyenda. Ndasaba inshuti z’ikimina kunyunganira mu bitekerezo no kuntera inkunga!',
    createdAt: '2026-07-25 14:20',
    likes: 5,
    likedBy: [],
    category: 'update' as const,
    comments: [],
    sharesCount: 1
  }
];

export const initialLedgerRecords: MemberLedgerRecord[] = [
  {
    id: 'rec-1',
    memberId: 'mem-1',
    memberName: 'Jean Paul Habimana',
    date: '2026-06-01',
    savings: 50000,
    totalSavings: 630000,
    loanAmount: 200000,
    paidAmount: 150000,
    remainingLoan: 50000,
    notes: 'Ubwizigame bw\'ukwezi kwa 6 n\'inguzanyo',
    createdAt: '2026-06-01T10:00:00Z',
  },
  {
    id: 'rec-2',
    memberId: 'mem-1',
    memberName: 'Jean Paul Habimana',
    date: '2026-07-01',
    savings: 50000,
    totalSavings: 680000,
    loanAmount: 200000,
    paidAmount: 200000,
    remainingLoan: 0,
    notes: 'Ubwizigame bw\'ukwezi kwa 7 + kwishyura inguzanyo yose',
    createdAt: '2026-07-01T10:00:00Z',
  },
  {
    id: 'rec-3',
    memberId: 'mem-2',
    memberName: 'Marie Claire Mukamana',
    date: '2026-06-15',
    savings: 100000,
    totalSavings: 1000000,
    loanAmount: 500000,
    paidAmount: 200000,
    remainingLoan: 300000,
    notes: 'Inguzanyo yo kwagura inzu',
    createdAt: '2026-06-15T10:00:00Z',
  },
  {
    id: 'rec-4',
    memberId: 'mem-2',
    memberName: 'Marie Claire Mukamana',
    date: '2026-07-15',
    savings: 100000,
    totalSavings: 1100000,
    loanAmount: 500000,
    paidAmount: 350000,
    remainingLoan: 150000,
    notes: 'Kwishyura inguzanyo y\'ikimina',
    createdAt: '2026-07-15T10:00:00Z',
  },
  {
    id: 'rec-5',
    memberId: 'mem-3',
    memberName: 'Eric Nshimiyimana',
    date: '2026-07-10',
    savings: 40000,
    totalSavings: 320000,
    loanAmount: 100000,
    paidAmount: 40000,
    remainingLoan: 60000,
    notes: 'Ubwizigame bw\'ukwezi kwa 7',
    createdAt: '2026-07-10T10:00:00Z',
  }
];

