// lib/mock/seed.ts
// Run once on app boot if localStorage is empty.
// Provides realistic sample data for all entities.

import type { User, Task, Submission, Campaign } from "../libs/types";

// ─── Campaigns ────────────────────────────────────────────────────────────────

export const SEED_CAMPAIGNS: Campaign[] = [
    {
        id: "camp_001",
        name: "Product Launch Q1",
        description: "All tasks related to the Q1 product launch campaign",
        created_at: "2026-01-10T09:00:00Z",
    },
    {
        id: "camp_002",
        name: "Brand Awareness March",
        description: "Increase brand visibility across social channels",
        created_at: "2026-02-15T09:00:00Z",
    },
    {
        id: "camp_003",
        name: "Webinar Promotion",
        description: "Promote upcoming tech webinar series",
        created_at: "2026-03-01T09:00:00Z",
    },
    {
        id: "camp_004",
        name: "User Acquisition",
        description: "Drive new user sign-ups through email outreach",
        created_at: "2026-03-05T09:00:00Z",
    },
];

// ─── Users ────────────────────────────────────────────────────────────────────

export const SEED_USERS: User[] = [
    {
        id: "user_admin",
        username: "admin",
        email: "admin@microtask.io",
        role: "admin",
        avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=Admin",
        created_at: "2026-01-01T00:00:00Z",
        total_earned: 0,
        total_submissions: 0,
        approved_submissions: 0,
    },
    {
        id: "user_w001",
        username: "alex_worker",
        email: "alex@example.com",
        role: "worker",
        avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=Alex",
        created_at: "2026-01-15T10:30:00Z",
        total_earned: 142.5,
        total_submissions: 28,
        approved_submissions: 19,
    },
    {
        id: "user_w002",
        username: "sarah_m",
        email: "sarah@example.com",
        role: "worker",
        avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=Sarah",
        created_at: "2026-01-20T08:00:00Z",
        total_earned: 310.0,
        total_submissions: 52,
        approved_submissions: 41,
    },
    {
        id: "user_w003",
        username: "jamesc",
        email: "james@example.com",
        role: "worker",
        avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=James",
        created_at: "2026-02-01T14:00:00Z",
        total_earned: 87.0,
        total_submissions: 15,
        approved_submissions: 12,
    },
    {
        id: "user_w004",
        username: "priya_v",
        email: "priya@example.com",
        role: "worker",
        avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=Priya",
        created_at: "2026-02-10T11:00:00Z",
        total_earned: 215.0,
        total_submissions: 37,
        approved_submissions: 30,
    },
    {
        id: "user_w005",
        username: "mike_t",
        email: "mike@example.com",
        role: "worker",
        avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=Mike",
        created_at: "2026-02-20T09:00:00Z",
        total_earned: 58.5,
        total_submissions: 11,
        approved_submissions: 9,
    },
];

// ─── Tasks ────────────────────────────────────────────────────────────────────

