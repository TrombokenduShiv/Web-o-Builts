/* ============================================================
   MOCK API SERVICE
   All API calls return mock data with realistic latency.
   Swap the body of each function for a real fetch() later.
   ============================================================ */

const delay = (ms = 400) => new Promise(r => setTimeout(r, ms));

/* ── Auth ── */
export async function login(email, password) {
  await delay(800);
  if (password !== 'password') {
    throw new Error('Invalid credentials. Use any email and "password".');
  }
  return {
    token: 'mock-jwt-token-xyz',
    user: {
      id: 1,
      owner_name: 'Raj Sharma',
      business_name: 'Sharma Enterprises',
      package_type: 'pro', // Change to 'standard' to test Standard-tier restrictions
      current_status: 'awaiting_first_call', // awaiting_first_call | first_call_done | website_live
      avatar_initials: 'RS',
      email,
    },
  };
}

/* ── Users ── */
export async function getMe() {
  await delay(300);
  return {
    id: 1,
    owner_name: 'Raj Sharma',
    business_name: 'Sharma Enterprises',
    package_type: 'pro',
    current_status: 'awaiting_first_call',
    avatar_initials: 'RS',
    email: 'raj@sharmaenterprises.com',
  };
}

/* ── Dashboard ── */
export async function getDashboardSummary() {
  await delay(350);
  return {
    status_badge: 'Awaiting 1st Call',
    status_type: 'pending',        // pending | active | complete
    next_action_required: 'book_first_call',  // book_first_call | pay_second_call | awaiting_build | website_live
    recent_activity: [
      { id: 1, text: 'Account created successfully', time: '2 hours ago', icon: '✦' },
      { id: 2, text: 'Package "Pro Growth" selected', time: '2 hours ago', icon: '📦' },
      { id: 3, text: 'Welcome email sent to raj@sharmaenterprises.com', time: '1 hour ago', icon: '📧' },
    ],
    predicted_traffic: [
      { month: 'Now',    visitors: 120 },
      { month: 'M+1',   visitors: 340 },
      { month: 'M+2',   visitors: 680 },
      { month: 'M+3',   visitors: 1100 },
      { month: 'M+4',   visitors: 1800 },
      { month: 'M+5',   visitors: 2600 },
      { month: 'M+6',   visitors: 3400 },
    ],
  };
}

/* ── Calls ── */
export async function getAvailableSlots() {
  await delay(400);
  const base = new Date();
  const slots = [];
  for (let i = 1; i <= 14; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      slots.push({ date: d.toISOString().split('T')[0], times: ['10:00', '12:00', '14:00', '16:00'] });
    }
  }
  return slots;
}

export async function bookCall(slot, topics) {
  await delay(900);
  return {
    success: true,
    meet_link: `https://meet.google.com/wcs-${Math.random().toString(36).substr(2, 9)}`,
    confirmed_slot: slot,
    topics,
  };
}

export async function getCallHistory() {
  await delay(300);
  return [
    { id: 1, type: 'Discovery Call', date: '2025-03-10', duration: '45 min', status: 'Completed', meet_link: '#' },
    { id: 2, type: 'Strategy Call', date: '2025-03-18', duration: '60 min', status: 'Completed', meet_link: '#' },
  ];
}

export async function initiateSecondCallPayment() {
  await delay(600);
  return { order_id: 'order_mock_9xKdP3', amount: 9900, currency: 'INR' };
}

/* ── Billing ── */
export async function getBillingStatus() {
  await delay(350);
  return {
    package: 'Pro Growth',
    total_price: 85000,
    advance_amount: 25500,
    advance_paid: false,
    contract_signed: false,
    contract_text: `WEBSITE DEVELOPMENT AGREEMENT

This Website Development Agreement ("Agreement") is entered into as of the date of digital signature between WebCraft Sutra ("Agency") and the Client as identified by their registered account.

1. SCOPE OF WORK
Agency agrees to design, develop, and deliver a high-performance, SEO-optimised website as per the Pro Growth Package specifications. Deliverables include a custom responsive website, SEO architecture setup, 12 months of managed hosting, and monthly maintenance.

2. PAYMENT TERMS
Client agrees to pay a non-refundable advance of 30% (₹25,500) upon signing this agreement. The remaining 70% (₹59,500) shall be due upon final delivery and approval of the website.

3. TIMELINE
Agency shall deliver the initial design mockups within 7 business days of receiving the advance payment. Final delivery is targeted within 21 business days subject to timely client feedback.

4. REVISIONS
Up to 3 rounds of revisions are included. Additional revisions shall be billed at ₹2,000 per hour.

5. INTELLECTUAL PROPERTY
Upon full payment, all deliverables become the exclusive property of the Client. Agency retains the right to display the work in its portfolio.

6. CONFIDENTIALITY
Both parties agree to maintain strict confidentiality of all proprietary information shared during the engagement.

7. TERMINATION
Either party may terminate this agreement with 14 days written notice. In case of termination, advance payments are non-refundable.

8. GOVERNING LAW
This agreement shall be governed by and construed in accordance with the laws of India.

By signing below, the Client acknowledges they have read, understood, and agree to be bound by the terms of this Agreement.`,
  };
}

