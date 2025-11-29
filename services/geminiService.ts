import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { CLINIC_NAME, CLINIC_ADDRESS, CLINIC_PHONE, MOCK_SERVICES, MOCK_DOCTORS } from '../constants';

const API_KEY = process.env.API_KEY || '';

let ai: GoogleGenAI | null = null;

if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
}

export const generateHealthResponse = async (userPrompt: string): Promise<string> => {
  if (!ai) {
    return "Le service d'IA n'est pas configuré (Clé API manquante).";
  }

  const servicesList = MOCK_SERVICES.map(s => s.title).join(', ');
  const doctorsList = MOCK_DOCTORS.map(d => `${d.name} (${d.specialty})`).join(', ');

  const systemInstruction = `
    Tu es l'assistant virtuel intelligent de la ${CLINIC_NAME} située à ${CLINIC_ADDRESS}.
    Ton rôle est d'aider les patients avec des informations générales, de les guider vers les bons services, et de répondre à des questions de santé de base.
    
    Informations Clés:
    - Téléphone: ${CLINIC_PHONE}
    - Services disponibles: ${servicesList}
    - Docteurs: ${doctorsList}
    
    Règles:
    1. Sois poli, empathique et professionnel. Utilise un ton rassurant.
    2. Si un patient décrit des symptômes graves (douleur thoracique, difficulté respiratoire, saignement abondant), conseille-leur IMMÉDIATEMENT d'appeler les urgences (${CLINIC_PHONE}) ou de venir à la clinique.
    3. NE FAIS PAS de diagnostic médical définitif. Dis toujours "Je ne suis qu'une IA, veuillez consulter un médecin pour un diagnostic précis."
    4. Réponds en Français.
    5. Sois concis.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || "Désolé, je n'ai pas pu générer de réponse.";
  } catch (error) {
    console.error("Erreur Gemini:", error);
    return "Une erreur est survenue lors du traitement de votre demande. Veuillez réessayer plus tard.";
  }
};