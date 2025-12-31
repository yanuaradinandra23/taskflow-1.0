
// Toggle this to 'false' to connect to the Node.js backend
// Toggle to 'true' to use browser LocalStorage (Offline Mode)
const USE_MOCK_API = false; 

// Use relative path to allow Vite proxy to handle forwarding
const API_BASE_URL = '/api';

// Helper to handle fetch with timeout
const fetchWithTimeout = async (url: string, options: RequestInit = {}) => {
    const { timeout = 5000 } = options as any;
    
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
  
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal  
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
};

// --- Real API Implementation ---
const realApi = {
  get: async <T>(endpoint: string): Promise<T> => {
    const response = await fetchWithTimeout(`${API_BASE_URL}${endpoint}`);
    
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${text.substring(0, 100)}`);
    }
    
    // Check if response is actually JSON before parsing
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json();
    } else {
        throw new Error(`Invalid JSON response at ${endpoint}`);
    }
  },

  post: async <T>(endpoint: string, data: any): Promise<T> => {
    const response = await fetchWithTimeout(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
         const text = await response.text();
         throw new Error(`API Error: ${response.status} ${response.statusText} - ${text.substring(0, 100)}`);
    }
    return response.json();
  },

  put: async <T>(endpoint: string, data: any): Promise<T> => {
    const response = await fetchWithTimeout(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
         const text = await response.text();
         throw new Error(`API Error: ${response.status} ${response.statusText} - ${text.substring(0, 100)}`);
    }
    return response.json();
  },

  delete: async (endpoint: string): Promise<void> => {
    const response = await fetchWithTimeout(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
         const text = await response.text();
         throw new Error(`API Error: ${response.status} ${response.statusText} - ${text.substring(0, 100)}`);
    }
  }
};

// --- Mock API Implementation (LocalStorage) ---
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockApi = {
  get: async <T>(endpoint: string): Promise<T> => {
    await delay(100); 

    if (endpoint === '/config') {
        return JSON.parse(localStorage.getItem('taskflow_config') || '{"disabledModules": []}') as T;
    }
    if (endpoint === '/todos') {
      return JSON.parse(localStorage.getItem('taskflow_todos') || '[]') as T;
    }
    if (endpoint === '/journal/today') {
      return JSON.parse(localStorage.getItem('taskflow_journal_today') || '{}') as T;
    }
    if (endpoint.startsWith('/pages/')) {
        const pageId = endpoint.split('/').pop();
        const content = localStorage.getItem(`taskflow_page_${pageId}`) || '';
        return { content } as any;
    }
    if (endpoint.startsWith('/chat/messages/')) {
        return JSON.parse(localStorage.getItem('taskflow_chat_messages') || '[]') as T;
    }
    if (endpoint === '/users') {
        return JSON.parse(localStorage.getItem('taskflow_users') || '[]') as T;
    }
    
    // Generic GET for simple lists (goals, books, finance, projects, habits)
    const resource = endpoint.split('/')[1]; // e.g., 'goals' from '/goals'
    const key = `taskflow_${resource}`;
    return JSON.parse(localStorage.getItem(key) || '[]') as T;
  },

  post: async <T>(endpoint: string, data: any): Promise<T> => {
    await delay(100);

    if (endpoint === '/auth/login') {
        // Fallback login if server is offline
        if (data.email === 'admin@taskflow.app' && data.password === 'admin123') {
            return {
                id: '1', name: 'Admin (Offline)', email: data.email, role: 'Workspace Owner', accessLevel: 'admin', bio: 'Offline Mode'
            } as any;
        }
        if (data.email === 'user@taskflow.app' && data.password === 'user123') {
            return {
                id: '2', name: 'User (Offline)', email: data.email, role: 'Team Member', accessLevel: 'user', bio: 'Offline Mode'
            } as any;
        }
        throw new Error("Invalid credentials (Offline Mode)");
    }

    if (endpoint === '/users') {
        const users = JSON.parse(localStorage.getItem('taskflow_users') || '[]');
        const newUser = { ...data, id: crypto.randomUUID() };
        users.push(newUser);
        localStorage.setItem('taskflow_users', JSON.stringify(users));
        return newUser as any;
    }

    if (endpoint === '/config') {
        localStorage.setItem('taskflow_config', JSON.stringify(data));
        return data as T;
    }
    if (endpoint === '/notify/telegram') {
        console.log(`[Mock API] Telegram: ${data.message}`);
        return { success: true } as any;
    }
    if (endpoint === '/todos/batch') {
        const existing = JSON.parse(localStorage.getItem('taskflow_todos') || '[]');
        const updated = [...data.todos, ...existing];
        localStorage.setItem('taskflow_todos', JSON.stringify(updated));
        return { success: true } as any;
    }
    if (endpoint === '/journal/today') {
        localStorage.setItem('taskflow_journal_today', JSON.stringify(data));
        return { success: true } as any;
    }
    if (endpoint.startsWith('/pages/')) {
        const pageId = endpoint.split('/').pop();
        localStorage.setItem(`taskflow_page_${pageId}`, data.content);
        return { success: true } as any;
    }
    if (endpoint === '/chat/messages') {
        const messages = JSON.parse(localStorage.getItem('taskflow_chat_messages') || '[]');
        messages.push(data);
        localStorage.setItem('taskflow_chat_messages', JSON.stringify(messages));
        return data as T;
    }

    // Generic POST
    const resource = endpoint.split('/')[1];
    const key = `taskflow_${resource}`;
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    list.unshift(data); // Add to beginning
    localStorage.setItem(key, JSON.stringify(list));
    return data;
  },

  put: async <T>(endpoint: string, data: any): Promise<T> => {
    await delay(100);
    
    // Generic PUT: /resource/:id
    const parts = endpoint.split('/');
    const resource = parts[1];
    const id = parts[2];
    const key = `taskflow_${resource}`;
    
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    const index = list.findIndex((item: any) => item.id === id);
    
    if (index !== -1) {
        list[index] = { ...list[index], ...data };
        localStorage.setItem(key, JSON.stringify(list));
        return list[index];
    }
    return data;
  },

  delete: async (endpoint: string): Promise<void> => {
    await delay(100);

    const parts = endpoint.split('/');
    const resource = parts[1];
    const id = parts[2];
    const key = `taskflow_${resource}`;

    if (resource === 'users') {
        let users = JSON.parse(localStorage.getItem('taskflow_users') || '[]');
        users = users.filter((u: any) => u.id !== id);
        localStorage.setItem('taskflow_users', JSON.stringify(users));
        return;
    }

    let list = JSON.parse(localStorage.getItem(key) || '[]');
    list = list.filter((item: any) => item.id !== id);
    localStorage.setItem(key, JSON.stringify(list));
  }
};

// --- Hybrid Export ---
// Tries Real API first, falls back to Mock API on failure
export const api = {
    get: async <T>(endpoint: string): Promise<T> => {
        if (USE_MOCK_API) return mockApi.get(endpoint);
        try {
            return await realApi.get(endpoint);
        } catch (error) {
            console.log(`[API Fallback] ${endpoint} failed. Using offline data.`);
            return mockApi.get(endpoint);
        }
    },
    post: async <T>(endpoint: string, data: any): Promise<T> => {
         if (USE_MOCK_API) return mockApi.post(endpoint, data);
         try {
             return await realApi.post(endpoint, data);
         } catch (error) {
             console.log(`[API Fallback] ${endpoint} failed. Saving locally.`);
             return mockApi.post(endpoint, data);
         }
    },
    put: async <T>(endpoint: string, data: any): Promise<T> => {
         if (USE_MOCK_API) return mockApi.put(endpoint, data);
         try {
             return await realApi.put(endpoint, data);
         } catch (error) {
             console.log(`[API Fallback] ${endpoint} failed. Updating locally.`);
             return mockApi.put(endpoint, data);
         }
    },
    delete: async (endpoint: string): Promise<void> => {
         if (USE_MOCK_API) return mockApi.delete(endpoint);
         try {
             return await realApi.delete(endpoint);
         } catch (error) {
             console.log(`[API Fallback] ${endpoint} failed. Deleting locally.`);
             return mockApi.delete(endpoint);
         }
    }
};
