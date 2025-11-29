import { Appointment, User } from '../types';

// CONFIGURATION
// Gestion des variables d'environnement pour Vercel (Vite ou CRA)
// Sur Vercel, vous devrez définir VITE_API_URL
const getApiUrl = () => {
  // @ts-ignore - Support pour Vite
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
    // @ts-ignore
    return import.meta.env.VITE_API_URL;
  }
  // Support pour Create React App / Node classique
  if (typeof process !== 'undefined' && process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  return '';
};

const API_URL = getApiUrl();

const STORAGE_KEY_APP = 'clinique_appointments';
const STORAGE_KEY_USERS = 'clinique_users';
const STORAGE_KEY_SESSION = 'clinique_session';

// --- AUTH FUNCTIONS (PATIENTS) ---

export const registerUser = async (userData: Omit<User, 'id' | 'role'> & { password: string }): Promise<User> => {
  // Production Mode
  if (API_URL) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erreur lors de l\'inscription');
    }
    return await response.json();
  }

  // Demo Mode
  await new Promise(resolve => setTimeout(resolve, 800));
  const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
  
  if (users.find((u: any) => u.email === userData.email)) {
    throw new Error('Cet email est déjà utilisé.');
  }

  const newUser: User = {
    id: Math.random().toString(36).substr(2, 9),
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
    role: 'patient'
  };

  // Save user and password (mocking DB)
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify([...users, { ...newUser, password: userData.password }]));
  
  // Auto login
  localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(newUser));
  return newUser;
};

export const loginUser = async (email: string, password: string): Promise<User> => {
  // Production Mode
  if (API_URL) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error('Identifiants incorrects');
    return await response.json();
  }

  // Demo Mode
  await new Promise(resolve => setTimeout(resolve, 800));
  const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
  const user = users.find((u: any) => u.email === email && u.password === password);

  if (!user) throw new Error('Email ou mot de passe incorrect.');

  const { password: _, ...userWithoutPass } = user; // Exclude password from session
  localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(userWithoutPass));
  return userWithoutPass;
};

export const logoutUser = () => {
  localStorage.removeItem(STORAGE_KEY_SESSION);
};

export const getCurrentUser = (): User | null => {
  const session = localStorage.getItem(STORAGE_KEY_SESSION);
  return session ? JSON.parse(session) : null;
};

// --- APPOINTMENT FUNCTIONS ---

export const createAppointment = async (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'status'>): Promise<Appointment> => {
  // Production Mode: Post to API
  if (API_URL) {
    try {
      const response = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
      });
      
      if (!response.ok) throw new Error('Failed to create appointment');
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  // Demo/Local Mode
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const newAppointment: Appointment = {
    ...appointmentData,
    id: Math.random().toString(36).substr(2, 9),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  const data = localStorage.getItem(STORAGE_KEY_APP);
  const currentAppointments = data ? JSON.parse(data) : [];
  localStorage.setItem(STORAGE_KEY_APP, JSON.stringify([...currentAppointments, newAppointment]));

  return newAppointment;
};

// --- ADMIN FUNCTIONS ---

export const getAppointments = async (): Promise<Appointment[]> => {
  if (API_URL) {
    try {
      const response = await fetch(`${API_URL}/appointments`);
      if (!response.ok) throw new Error('Failed to fetch appointments');
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      return []; 
    }
  }

  await new Promise(resolve => setTimeout(resolve, 500));
  const data = localStorage.getItem(STORAGE_KEY_APP);
  const appointments: Appointment[] = data ? JSON.parse(data) : [];
  return appointments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const updateAppointmentStatus = async (id: string, status: 'confirmed' | 'cancelled'): Promise<void> => {
  if (API_URL) {
    await fetch(`${API_URL}/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return;
  }

  const data = localStorage.getItem(STORAGE_KEY_APP);
  if (!data) return;

  const appointments: Appointment[] = JSON.parse(data);
  const updatedAppointments = appointments.map(app => 
    app.id === id ? { ...app, status } : app
  );

  localStorage.setItem(STORAGE_KEY_APP, JSON.stringify(updatedAppointments));
};

// NOTE: C'est une authentification Frontend simplifiée pour l'interface Admin.
// Pour une sécurité maximale en production, vous devriez gérer les sessions Admin via JWT côté Backend.
export const checkAdminAuth = async (password: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  // Mot de passe Admin défini ici
  return password === 'espoir2024';
};