export const SEED_TASKS: Task[] = [
    // Social Media Posting tasks
    {
        id: "task_001",
        task_type: "social_media_posting",
        title: "Promote our Tech Webinar on LinkedIn/Twitter",
        description:
            "Post about our upcoming webinar on your social media and reach more professionals.",
        details: `## Task Instructions

Create a post on your **Twitter/X** or **LinkedIn** account promoting our upcoming webinar on **March 20th, 2026**.

### Requirements
- Use the hashtag **#TechWebinar2026**
- Tag our official account **@MicroTaskIO**
- Post must be publicly visible
- Include the webinar registration link: \`https://webinar.microtask.io\`

### What to submit
- The direct URL to your post
- A screenshot of the post showing likes/impressions (taken within 24 hours)

> Posts from private accounts or bot accounts will be automatically rejected.`,
        amount: 50,
        reward: 5.0,
        allow_multiple_submissions: false,
        campaign_id: "camp_003",
        status: "active",
        created_at: "2026-03-01T09:00:00Z",
        updated_at: "2026-03-01T09:00:00Z",
        submissions_count: 23,
        approved_count: 18,
    },
    {
        id: "task_002",
        task_type: "social_media_posting",
        title: "Share our Product Launch Announcement",
        description:
            "Help spread the word about our new product launch on your social channels.",
        details: `## Task Instructions

Share our **product launch announcement** post on your Twitter/X, LinkedIn, or Facebook.

### Requirements
- Your account must have at least **100 followers**
- Use hashtags: **#ProductLaunch** **#NewFeature2026**
- Post must remain live for at least **7 days**

### Submission
- Post URL
- Screenshot showing the post is live`,
        amount: 100,
        reward: 4.5,
        allow_multiple_submissions: false,
        campaign_id: "camp_001",
        status: "active",
        created_at: "2026-03-02T10:00:00Z",
        updated_at: "2026-03-02T10:00:00Z",
        submissions_count: 61,
        approved_count: 45,
    },
    {
        id: "task_003",
        task_type: "social_media_posting",
        title: "Post a Review on LinkedIn",
        description:
            "Share your experience using our platform on LinkedIn to build social proof.",
        details: `## Task Instructions

Write an **authentic review post** about your experience using MicroTask on LinkedIn.

### Requirements
- Minimum **3 sentences** in your review
- Must mention **MicroTask** by name
- Tag **@MicroTaskIO**
- Post must be original (not copy-pasted)

### What NOT to do
- Don't use AI-generated text verbatim
- Don't post from brand/company pages`,
        amount: 30,
        reward: 8.0,
        allow_multiple_submissions: false,
        campaign_id: "camp_002",
        status: "active",
        created_at: "2026-03-03T11:00:00Z",
        updated_at: "2026-03-03T11:00:00Z",
        submissions_count: 12,
        approved_count: 9,
    },
    // Email Sending tasks
    {
        id: "task_004",
        task_type: "email_sending",
        title: "Send Promo Email to Your Network",
        description:
            "Introduce our new project management tool to at least 5 people in your professional network.",
        details: `## Task Instructions

Send a **promotional email** to at least **5 recipients** in your network introducing our new project management tool.

### Email must include
- Key features: task management, team collaboration, real-time updates
- A call-to-action link: \`https://app.microtask.io/signup\`
- Your personal recommendation (makes it authentic)

### Submission
- Paste the **full email content** (including subject line) you sent
- Screenshot of your sent folder showing recipient count

### Tips
- Personalize the email — bulk spam will be rejected
- Best results come from sending to colleagues or professional contacts`,
        amount: 75,
        reward: 6.0,
        allow_multiple_submissions: false,
        campaign_id: "camp_001",
        status: "active",
        created_at: "2026-03-04T09:30:00Z",
        updated_at: "2026-03-04T09:30:00Z",
        submissions_count: 34,
        approved_count: 28,
    },
    {
        id: "task_005",
        task_type: "email_sending",
        title: "Email 3 Friends About Our Referral Program",
        description:
            "Spread the word about our referral program by emailing at least 3 friends.",
        details: `## Task Instructions

Email at least **3 friends or colleagues** about the MicroTask referral program.

### Key points to mention
- Earn **$10 AUD** for every friend who signs up and completes their first task
- Your referral code: workers must use their own referral code from their profile
- Sign-up link: \`https://app.microtask.io/signup?ref=YOUR_CODE\`

### Submission
- Full email content submitted below
- Screenshot of outbox/sent folder`,
        amount: 200,
        reward: 3.5,
        allow_multiple_submissions: true,
        campaign_id: "camp_004",
        status: "active",
        created_at: "2026-03-05T08:00:00Z",
        updated_at: "2026-03-05T08:00:00Z",
        submissions_count: 89,
        approved_count: 72,
    },
    {
        id: "task_006",
        task_type: "email_sending",
        title: "Cold Outreach for SaaS Tool",
        description:
            "Send a personalised cold email to a potential business customer about our B2B SaaS tool.",
        details: `## Task Instructions

Send a **cold outreach email** to a **business contact** (not a personal friend) about our B2B project management SaaS.

### Target: Small to medium business owners or team leads

### Email requirements
- Personalised opening (reference their company/role)
- Pain point identification
- Our solution pitch (keep it concise — under 150 words)
- Clear CTA: demo booking link \`https://calendly.com/microtask-demo\`

### This task pays more because quality matters
Emails that look templated or spammy will be rejected immediately.`,
        amount: 40,
        reward: 12.0,
        allow_multiple_submissions: false,
        campaign_id: "camp_004",
        status: "active",
        created_at: "2026-03-06T10:00:00Z",
        updated_at: "2026-03-06T10:00:00Z",
        submissions_count: 8,
        approved_count: 5,
    },
    // Social Media Liking tasks
    {
        id: "task_007",
        task_type: "social_media_liking",
        title: "Like Our Instagram Product Launch Post",
        description:
            "Like our latest Instagram post announcing the product launch.",
        details: `## Task Instructions

Like our latest **Instagram post** announcing the product launch.

### Post URL
Visit: \`https://instagram.com/p/microtask_launch_2026\`

### Requirements
- Must be logged into your **personal account** (not a brand/bot account)
- Account must be at least **3 months old**
- Account must have at least **50 followers**

### Submission
- Your Instagram profile URL
- Screenshot showing you have liked the post (heart icon filled)

> Accounts that appear automated or have suspicious activity will be rejected.`,
        amount: 500,
        reward: 1.5,
        allow_multiple_submissions: false,
        campaign_id: "camp_001",
        status: "active",
        created_at: "2026-03-06T12:00:00Z",
        updated_at: "2026-03-06T12:00:00Z",
        submissions_count: 312,
        approved_count: 289,
    },
    {
        id: "task_008",
        task_type: "social_media_liking",
        title: "Like & Retweet Our Twitter Announcement",
        description: "Engage with our latest Twitter/X product announcement post.",
        details: `## Task Instructions

**Like AND retweet** our Twitter/X announcement post about the new dashboard feature.

### Post URL
\`https://twitter.com/MicroTaskIO/status/1234567890\`

### Requirements
- Both like AND retweet required
- Public account only
- Screenshot must show both interactions

### Submission
- Your Twitter/X profile URL  
- Screenshot showing both like (heart) and retweet icons highlighted`,
        amount: 300,
        reward: 2.0,
        allow_multiple_submissions: false,
        campaign_id: "camp_002",
        status: "active",
        created_at: "2026-03-07T09:00:00Z",
        updated_at: "2026-03-07T09:00:00Z",
        submissions_count: 178,
        approved_count: 156,
    },
    {
        id: "task_009",
        task_type: "social_media_liking",
        title: "Like Our LinkedIn Company Page Posts (Last 3)",
        description:
            "Support our LinkedIn presence by liking our 3 most recent company page posts.",
        details: `## Task Instructions

Like the **3 most recent posts** on our LinkedIn company page.

### Company Page
\`https://linkedin.com/company/microtask-io\`

### Requirements
- Must be your personal LinkedIn profile
- All 3 posts must be liked in a single session
- Screenshot must show all 3 liked posts in one capture

### How to screenshot
Scroll down to show all 3 posts on screen, take a single screenshot showing all likes.`,
        amount: 150,
        reward: 2.5,
        allow_multiple_submissions: false,
        campaign_id: "camp_002",
        status: "active",
        created_at: "2026-03-07T11:00:00Z",
        updated_at: "2026-03-07T11:00:00Z",
        submissions_count: 67,
        approved_count: 55,
    },
    {
        id: "task_010",
        task_type: "social_media_posting",
        title: "Share Webinar Recap Post",
        description: "Post a recap or takeaway from the March webinar.",
        details: `## Task Instructions

After attending (or watching the recording of) our **March Tech Webinar**, post your **key takeaways** on LinkedIn or Twitter/X.

### Requirements
- Minimum 2 takeaways mentioned
- Use **#TechWebinar2026**
- Post must be written in your own words

### Webinar recording
Available at: \`https://webinar.microtask.io/march-recap\``,
        amount: 40,
        reward: 7.0,
        allow_multiple_submissions: false,
        campaign_id: "camp_003",
        status: "completed",
        created_at: "2026-02-20T09:00:00Z",
        updated_at: "2026-03-08T09:00:00Z",
        submissions_count: 40,
        approved_count: 36,
    },
];