export async function signAgreement(signatureName) {
  await delay(700);
  return { success: true, signed_at: new Date().toISOString(), signature_name: signatureName };
}

export async function initiateAdvancePayment() {
  await delay(600);
  return { order_id: 'order_mock_adv_8xKw1', amount: 2550000, currency: 'INR' };
}

export async function getBillingDocuments() {
  await delay(300);
  return [
    { id: 1, name: 'Agreement — Pro Growth Package', date: '2025-03-10', type: 'Agreement', size: '142 KB', url: '#' },
    { id: 2, name: 'Invoice #WCS-001 — Advance Payment', date: '2025-03-11', type: 'Invoice', size: '88 KB', url: '#' },
    { id: 3, name: 'Receipt — ₹25,500 Advance', date: '2025-03-11', type: 'Receipt', size: '64 KB', url: '#' },
    { id: 4, name: 'Invoice #WCS-002 — Balance Payment', date: '2025-04-01', type: 'Invoice', size: '91 KB', url: '#' },
    { id: 5, name: 'Receipt — ₹59,500 Balance', date: '2025-04-01', type: 'Receipt', size: '67 KB', url: '#' },
  ];
}

/* ── Analytics ── */
export async function getAnalyticsMetrics(packageType) {
  await delay(500);
  if (packageType === 'standard') {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }
  return {
    visitors:    { value: 8420, change: '+34%', trend: 'up' },
    impressions: { value: 62300, change: '+51%', trend: 'up' },
    position:    { value: 4.2, change: '-1.3', trend: 'up' },
    clicks:      { value: 3180, change: '+28%', trend: 'up' },
    traffic_data: [
      { month: 'Oct', visitors: 1100, impressions: 8200 },
      { month: 'Nov', visitors: 2400, impressions: 18500 },
      { month: 'Dec', visitors: 3200, impressions: 26000 },
      { month: 'Jan', visitors: 4800, impressions: 39000 },
      { month: 'Feb', visitors: 6100, impressions: 50000 },
      { month: 'Mar', visitors: 8420, impressions: 62300 },
    ],
    keyword_data: [
      { keyword: 'web design india', position: 3 },
      { keyword: 'seo services mumbai', position: 5 },
      { keyword: 'business website cost', position: 7 },
      { keyword: 'website maintenance', position: 4 },
      { keyword: 'digital marketing agency', position: 9 },
    ],
  };
}

export async function getMaintenanceLogs() {
  await delay(300);
  return [
    { id: 1, date: 'Mar 28, 2025', action: 'Security patches applied — WordPress core 6.4.3' },
    { id: 2, date: 'Mar 21, 2025', action: 'Image optimisation — Reduced homepage load by 18%' },
    { id: 3, date: 'Mar 14, 2025', action: 'New blog post published: "Top 5 SEO Tips for 2025"' },
    { id: 4, date: 'Mar 07, 2025', action: 'SSL certificate renewed for sharmaenterprises.com' },
    { id: 5, date: 'Feb 28, 2025', action: 'Monthly performance report sent to client' },
    { id: 6, date: 'Feb 21, 2025', action: 'Schema markup added for local SEO' },
    { id: 7, date: 'Feb 14, 2025', action: 'Google Search Console sitemap resubmitted' },
  ];
}

/* ── Settings ── */
export async function updateProfile(data) {
  await delay(800);
  return { success: true, message: 'Profile updated successfully', ...data };
}

export async function changePassword(oldPass, newPass) {
  await delay(900);
  if (oldPass === newPass) throw new Error('New password must be different from old password.');
  return { success: true, message: 'Password changed successfully' };
}
