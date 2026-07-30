import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { db } from "./src/db/index.ts";
import {
  members,
  savingsGoals,
  transactions,
  savingsChallengeDays,
  memberLedgerRecords,
  userPosts,
  postComments,
  chatMessages,
  adminNotifications
} from "./src/db/schema.ts";
import { eq, desc } from "drizzle-orm";
import {
  initialMembers,
  initialGoals,
  initialTransactions,
  generateInitialChallengeDays,
  initialChatMessages,
  initialUserPosts,
  initialLedgerRecords
} from "./src/data/initialData.ts";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Helper to seed database with initial default data if empty
async function seedDatabaseIfEmpty() {
  try {
    const existingMembers = await db.select().from(members);
    if (existingMembers.length === 0) {
      console.log("Seeding Cloud SQL database with initial default data...");
      
      // Seed members
      for (const m of initialMembers) {
        await db.insert(members).values({
          id: m.id,
          name: m.name,
          phone: m.phone,
          nationalId: m.nationalId,
          email: m.email,
          accountNumber: m.accountNumber,
          walletBalance: m.walletBalance,
          totalSaved: m.totalSaved,
          status: m.status,
          role: m.role,
          joinedDate: m.joinedDate,
          groupName: m.groupName,
          avatarUrl: m.avatarUrl,
          notes: m.notes,
          pin: m.pin,
        }).onConflictDoNothing();
      }

      // Seed goals
      for (const g of initialGoals) {
        await db.insert(savingsGoals).values({
          id: g.id,
          title: g.title,
          targetAmount: g.targetAmount,
          currentAmount: g.currentAmount,
          category: g.category,
          targetDate: g.targetDate,
          createdAt: g.createdAt,
          icon: g.icon,
          notes: g.notes,
          memberId: g.memberId,
        }).onConflictDoNothing();
      }

      // Seed transactions
      for (const t of initialTransactions) {
        await db.insert(transactions).values({
          id: t.id,
          goalId: t.goalId,
          goalTitle: t.goalTitle,
          type: t.type,
          amount: t.amount,
          date: t.date,
          note: t.note,
          memberId: t.memberId,
          memberName: t.memberName,
          paymentMethod: t.paymentMethod,
          status: t.status,
        }).onConflictDoNothing();
      }

      // Seed challenge days
      const challengeDays = generateInitialChallengeDays();
      for (const cd of challengeDays) {
        await db.insert(savingsChallengeDays).values({
          id: `cd-${cd.dayNumber}`,
          memberId: 'mem-1',
          dayNumber: cd.dayNumber,
          amount: cd.amount,
          completed: cd.completed,
          completedAt: cd.completedAt,
        }).onConflictDoNothing();
      }

      // Seed chat messages
      for (const msg of initialChatMessages) {
        await db.insert(chatMessages).values({
          id: msg.id,
          senderId: msg.senderId,
          recipientId: msg.recipientId,
          text: msg.text,
          timestamp: msg.timestamp,
          isRead: msg.isRead,
        }).onConflictDoNothing();
      }

      // Seed posts & comments
      for (const p of initialUserPosts) {
        await db.insert(userPosts).values({
          id: p.id,
          authorId: p.authorId,
          authorName: p.authorName,
          authorAvatarUrl: p.authorAvatarUrl,
          content: p.content,
          imageUrl: p.imageUrl,
          createdAt: p.createdAt,
          likes: p.likes,
          likedBy: p.likedBy || [],
          category: p.category,
          sharesCount: p.sharesCount || 0,
        }).onConflictDoNothing();

        if (p.comments) {
          for (const c of p.comments) {
            await db.insert(postComments).values({
              id: c.id,
              postId: p.id,
              authorId: c.authorId,
              authorName: c.authorName,
              authorAvatarUrl: c.authorAvatarUrl,
              content: c.content,
              createdAt: c.createdAt,
            }).onConflictDoNothing();
          }
        }
      }

      // Seed ledger records
      for (const rec of initialLedgerRecords) {
        await db.insert(memberLedgerRecords).values({
          id: rec.id,
          memberId: rec.memberId,
          memberName: rec.memberName,
          date: rec.date,
          savings: rec.savings,
          totalSavings: rec.totalSavings,
          loanAmount: rec.loanAmount,
          paidAmount: rec.paidAmount,
          remainingLoan: rec.remainingLoan,
          notes: rec.notes,
          createdAt: rec.createdAt,
        }).onConflictDoNothing();
      }

      console.log("Cloud SQL Database seeding finished!");
    }
  } catch (err) {
    console.error("Error checking or seeding database:", err);
  }
}

