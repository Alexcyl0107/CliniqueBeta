export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: string;
  availability: string[];
  bio: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string; // Name of the icon
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'patient' | 'admin';
}

export interface Appointment {
  id: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  doctorId: string;
  date: string;
  reason: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  userId?: string; // Link to the user account if logged in
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}