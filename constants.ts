import { Doctor, Service } from './types';

export const CLINIC_NAME = "Clinique Espoir Lomé";
export const CLINIC_ADDRESS = "145 Blvd du 13 Janvier, Lomé, Togo";
export const CLINIC_PHONE = "+228 22 21 00 00";
export const CLINIC_EMAIL = "contact@clinique-espoir-lome.tg";

export const MOCK_DOCTORS: Doctor[] = [
  {
    id: 'dr-kouassi',
    name: 'Dr. Jean Kouassi',
    specialty: 'Cardiologie',
    image: 'https://picsum.photos/id/1012/300/300',
    availability: ['Lundi', 'Mercredi', 'Vendredi'],
    bio: 'Spécialiste des maladies cardiovasculaires avec plus de 15 ans d\'expérience au CHU Sylvanus Olympio.'
  },
  {
    id: 'dr-adjoavi',
    name: 'Dr. Marie Adjoavi',
    specialty: 'Pédiatrie',
    image: 'https://picsum.photos/id/338/300/300',
    availability: ['Mardi', 'Jeudi', 'Samedi'],
    bio: 'Passionnée par la santé infantile, le Dr. Adjoavi assure le suivi complet de vos enfants.'
  },
  {
    id: 'dr-mensah',
    name: 'Dr. Paul Mensah',
    specialty: 'Médecine Générale',
    image: 'https://picsum.photos/id/1025/300/300',
    availability: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'],
    bio: 'Médecin chef de la clinique, expert en diagnostic rapide et médecine préventive.'
  }
];

export const MOCK_SERVICES: Service[] = [
  {
    id: 'serv-gen',
    title: 'Médecine Générale',
    description: 'Consultations primaires, bilans de santé et suivi chronique.',
    icon: 'Stethoscope'
  },
  {
    id: 'serv-ped',
    title: 'Pédiatrie',
    description: 'Soins complets pour nourrissons, enfants et adolescents.',
    icon: 'Baby'
  },
  {
    id: 'serv-mat',
    title: 'Maternité',
    description: 'Suivi de grossesse, accouchement et soins post-nataux.',
    icon: 'Heart'
  },
  {
    id: 'serv-urg',
    title: 'Urgences 24/7',
    description: 'Service d\'urgence ouvert tous les jours, toute l\'année.',
    icon: 'Ambulance'
  },
  {
    id: 'serv-lab',
    title: 'Laboratoire',
    description: 'Analyses biomédicales complètes sur place.',
    icon: 'FlaskConical'
  },
  {
    id: 'serv-rad',
    title: 'Radiologie',
    description: 'Échographie, Radio numérique et Scanner.',
    icon: 'ScanLine'
  }
];