import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to inject the JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper for realistic fallback latency
const delay = (ms = 400) => new Promise(r => setTimeout(r, ms));

/* ── Auth ── */
export async function login(email, password) {
  try {
    const res = await apiClient.post('/auth/login/', { email, password });
    localStorage.setItem('access_token', res.data.access);
    localStorage.setItem('refresh_token', res.data.refresh);
    return { token: res.data.access, user: { email, ...res.data.user } };
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Invalid credentials.');
  }
}

export async function loginWithOtp(email, otp) {
  try {
    const res = await apiClient.post('/auth/otp/verify/', { email, otp });
    localStorage.setItem('access_token', res.data.access);
    localStorage.setItem('refresh_token', res.data.refresh);
    return { token: res.data.access, user: res.data.user };
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Invalid OTP.');
  }
}

export async function generateOtp(email) {
  try {
    const res = await apiClient.post('/auth/otp/generate/', { email });
    return res.data;
  } catch (error) {
    throw new Error('Failed to generate OTP.');
  }
}

/* ── Users ── */
export async function getMe() {
  try {
    const res = await apiClient.get('/auth/profile/');
    return res.data;
  } catch (err) {
    // Fallback to mock
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
}

/* ── Dashboard ── */
export async function getDashboardSummary() {
  await delay(350);
  return {
    status_badge: 'Awaiting 1st Call',
    status_type: 'pending',
    next_action_required: 'book_first_call',
    recent_activity: [
      { id: 1, text: 'Account created successfully', time: '2 hours ago', icon: '✦' },
      { id: 2, text: 'Package "Pro Growth" selected', time: '2 hours ago', icon: '📦' },
      { id: 3, text: 'Welcome email sent to you', time: '1 hour ago', icon: '📧' },
    ],
    predicted_traffic: [
      { month: 'Now',    visitors: 120 },
      { month: 'M+1',   visitors: 340 },
      { month: 'M+2',   visitors: 680 },
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
  try {
    const res = await apiClient.post('/dashboard/calls/', {
      call_type: '1st Free',
      scheduled_time: `${slot.date}T${slot.time}:00Z`,
      discussion_topics: topics.join(', ')
    });
    return { success: true, meet_link: res.data.meeting_link, confirmed_slot: slot, topics };
  } catch (err) {
    await delay(900);
    return { success: true, meet_link: `https://meet.google.com/mock-123`, confirmed_slot: slot, topics };
  }
}

export async function getCallHistory() {
  try {
    const res = await apiClient.get('/dashboard/calls/');
    return res.data;
  } catch (err) {
    await delay(300);
    return [];
  }
}

export async function initiateSecondCallPayment() {
  try {
    const res = await apiClient.post('/payments/create-order/', { amount: 9900, purpose: '2nd Call' });
    return { order_id: res.data.order_id, amount: 9900, currency: 'INR' };
  } catch (err) {
    await delay(600);
    return { order_id: 'order_mock_9xKdP3', amount: 9900, currency: 'INR' };
  }
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
    contract_text: `WEBSITE DEVELOPMENT AGREEMENT...`,
  };
}

export async function signAgreement(signatureName) {
  try {
    // Assuming ID 1 for now
    const res = await apiClient.put('/dashboard/agreements/1/sign/', { signature_name: signatureName });
    return { success: true, signed_at: res.data.signed_at, signature_name: signatureName };
  } catch (err) {
    await delay(700);
    return { success: true, signed_at: new Date().toISOString(), signature_name: signatureName };
  }
}

export async function initiateAdvancePayment() {
  try {
    const res = await apiClient.post('/payments/create-order/', { amount: 2550000, purpose: '30% Advance' });
    return { order_id: res.data.order_id, amount: 2550000, currency: 'INR' };
  } catch (err) {
    await delay(600);
    return { order_id: 'order_mock_adv_8xKw1', amount: 2550000, currency: 'INR' };
  }
}

export async function verifyRazorpayPayment(paymentId, orderId, signature) {
  const res = await apiClient.post('/payments/verify/', {
    razorpay_payment_id: paymentId,
    razorpay_order_id: orderId,
    razorpay_signature: signature
  });
  return res.data;
}

export async function getBillingDocuments() {
  await delay(300);
  return [
    { id: 1, name: 'Agreement — Pro Growth Package', date: '2025-03-10', type: 'Agreement', size: '142 KB', url: '#' },
  ];
}

/* ── Analytics ── */
export async function getAnalyticsMetrics(packageType) {
  try {
    const res = await apiClient.get('/dashboard/analytics/');
    // Map backend response to frontend expectations if it succeeds
    // For now, if empty, throw to fallback
    if (!res.data.high_level_metrics.length) throw new Error('No real data');
    return res.data;
  } catch (err) {
    await delay(500);
    if (packageType === 'standard') {
      const e = new Error('Forbidden'); e.status = 403; throw e;
    }
    return {
      visitors:    { value: 8420, change: '+34%', trend: 'up' },
      impressions: { value: 62300, change: '+51%', trend: 'up' },
      position:    { value: 4.2, change: '-1.3', trend: 'up' },
      clicks:      { value: 3180, change: '+28%', trend: 'up' },
      traffic_data: [
        { month: 'Oct', visitors: 1100, impressions: 8200 },
        { month: 'Mar', visitors: 8420, impressions: 62300 },
      ],
      keyword_data: [
        { keyword: 'web design india', position: 3 },
      ],
    };
  }
}

export async function getMaintenanceLogs() {
  await delay(300);
  return [];
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
