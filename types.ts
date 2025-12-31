
export type PriorityLevel = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in-progress' | 'done';

export type UserRole = 'admin' | 'user'; // New Role Type

export interface AppConfig {
  disabledModules: string[]; // List of page IDs hidden for regular users
}

export interface UserProfile {
  name: string;
  email: string;
  bio: string;
  avatarUrl?: string;
  role: string; // Display role title (e.g. "Product Manager")
  accessLevel: UserRole; // Actual system permission level
  telegramChatId?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string; // 'group' or specific user ID
  text: string;
  timestamp: number;
  isRead: boolean;
}

export interface ChatUser {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'busy';
  avatarColor: string;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean; 
  status: TaskStatus;
  createdAt: number;
  priority: PriorityLevel; 
  startDate?: string; // Added for date ranges
  dueDate?: string;
  tags: string[]; 
  description?: string; 
  isAiGenerated?: boolean;
}

export interface Milestone {
  id: string;
  text: string;
  isCompleted: boolean;
}

export interface Goal {
  id: string;
  title: string;
  category: 'Personal' | 'Career' | 'Financial' | 'Health';
  progress: number; // 0 to 100
  targetDate?: string;
  milestones?: Milestone[]; // Added for OKR style
  description?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  status: 'to-read' | 'reading' | 'finished';
  rating: number; // 0-5
  coverColor: string;
  totalPages?: number; // Added
  currentPage?: number; // Added
  genre?: string; // Added
}

export interface FinanceItem {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string; // Added
  date: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'completed' | 'paused';
  dueDate: string;
  progress: number;
  teamMembers?: string[]; // e.g., ["JD", "AB"]
  tags?: string[];
}

export interface MeetingNote {
  id: string;
  title: string;
  date: string;
  attendees: string[];
  content: string;
  type: 'Daily' | 'Weekly' | '1:1' | 'Adhoc';
}

export interface WikiDoc {
  id: string;
  title: string;
  content: string;
  lastUpdated: string;
  author: string;
  category: string;
}

export interface TravelTrip {
  id: string;
  destination: string;
  dates: string;
  status: 'upcoming' | 'completed' | 'wishlist';
  budget: number;
  itinerary: { day: number; activity: string }[];
}

export interface ArchivedItem {
  id: string;
  originalId: string;
  type: 'task' | 'project' | 'doc';
  title: string;
  archivedAt: string;
}

// Added 'matrix' to ViewMode
export type ViewMode = 'list' | 'board' | 'matrix';
export type SortOption = 'newest' | 'oldest' | 'priority' | 'alphabetical';

// Expanded PageType for Notion-like menus
export type PageType = 
  | 'dashboard' 
  | 'tasks' 
  | 'calendar'
  | 'goals' 
  | 'journal' 
  | 'habits' 
  | 'settings'
  | 'reading'
  | 'finances'
  | 'projects'
  | 'meeting-notes'
  | 'team-wiki'
  | 'travel'
  | 'archive'
  | 'profile'; // Added profile

export interface AppTheme {
  background: 'clean' | 'focus' | 'warm' | 'mesh' | 'nature' | 'ocean' | 'sunset' | 'cyber';
  sidebarStyle: 'solid' | 'glass' | 'minimal';
}

export interface Stats {
  total: number;
  active: number;
  completed: number;
  percent: number;
}

export interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}