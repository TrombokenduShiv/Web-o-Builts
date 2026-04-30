import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor: inject JWT token ──
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: auto-refresh on 401 ──
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        isRefreshing = false;
        logout();
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(`${API_BASE_URL}/auth/login/refresh/`, {
          refresh: refreshToken
        });
        const newAccess = res.data.access;
        localStorage.setItem('access_token', newAccess);
        if (res.data.refresh) {
          localStorage.setItem('refresh_token', res.data.refresh);
        }
        processQueue(null, newAccess);
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);


/* ── Auth ── */

export function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('wcs-dash-user');
  window.location.href = '/login';
}

export async function login(email, password) {
  try {
    const res = await apiClient.post('/auth/login/', { email, password });
    localStorage.setItem('access_token', res.data.access);
    localStorage.setItem('refresh_token', res.data.refresh);
    // Fetch full profile
    const profile = await getMe();
    return { token: res.data.access, user: profile };
  } catch (error) {
    const detail = error.response?.data?.detail
      || error.response?.data?.email?.[0]
      || 'Invalid email or password.';
    throw new Error(detail);
  }
}

export async function register(data) {
  try {
    const res = await apiClient.post('/auth/register/', data);
    localStorage.setItem('access_token', res.data.access);
    localStorage.setItem('refresh_token', res.data.refresh);
    return { token: res.data.access, user: res.data.user };
  } catch (error) {
    const data = error.response?.data;
    // Extract first error message from DRF response
    if (data) {
      const firstKey = Object.keys(data)[0];
      const msg = Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey];
      throw new Error(msg || 'Registration failed.');
    }
    throw new Error('Registration failed. Please try again.');
  }
}

export async function googleTokenLogin(credential) {
  try {
    const res = await apiClient.post('/auth/google/token/', { credential });
    localStorage.setItem('access_token', res.data.access);
    localStorage.setItem('refresh_token', res.data.refresh);
    return { token: res.data.access, user: res.data.user };
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Google sign-in failed.');
  }
}

export async function generateOtp(email) {
  try {
    const res = await apiClient.post('/auth/otp/generate/', { email });
    return res.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || 'Failed to send OTP. Please try again.'
    );
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

/* ── Users ── */
export async function getMe() {
  const res = await apiClient.get('/auth/profile/');
  return res.data;
}

/* ── Dashboard ── */
export async function getDashboardSummary() {
  try {
    const res = await apiClient.get('/dashboard/summary/');
    return res.data;
  } catch {
    // Graceful fallback for initial users with no data yet
    return {
      status_badge: 'Awaiting 1st Call',
      status_type: 'pending',
      next_action_required: 'book_first_call',
      recent_activity: [
        { id: 1, text: 'Account created successfully', time: 'Just now', icon: '✦' },
      ],
      predicted_traffic: [
        { month: 'Now', visitors: 0 },
        { month: 'M+1', visitors: 0 },
        { month: 'M+2', visitors: 0 },
      ],
    };
  }
}

/* ── Calls ── */
export async function getAvailableSlots() {
  try {
    const res = await apiClient.get('/dashboard/calls/slots/');
    return res.data;
  } catch {
    // Generate client-side slots if endpoint not ready
    const base = new Date();
    const slots = [];
    for (let i = 1; i <= 14; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      if (d.getDay() !== 0 && d.getDay() !== 6) {
        slots.push({
          date: d.toISOString().split('T')[0],
          times: ['10:00', '12:00', '14:00', '16:00']
        });
      }
    }
    return slots;
  }
}

export async function bookCall(slot, topics) {
  const res = await apiClient.post('/dashboard/calls/', {
    call_type: '1st Free',
    scheduled_time: `${slot.date}T${slot.time}:00Z`,
    discussion_topics: topics.join(', ')
  });
  return {
    success: true,
    meet_link: res.data.meeting_link,
    confirmed_slot: slot,
    topics
  };
}

export async function getCallHistory() {
  try {
    const res = await apiClient.get('/dashboard/calls/');
    return res.data;
  } catch {
    return [];
  }
}

export async function initiateSecondCallPayment() {
  const res = await apiClient.post('/dashboard/payments/create-order/', {
    amount: 9900,
    purpose: '2nd Call'
  });
  return { order_id: res.data.order_id, amount: 9900, currency: 'INR' };
}

/* ── Billing ── */
export async function getBillingStatus() {
  try {
    const res = await apiClient.get('/dashboard/billing/');
    return res.data;
  } catch {
    return {
      package: 'Not Selected',
      total_price: 0,
      advance_amount: 0,
      advance_paid: false,
      contract_signed: false,
      contract_text: '',
    };
  }
}

export async function signAgreement(signatureName) {
  try {
    const agreements = await apiClient.get('/dashboard/agreements/');
    if (agreements.data.length > 0) {
      const agreementId = agreements.data[0].id;
      const res = await apiClient.put(
        `/dashboard/agreements/${agreementId}/sign/`,
        { signature_name: signatureName }
      );
      return {
        success: true,
        signed_at: res.data.signed_at,
        signature_name: signatureName
      };
    }
    throw new Error('No agreement found.');
  } catch (err) {
    throw new Error(err.message || 'Failed to sign agreement.');
  }
}

export async function initiateAdvancePayment() {
  const res = await apiClient.post('/dashboard/payments/create-order/', {
    amount: 2550000,
    purpose: '30% Advance'
  });
  return { order_id: res.data.order_id, amount: 2550000, currency: 'INR' };
}

export async function verifyRazorpayPayment(paymentId, orderId, signature) {
  const res = await apiClient.post('/dashboard/payments/verify/', {
    razorpay_payment_id: paymentId,
    razorpay_order_id: orderId,
    razorpay_signature: signature
  });
  return res.data;
}

export async function getBillingDocuments() {
  try {
    const res = await apiClient.get('/dashboard/agreements/');
    return res.data.map(a => ({
      id: a.id,
      name: `Agreement — ${a.package} Package`,
      date: a.created_at?.split('T')[0] || '',
      type: 'Agreement',
      size: '-',
      url: '#'
    }));
  } catch {
    return [];
  }
}

/* ── Analytics ── */
export async function getAnalyticsMetrics(packageType) {
  try {
    const res = await apiClient.get('/dashboard/analytics/');
    return res.data;
  } catch (err) {
    if (err.response?.status === 403) {
      const e = new Error('Forbidden');
      e.status = 403;
      throw e;
    }
    return {
      visitors: { value: 0, change: '0%', trend: 'flat' },
      impressions: { value: 0, change: '0%', trend: 'flat' },
      position: { value: 0, change: '0', trend: 'flat' },
      clicks: { value: 0, change: '0%', trend: 'flat' },
      traffic_data: [],
      keyword_data: [],
    };
  }
}

export async function getMaintenanceLogs() {
  try {
    const res = await apiClient.get('/dashboard/maintenance/');
    return res.data;
  } catch {
    return [];
  }
}

/* ── Settings ── */
export async function updateProfile(data) {
  const res = await apiClient.patch('/auth/profile/', data);
  return { success: true, message: 'Profile updated successfully', ...res.data };
}

export async function changePassword(oldPass, newPass) {
  try {
    await apiClient.post('/api/dj-rest-auth/password/change/', {
      old_password: oldPass,
      new_password1: newPass,
      new_password2: newPass,
    });
    return { success: true, message: 'Password changed successfully' };
  } catch (err) {
    const data = err.response?.data;
    if (data) {
      const firstKey = Object.keys(data)[0];
      const msg = Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey];
      throw new Error(msg || 'Failed to change password.');
    }
    throw new Error('Failed to change password.');
  }
}