// Full Sync API Endpoint
app.get("/api/db/sync", async (req, res) => {
  try {
    await seedDatabaseIfEmpty();

    const allMembers = await db.select().from(members);
    const allGoals = await db.select().from(savingsGoals);
    const allTxs = await db.select().from(transactions);
    const allChallengeDays = await db.select().from(savingsChallengeDays);
    const allPosts = await db.select().from(userPosts);
    const allComments = await db.select().from(postComments);
    const allMessages = await db.select().from(chatMessages);
    const allLedgers = await db.select().from(memberLedgerRecords);
    const allNotifs = await db.select().from(adminNotifications);

    // Group comments into posts
    const postsWithComments = allPosts.map(post => {
      const commentsForPost = allComments.filter(c => c.postId === post.id);
      return {
        ...post,
        comments: commentsForPost,
      };
    });

    res.json({
      members: allMembers,
      goals: allGoals,
      transactions: allTxs,
      challengeDays: allChallengeDays.map(cd => ({
        dayNumber: cd.dayNumber,
        amount: cd.amount,
        completed: cd.completed,
        completedAt: cd.completedAt || undefined,
      })),
      posts: postsWithComments,
      chatMessages: allMessages,
      ledgerRecords: allLedgers,
      notifications: allNotifs,
    });
  } catch (err: any) {
    console.error("Database sync error:", err);
    res.status(500).json({ error: "Failed to sync with database: " + err.message });
  }
});