// ─── Submissions ──────────────────────────────────────────────────────────────

export const SEED_SUBMISSIONS: Submission[] = [
    // task_001 submissions
    {
        id: "sub_001",
        task_id: "task_001",
        user_id: "user_w001",
        task_type: "social_media_posting",
        status: "approved",
        post_url: "https://twitter.com/alex_worker/status/111111",
        screenshot_url: "https://placehold.co/800x500/e0e7ff/6366f1?text=Screenshot",
        submitted_at: "2026-03-02T10:15:00Z",
        reviewed_at: "2026-03-02T14:00:00Z",
    },
    {
        id: "sub_002",
        task_id: "task_001",
        user_id: "user_w002",
        task_type: "social_media_posting",
        status: "approved",
        post_url: "https://linkedin.com/posts/sarah_m_222222",
        screenshot_url: "https://placehold.co/800x500/e0e7ff/6366f1?text=Screenshot",
        submitted_at: "2026-03-02T11:30:00Z",
        reviewed_at: "2026-03-02T15:00:00Z",
    },
    {
        id: "sub_003",
        task_id: "task_001",
        user_id: "user_w003",
        task_type: "social_media_posting",
        status: "rejected",
        post_url: "https://twitter.com/jamesc/status/333333",
        screenshot_url: "https://placehold.co/800x500/ffe4e6/ef4444?text=Screenshot",
        submitted_at: "2026-03-02T13:00:00Z",
        reviewed_at: "2026-03-02T16:00:00Z",
        rejection_reason: "Account appears to be private — post is not publicly visible.",
    },
    {
        id: "sub_004",
        task_id: "task_001",
        user_id: "user_w004",
        task_type: "social_media_posting",
        status: "pending",
        post_url: "https://linkedin.com/posts/priya_v_444444",
        screenshot_url: "https://placehold.co/800x500/fef9c3/ca8a04?text=Screenshot",
        submitted_at: "2026-03-03T09:00:00Z",
    },
    // task_004 submissions (email)
    {
        id: "sub_005",
        task_id: "task_004",
        user_id: "user_w001",
        task_type: "email_sending",
        status: "approved",
        email_content: `Subject: You need to try this project management tool 🚀

Hi Sarah,

I've been using this new tool called MicroTask for the past few weeks and honestly it's transformed how I manage my projects. The task assignment, real-time collaboration, and dashboard views are genuinely excellent.

If you're dealing with the usual chaos of spreadsheets and Slack threads, I think this could be a game-changer for your team too.

Sign up here (free trial): https://app.microtask.io/signup

Happy to chat more about it if you're curious!

Cheers,
Alex`,
        screenshot_url: "https://placehold.co/800x500/e0e7ff/6366f1?text=Sent+Email+Screenshot",
        submitted_at: "2026-03-04T14:00:00Z",
        reviewed_at: "2026-03-04T17:00:00Z",
    },
    {
        id: "sub_006",
        task_id: "task_004",
        user_id: "user_w002",
        task_type: "email_sending",
        status: "pending",
        email_content: `Subject: Check out this awesome productivity tool

Hi everyone,

Just wanted to share a tool I've been using: MicroTask. It helps with project management and task tracking. Key features include team collaboration, real-time updates, and a clean dashboard.

Sign up here: https://app.microtask.io/signup

Best,
Sarah`,
        screenshot_url: "https://placehold.co/800x500/fef9c3/ca8a04?text=Screenshot",
        submitted_at: "2026-03-05T10:00:00Z",
    },
    {
        id: "sub_007",
        task_id: "task_004",
        user_id: "user_w005",
        task_type: "email_sending",
        status: "rejected",
        email_content: `Subject: New tool

Hi, check this out https://app.microtask.io/signup`,
        screenshot_url: "https://placehold.co/800x500/ffe4e6/ef4444?text=Screenshot",
        submitted_at: "2026-03-05T11:00:00Z",
        reviewed_at: "2026-03-05T13:00:00Z",
        rejection_reason: "Email is too short and does not include key features or a call-to-action. Please read the task requirements carefully.",
    },
    // task_007 submissions (liking)
    {
        id: "sub_008",
        task_id: "task_007",
        user_id: "user_w001",
        task_type: "social_media_liking",
        status: "approved",
        post_url: "https://instagram.com/alex_worker",
        screenshot_url: "https://placehold.co/800x500/e0e7ff/6366f1?text=Screenshot",
        submitted_at: "2026-03-06T13:00:00Z",
        reviewed_at: "2026-03-06T15:00:00Z",
    },
    {
        id: "sub_009",
        task_id: "task_007",
        user_id: "user_w002",
        task_type: "social_media_liking",
        status: "approved",
        post_url: "https://instagram.com/sarah_m",
        screenshot_url: "https://placehold.co/800x500/e0e7ff/6366f1?text=Screenshot",
        submitted_at: "2026-03-06T13:30:00Z",
        reviewed_at: "2026-03-06T15:00:00Z",
    },
    {
        id: "sub_010",
        task_id: "task_007",
        user_id: "user_w003",
        task_type: "social_media_liking",
        status: "pending",
        post_url: "https://instagram.com/jamesc",
        screenshot_url: "https://placehold.co/800x500/fef9c3/ca8a04?text=Screenshot",
        submitted_at: "2026-03-07T09:00:00Z",
    },
    {
        id: "sub_011",
        task_id: "task_007",
        user_id: "user_w004",
        task_type: "social_media_liking",
        status: "approved",
        post_url: "https://instagram.com/priya_v",
        screenshot_url: "https://placehold.co/800x500/e0e7ff/6366f1?text=Screenshot",
        submitted_at: "2026-03-07T10:00:00Z",
        reviewed_at: "2026-03-07T12:00:00Z",
    },
    {
        id: "sub_012",
        task_id: "task_008",
        user_id: "user_w001",
        task_type: "social_media_liking",
        status: "approved",
        post_url: "https://twitter.com/alex_worker",
        screenshot_url: "https://placehold.co/800x500/e0e7ff/6366f1?text=Screenshot",
        submitted_at: "2026-03-07T11:00:00Z",
        reviewed_at: "2026-03-07T14:00:00Z",
    },
    {
        id: "sub_013",
        task_id: "task_002",
        user_id: "user_w002",
        task_type: "social_media_posting",
        status: "pending",
        post_url: "https://twitter.com/sarah_m/status/999999",
        screenshot_url: "https://placehold.co/800x500/fef9c3/ca8a04?text=Screenshot",
        submitted_at: "2026-03-08T08:00:00Z",
    },
    {
        id: "sub_014",
        task_id: "task_005",
        user_id: "user_w003",
        task_type: "email_sending",
        status: "approved",
        email_content: `Subject: Earn money by referring friends to MicroTask!

Hey Tom,

Quick one — I've been using this platform called MicroTask to earn extra income by completing small social media tasks. It's legit and pays out quickly.

They also have a referral program: you get $10 AUD when a friend signs up and completes their first task.

Use my link: https://app.microtask.io/signup?ref=JAMESC

Worth checking out if you have some spare time!

James`,
        screenshot_url: "https://placehold.co/800x500/e0e7ff/6366f1?text=Screenshot",
        submitted_at: "2026-03-08T09:00:00Z",
        reviewed_at: "2026-03-08T11:00:00Z",
    },
    {
        id: "sub_015",
        task_id: "task_009",
        user_id: "user_w004",
        task_type: "social_media_liking",
        status: "pending",
        post_url: "https://linkedin.com/in/priya_v",
        screenshot_url: "https://placehold.co/800x500/fef9c3/ca8a04?text=Screenshot",
        submitted_at: "2026-03-09T10:00:00Z",
    },
] as Submission[];

// ─── Seed function ────────────────────────────────────────────────────────────

const STORAGE_KEYS = {
    USERS: "mt_users",
    TASKS: "mt_tasks",
    SUBMISSIONS: "mt_submissions",
    CAMPAIGNS: "mt_campaigns",
    SEEDED: "mt_seeded",
};

export function seedLocalStorage(): void {
    if (typeof window === "undefined") return;

    // Only seed once
    if (localStorage.getItem(STORAGE_KEYS.SEEDED)) return;

    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(SEED_TASKS));
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(SEED_SUBMISSIONS));
    localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(SEED_CAMPAIGNS));
    localStorage.setItem(STORAGE_KEYS.SEEDED, "true");

    console.info("[MicroTask] localStorage seeded with sample data.");
}

export function resetLocalStorage(): void {
    if (typeof window === "undefined") return;
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
    seedLocalStorage();
}