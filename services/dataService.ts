
import { api } from "./api";
import { Goal, Book, FinanceItem, Project, MeetingNote, WikiDoc, TravelTrip, ArchivedItem, ChatMessage, AppConfig, UserProfile } from "../types";

// Auth
export const login = (credentials: any) => api.post<UserProfile>('/auth/login', credentials);

// Admin User Management
export const getAllUsers = () => api.get<UserProfile[]>('/users');
export const createUser = (user: any) => api.post<UserProfile>('/users', user);
export const deleteUser = (id: string) => api.delete(`/users/${id}`);

// App Configuration (Admin)
export const getAppConfig = () => api.get<AppConfig>('/config');
export const saveAppConfig = (config: AppConfig) => api.post<AppConfig>('/config', config);

// Goals
export const getGoals = () => api.get<Goal[]>('/goals');
export const addGoal = (goal: Goal) => api.post<Goal>('/goals', goal);
export const updateGoal = (goal: Goal) => api.put<Goal>(`/goals/${goal.id}`, goal);
export const deleteGoal = (id: string) => api.delete(`/goals/${id}`);

// Books
export const getBooks = () => api.get<Book[]>('/books');
export const addBook = (book: Book) => api.post<Book>('/books', book);
export const updateBook = (book: Book) => api.put<Book>(`/books/${book.id}`, book);
export const deleteBook = (id: string) => api.delete(`/books/${id}`);

// Finance
export const getFinanceItems = () => api.get<FinanceItem[]>('/finance');
export const addFinanceItem = (item: FinanceItem) => api.post<FinanceItem>('/finance', item);
export const deleteFinanceItem = (id: string) => api.delete(`/finance/${id}`);

// Projects
export const getProjects = () => api.get<Project[]>('/projects');
export const addProject = (project: Project) => api.post<Project>('/projects', project);
export const updateProject = (project: Project) => api.put<Project>(`/projects/${project.id}`, project);
export const deleteProject = (id: string) => api.delete(`/projects/${id}`);

// Habits
export const getHabits = () => api.get<any[]>('/habits');
export const addHabit = (habit: any) => api.post<any>('/habits', habit);
export const updateHabit = (habit: any) => api.put<any>(`/habits/${habit.id}`, habit);
export const deleteHabit = (id: string) => api.delete(`/habits/${id}`);

// Workspace Features
export const getMeetingNotes = () => api.get<MeetingNote[]>('/meetings');
export const addMeetingNote = (note: MeetingNote) => api.post<MeetingNote>('/meetings', note);
export const updateMeetingNote = (note: MeetingNote) => api.put<MeetingNote>(`/meetings/${note.id}`, note);
export const deleteMeetingNote = (id: string) => api.delete(`/meetings/${id}`);

export const getWikiDocs = () => api.get<WikiDoc[]>('/wiki');
export const addWikiDoc = (doc: WikiDoc) => api.post<WikiDoc>('/wiki', doc);
export const updateWikiDoc = (doc: WikiDoc) => api.put<WikiDoc>(`/wiki/${doc.id}`, doc);
export const deleteWikiDoc = (id: string) => api.delete(`/wiki/${id}`);

export const getTravelTrips = () => api.get<TravelTrip[]>('/travel');
export const addTravelTrip = (trip: TravelTrip) => api.post<TravelTrip>('/travel', trip);
export const deleteTravelTrip = (id: string) => api.delete(`/travel/${id}`);

export const getArchivedItems = () => api.get<ArchivedItem[]>('/archive');
export const addToArchive = (item: ArchivedItem) => api.post<ArchivedItem>('/archive', item);
export const restoreFromArchive = (id: string) => api.delete(`/archive/${id}`); // Deleting from archive = restore

// Pages/Journal
export const getPageContent = (pageId: string) => api.get<{content: string}>(`/pages/${pageId}`);
export const savePageContent = (pageId: string, content: string) => api.post(`/pages/${pageId}`, { content });

export const getJournalEntry = () => api.get<{content: string, mood: string}>('/journal/today');
export const saveJournalEntry = (content: string, mood: string | null) => api.post('/journal/today', { content, mood });

// Notifications
export const sendTelegramNotification = (chatId: string, message: string) => api.post('/notify/telegram', { chatId, message });

// Chat
export const getChatMessages = (userId: string) => api.get<ChatMessage[]>(`/chat/messages/${userId}`);
export const sendChatMessage = (message: ChatMessage) => api.post<ChatMessage>('/chat/messages', message);