// Member endpoints
app.post("/api/db/members", async (req, res) => {
  try {
    const m = req.body;
    await db.insert(members).values({
      id: m.id,
      name: m.name,
      phone: m.phone,
      nationalId: m.nationalId,
      email: m.email,
      accountNumber: m.accountNumber,
      walletBalance: m.walletBalance || 0,
      totalSaved: m.totalSaved || 0,
      status: m.status || 'active',
      role: m.role || 'member',
      joinedDate: m.joinedDate || new Date().toISOString().split('T')[0],
      groupName: m.groupName,
      avatarUrl: m.avatarUrl,
      notes: m.notes,
      pin: m.pin,
    }).onConflictDoUpdate({
      target: members.id,
      set: {
        name: m.name,
        phone: m.phone,
        email: m.email,
        walletBalance: m.walletBalance,
        totalSaved: m.totalSaved,
        status: m.status,
        role: m.role,
        groupName: m.groupName,
        avatarUrl: m.avatarUrl,
        notes: m.notes,
        pin: m.pin,
      }
    });

    res.json({ success: true, member: m });
  } catch (err: any) {
    console.error("Save member error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Goals endpoints
app.post("/api/db/goals", async (req, res) => {
  try {
    const g = req.body;
    await db.insert(savingsGoals).values({
      id: g.id,
      title: g.title,
      targetAmount: g.targetAmount,
      currentAmount: g.currentAmount,
      category: g.category || 'general',
      targetDate: g.targetDate,
      createdAt: g.createdAt || new Date().toISOString().split('T')[0],
      icon: g.icon,
      monthlyAutoDeposit: g.monthlyAutoDeposit,
      notes: g.notes,
      isCompleted: g.isCompleted || false,
      memberId: g.memberId,
    }).onConflictDoUpdate({
      target: savingsGoals.id,
      set: {
        title: g.title,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount,
        category: g.category,
        targetDate: g.targetDate,
        icon: g.icon,
        monthlyAutoDeposit: g.monthlyAutoDeposit,
        notes: g.notes,
        isCompleted: g.isCompleted,
      }
    });

    res.json({ success: true, goal: g });
  } catch (err: any) {
    console.error("Save goal error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/db/goals/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(savingsGoals).where(eq(savingsGoals.id, id));
    res.json({ success: true, deletedId: id });
  } catch (err: any) {
    console.error("Delete goal error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Transaction endpoint
app.post("/api/db/transactions", async (req, res) => {
  try {
    const t = req.body;
    await db.insert(transactions).values({
      id: t.id,
      goalId: t.goalId,
      goalTitle: t.goalTitle,
      type: t.type,
      amount: t.amount,
      date: t.date,
      note: t.note || '',
      memberId: t.memberId,
      memberName: t.memberName,
      paymentMethod: t.paymentMethod,
      status: t.status || 'completed',
    }).onConflictDoNothing();

    res.json({ success: true, transaction: t });
  } catch (err: any) {
    console.error("Save transaction error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Savings Challenge endpoints
app.post("/api/db/challenge-days", async (req, res) => {
  try {
    const { dayNumber, completed, completedAt, memberId = 'mem-1' } = req.body;
    const dayId = `cd-${memberId}-${dayNumber}`;
    
    await db.insert(savingsChallengeDays).values({
      id: dayId,
      memberId,
      dayNumber,
      amount: dayNumber * 500,
      completed,
      completedAt,
    }).onConflictDoUpdate({
      target: savingsChallengeDays.id,
      set: {
        completed,
        completedAt,
      }
    });

    res.json({ success: true });
  } catch (err: any) {
    console.error("Challenge day save error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/db/challenge-days/reset", async (req, res) => {
  try {
    const { memberId = 'mem-1' } = req.body;
    await db.update(savingsChallengeDays)
      .set({ completed: false, completedAt: null })
      .where(eq(savingsChallengeDays.memberId, memberId));
    res.json({ success: true });
  } catch (err: any) {
    console.error("Challenge reset error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Posts & Comments Endpoints
app.post("/api/db/posts", async (req, res) => {
  try {
    const p = req.body;
    await db.insert(userPosts).values({
      id: p.id,
      authorId: p.authorId,
      authorName: p.authorName,
      authorAvatarUrl: p.authorAvatarUrl,
      content: p.content,
      imageUrl: p.imageUrl,
      createdAt: p.createdAt,
      likes: p.likes || 0,
      likedBy: p.likedBy || [],
      category: p.category || 'general',
      sharesCount: p.sharesCount || 0,
      isRepost: p.isRepost || false,
      originalAuthorId: p.originalAuthorId,
      originalAuthorName: p.originalAuthorName,
      originalAuthorAvatarUrl: p.originalAuthorAvatarUrl,
      originalPostId: p.originalPostId,
    }).onConflictDoUpdate({
      target: userPosts.id,
      set: {
        likes: p.likes,
        likedBy: p.likedBy,
        sharesCount: p.sharesCount,
      }
    });

    res.json({ success: true, post: p });
  } catch (err: any) {
    console.error("Save post error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/db/posts/:postId/comments", async (req, res) => {
  try {
    const { postId } = req.params;
    const c = req.body;
    await db.insert(postComments).values({
      id: c.id,
      postId,
      authorId: c.authorId,
      authorName: c.authorName,
      authorAvatarUrl: c.authorAvatarUrl,
      content: c.content,
      createdAt: c.createdAt,
    }).onConflictDoNothing();

    res.json({ success: true, comment: c });
  } catch (err: any) {
    console.error("Save comment error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Chat Endpoint
app.post("/api/db/chat", async (req, res) => {
  try {
    const msg = req.body;
    await db.insert(chatMessages).values({
      id: msg.id,
      senderId: msg.senderId,
      recipientId: msg.recipientId,
      text: msg.text,
      timestamp: msg.timestamp,
      isRead: msg.isRead || false,
      audioUrl: msg.audioUrl,
      audioDuration: msg.audioDuration,
      isEdited: msg.isEdited || false,
      isDeleted: msg.isDeleted || false,
    }).onConflictDoUpdate({
      target: chatMessages.id,
      set: {
        text: msg.text,
        isRead: msg.isRead,
        isEdited: msg.isEdited,
        isDeleted: msg.isDeleted,
      }
    });

    res.json({ success: true, message: msg });
  } catch (err: any) {
    console.error("Save chat error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Ledger Endpoint
app.post("/api/db/ledger", async (req, res) => {
  try {
    const rec = req.body;
    await db.insert(memberLedgerRecords).values({
      id: rec.id,
      memberId: rec.memberId,
      memberName: rec.memberName,
      date: rec.date,
      savings: rec.savings || 0,
      totalSavings: rec.totalSavings || 0,
      loanAmount: rec.loanAmount || 0,
      paidAmount: rec.paidAmount || 0,
      remainingLoan: rec.remainingLoan || 0,
      notes: rec.notes,
      createdAt: rec.createdAt || new Date().toISOString(),
    }).onConflictDoUpdate({
      target: memberLedgerRecords.id,
      set: {
        savings: rec.savings,
        totalSavings: rec.totalSavings,
        loanAmount: rec.loanAmount,
        paidAmount: rec.paidAmount,
        remainingLoan: rec.remainingLoan,
        notes: rec.notes,
      }
    });

    res.json({ success: true, record: rec });
  } catch (err: any) {
    console.error("Save ledger error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Admin Notifications Endpoint
app.post("/api/db/notifications", async (req, res) => {
  try {
    const n = req.body;
    await db.insert(adminNotifications).values({
      id: n.id,
      type: n.type,
      memberName: n.memberName,
      memberId: n.memberId,
      groupName: n.groupName,
      amount: n.amount || 0,
      description: n.description,
      date: n.date,
      isRead: n.isRead || false,
      isApproved: n.isApproved,
      isRejected: n.isRejected,
      isShared: n.isShared,
    }).onConflictDoUpdate({
      target: adminNotifications.id,
      set: {
        isRead: n.isRead,
        isApproved: n.isApproved,
        isRejected: n.isRejected,
        isShared: n.isShared,
      }
    });

    res.json({ success: true, notification: n });
  } catch (err: any) {
    console.error("Save notification error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Initialize Gemini Client server-side
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// AI Savings & Small Business Financial Advisor Endpoint
app.post("/api/ai-advisor", async (req, res) => {
  try {
    const { language = "rw", income = 0, monthlyExpenses = 0, savingsGoals = [], userQuestion = "", chatHistory = [], currency = "RWF" } = req.body;

    const ai = getGeminiClient();

    const getFallbackAdvice = (q: string, lang: string) => {
      const lowerQ = (q || "").toLowerCase();
      
      if (lang === "rw") {
        if (lowerQ.includes("n'amafaranga make") || lowerQ.includes("ibikondo") || lowerQ.includes("igishoro") || lowerQ.includes("business") || lowerQ.includes("ubucuruzi")) {
          return `💡 **Inama Z'Ubucuruzi n'Imishinga Yakorwa n'Amafaranga Make (Small Budget Business Ideas)**

Muraho! Urakoze ku kibazo cyawe cyerekeye gutangira ubucuruzi uhereye ku gishoro giciriritse. Naraguteguriye inama z'ingirakamaro mu Rwanda:

1. **Ubucuruzi bw'Ama-Units n'Ikarita za Mobile Money (5,000 Frw - 20,000 Frw)**
   - Untangira utunganya ama-unit n'ibirebana n'itumanaho cyangwa kumenyekanisha serivisi za MoMo/Airtel Money mu gace utuyemo.

2. **Gucuruza Imbuto, Imboga, cyangwa Imbuto Zitunganyije (10,000 Frw - 30,000 Frw)**
   - Kugura imbuto (Avoka, Inanasi, Imboga) mu isoko rya Kigali/Intara ukazishora mu duce tw'abakozi n'ingo cyangwa ukazigabanyamo udupaki twiteguye kuribwa.

3. **Ubucuruzi bw'Imyenda no Kuyivugurura (20,000 Frw - 50,000 Frw)**
   - Guchagua imyenda myiza mu isoko rya caguwa (Kibungo, Nyabugogo) ukajya uyifotora ukayikwirakwiza kuri WhatsApp Status no mu baturanyi.

4. **Inama Z'Ingirakamaro Z'Imicungire y'Igishoro:**
   - **Bika angana na 20%** by'inyungu zose ubonye uyashyire kuri Wallet/Ubwizigame.
   - Irinde gushora amafaranga yose mu kintu kimwe atarakora isoko (Test small first).

Ufite igishoro cy'amafaranga angahe exact wifuza ko tuganiraho? Ndatabaza uburyo bwiza bwo kuyapanga!`;
        }

        return `💡 **Inama Z'Ubwizigame n'Imicungire y'Amafaranga**

Urakoze ku kibazo cyawe. Hano hari inama z'ingirakamaro zigufasha gutera imbere:

- **Ingamba ya 50/30/20**:
  - 50% y'ingano y'inguzanyo/incomes ku byo ukenera (Ibiri mu nzu, amafunguro).
  - 30% ku byo wifuza bwite.
  - 20% byihuse mu Bwizigame (Wallet & Savings Goals).

- **Inama Z'Ubutabazi**: Bika amafaranga y'amezi 3 azagutabara mu gihe ikibazo kije.
Niba ufite ikindi kibazo cyihariye ku buzima bwawe bw'imari, mbaza ukuri nkusubize!`;
      } else {
        return `💡 **Small Capital Business & Financial Guidance**

Thank you for your financial query! Here are practical high-yield ideas for launching a business with small capital:

1. **Mobile Airtime & Agent Micro-Services ($5 - $20 / 5,000 - 20,000 RWF)**
   - Start with digital airtime distribution, printing, or local errand services for neighborhood shops.

2. **Fresh Produce & Packaged Fruits ($10 - $30 / 10,000 - 30,000 RWF)**
   - Source fresh fruits from wholesale markets and package them into ready-to-eat cups for office workers or residential neighborhoods.

3. **Thrift Apparel Curated Sales ($20 - $50 / 20,000 - 50,000 RWF)**
   - Pick quality thrift apparel from wholesale hubs and market them through WhatsApp groups & social circles.

4. **Core Financial Rules:**
   - Reinvest 80% of profits early on to scale inventory.
   - Always keep 20% auto-saved in your savings wallet!

Feel free to share your specific starting budget so we can tailor the plan step by step!`;
      }
    };

    if (!ai) {
      return res.json({ advice: getFallbackAdvice(userQuestion, language) });
    }

    const langPrompt = language === "rw"
      ? `Subiza mu Kinyarwanda cyoroshye, kigufi cyane kandi gihuye neza n'icyo umu-user abajije. Irinde amagambo menshi cyane, tanga inama n'ibisubizo bifatika mu mirongo mike.`
      : `Respond in clear, brief, actionable English. Keep instructions concise, to-the-point, and do not write overly long paragraphs.`;

    const prompt = `
Task: Act as an expert personal finance coach, micro-business consultant, and savings mentor.

User Context & Query:
- Language Requested: ${language === "rw" ? "Kinyarwanda" : "English"}
- Currency: ${currency}
- Monthly Income: ${income} ${currency}
- Monthly Expenses: ${monthlyExpenses} ${currency}
- Current Savings Goals: ${JSON.stringify(savingsGoals)}
- Recent Chat Context: ${JSON.stringify(chatHistory.slice(-4))}
- User Question / Topic: ${userQuestion || (language === "rw" ? "Mpa inama ku mishinga yakorwa n'amafaranga make n'uko na zizigama." : "Give me business ideas for small budget and money saving tips.")}

Guidelines for response:
1. CRITICAL: Identify the exact language of the user's question. Respond strictly in that exact language (e.g., if asked in Kinyarwanda, reply in Kinyarwanda; if English, reply in English).
2. CRITICAL: Keep your response very short, concise, and direct (maximum 100-120 words). Avoid long introductions. Respond directly to what was asked.
3. If asked about starting a business with small money ("amafaranga make", "igishoro gito", "small capital"), list 3 specific micro-business opportunities in Rwanda with brief, practical execution steps.
4. Use clear, short bullet points.

Additional guidelines:
${langPrompt}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction: language === "rw"
          ? "Uri Inshuti y'Ubwizigame n'Ubucuruzi Buciyemo Inzira. Tanga inama z'ingirakamaro, z'ubucuruzi n'ubwizigame mu Kinyarwanda k'umwimerere kandi mu magambo make cyane ahuye neza n'ikibazo."
          : "You are Smart Savings & Micro-Business Advisor. Provide clear, extremely concise, realistic financial guidance for small business owners and savers.",
      },
    });

    const adviceText = response.text || getFallbackAdvice(userQuestion, language);
    return res.json({ advice: adviceText });

  } catch (err: any) {
    console.error("Error generating AI financial advice:", err);
    const fallback = req.body?.language === "rw"
      ? `💡 **Inama Z'Ubucuruzi n'Imari**\n\n- **Tangirira ku kintu gito**: Niba ufite igishoro cya 10,000 Frw - 50,000 Frw, gucuruza imbuto zitunganyije, ama-unit, cyangwa imyenda ya caguwa ni uburyo bwiza bwo kwagura inyungu.\n- **Zizigamira mu kimina**: Bika nibura 20% by'inyungu buri munsi.\n\nGerageza kubaza ikindi kibazo cyihariye!`
      : `💡 **Small Business & Savings Guidance**\n\n- Start small with micro-ventures (produce, airtime, thrift goods).\n- Auto-save at least 20% of net profits into your wallet daily.\n\nAsk any question to continue our discussion!`;
    return res.json({ advice: fallback });
  }
});

async function startServer() {
  // Vite middleware for development vs static files for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
