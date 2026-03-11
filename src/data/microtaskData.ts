export const TASKS = [
    { id: "task_001", type: "social_media_posting", title: "Promote Tech Webinar on LinkedIn/Twitter", campaign: "Webinar Promotion", reward: 5.0, amount: 50, submissions: 23, approved: 18, status: "active", created: "Mar 1" },
    { id: "task_002", type: "social_media_posting", title: "Share Product Launch Announcement", campaign: "Product Launch Q1", reward: 4.5, amount: 100, submissions: 61, approved: 45, status: "active", created: "Mar 2" },
    { id: "task_003", type: "email_sending", title: "Send Promo Email to Your Network", campaign: "Product Launch Q1", reward: 6.0, amount: 75, submissions: 34, approved: 28, status: "active", created: "Mar 4" },
    { id: "task_004", type: "email_sending", title: "Cold Outreach for SaaS Tool", campaign: "User Acquisition", reward: 12.0, amount: 40, submissions: 8, approved: 5, status: "active", created: "Mar 6" },
    { id: "task_005", type: "social_media_liking", title: "Like Our Instagram Product Launch Post", campaign: "Product Launch Q1", reward: 1.5, amount: 500, submissions: 312, approved: 289, status: "active", created: "Mar 6" },
    { id: "task_006", type: "social_media_liking", title: "Like & Retweet Our Twitter Announcement", campaign: "Brand Awareness March", reward: 2.0, amount: 300, submissions: 178, approved: 156, status: "active", created: "Mar 7" },
    { id: "task_007", type: "social_media_posting", title: "Share Webinar Recap Post", campaign: "Webinar Promotion", reward: 7.0, amount: 40, submissions: 40, approved: 36, status: "completed", created: "Feb 20" },
    { id: "task_008", type: "email_sending", title: "Email 3 Friends About Referral Program", campaign: "User Acquisition", reward: 3.5, amount: 200, submissions: 89, approved: 72, status: "active", created: "Mar 5" },
];

export const SUBMISSIONS = [
    { id: "sub_001", task: "Promote Tech Webinar on LinkedIn/Twitter", taskType: "social_media_posting", worker: "alex_worker", avatar: "AW", color: "#6366f1", status: "pending", submitted: "Mar 9, 10:15", postUrl: "https://twitter.com/alex_worker/status/111111", screenshot: "https://placehold.co/600x350/eef2ff/6366f1?text=Post+Screenshot" },
    { id: "sub_002", task: "Send Promo Email to Your Network", taskType: "email_sending", worker: "sarah_m", avatar: "SM", color: "#0284c7", status: "pending", submitted: "Mar 9, 09:00", emailContent: "Subject: You need to try this project management tool\n\nHi Sarah,\n\nI've been using this new tool called MicroTask for the past few weeks and honestly it's transformed how I manage my projects...", screenshot: "https://placehold.co/600x350/e0f2fe/0284c7?text=Email+Screenshot" },
    { id: "sub_003", task: "Like Our Instagram Product Launch Post", taskType: "social_media_liking", worker: "priya_v", avatar: "PV", color: "#e11d48", status: "pending", submitted: "Mar 8, 14:00", postUrl: "https://instagram.com/priya_v", screenshot: "https://placehold.co/600x350/ffe4e6/e11d48?text=Like+Screenshot" },
    { id: "sub_004", task: "Share Product Launch Announcement", taskType: "social_media_posting", worker: "jamesc", avatar: "JC", color: "#7c3aed", status: "approved", submitted: "Mar 7, 11:30", postUrl: "https://linkedin.com/posts/jamesc_999", screenshot: "https://placehold.co/600x350/eef2ff/7c3aed?text=Post+Screenshot" },
    { id: "sub_005", task: "Cold Outreach for SaaS Tool", taskType: "email_sending", worker: "mike_t", avatar: "MT", color: "#059669", status: "rejected", submitted: "Mar 7, 08:45", emailContent: "Subject: New tool\n\nHi, check this out https://app.microtask.io/signup", rejectionReason: "Email is too short and doesn't include key features.", screenshot: "https://placehold.co/600x350/d1fae5/059669?text=Email+Screenshot" },
];

export const TASK_TYPE_META = {
    social_media_posting: { label: "Social Posting", icon: "social", color: "badge-type", cardClass: "social" },
    email_sending: { label: "Email Sending", icon: "email", color: "badge-sky", cardClass: "email" },
    social_media_liking: { label: "Social Liking", icon: "like", color: "badge-pending", cardClass: "like" },
};
