export type SchedulePeriod = {
  startTime: string;
  endTime: string;
  subject: string;
  teacher: string;
  room: string;
  type: "course" | "break" | "lunch";
};

export type DaySchedule = SchedulePeriod[];

/* Jours de la semaine */
const DAYS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi"] as const;
export type DayKey = (typeof DAYS)[number];
export { DAYS };

/* ================= HORAIRES PAR CLASSE ET PAR JOUR ================= */

export const schedulesDataset: Record<string, Record<DayKey, DaySchedule>> = {
  NS1: {
    lundi: [
      { startTime: "07:30", endTime: "08:15", subject: "Mathématiques", teacher: "M. Jean-Baptiste", room: "Salle 101", type: "course" },
      { startTime: "08:15", endTime: "09:00", subject: "Français", teacher: "Mme. Théodore", room: "Salle 101", type: "course" },
      { startTime: "09:00", endTime: "09:45", subject: "Sciences Naturelles", teacher: "M. Augustin", room: "Labo 1", type: "course" },
      { startTime: "09:45", endTime: "10:00", subject: "Récréation", teacher: "", room: "", type: "break" },
      { startTime: "10:00", endTime: "10:45", subject: "Histoire-Géographie", teacher: "Mme. Décius", room: "Salle 101", type: "course" },
      { startTime: "10:45", endTime: "11:30", subject: "Créole", teacher: "M. Noël", room: "Salle 101", type: "course" },
      { startTime: "11:30", endTime: "12:15", subject: "Éducation Physique", teacher: "M. Pierre", room: "Terrain", type: "course" },
      { startTime: "12:15", endTime: "13:00", subject: "Pause Déjeuner", teacher: "", room: "", type: "lunch" },
    ],
    mardi: [
      { startTime: "07:30", endTime: "08:15", subject: "Français", teacher: "Mme. Théodore", room: "Salle 101", type: "course" },
      { startTime: "08:15", endTime: "09:00", subject: "Mathématiques", teacher: "M. Jean-Baptiste", room: "Salle 101", type: "course" },
      { startTime: "09:00", endTime: "09:45", subject: "Anglais", teacher: "Mme. Charles", room: "Salle 102", type: "course" },
      { startTime: "09:45", endTime: "10:00", subject: "Récréation", teacher: "", room: "", type: "break" },
      { startTime: "10:00", endTime: "10:45", subject: "Sciences Sociales", teacher: "M. Louis", room: "Salle 101", type: "course" },
      { startTime: "10:45", endTime: "11:30", subject: "Arts Plastiques", teacher: "Mme. Bellevue", room: "Salle Arts", type: "course" },
      { startTime: "11:30", endTime: "12:15", subject: "Musique", teacher: "M. Desrosiers", room: "Salle Musique", type: "course" },
      { startTime: "12:15", endTime: "13:00", subject: "Pause Déjeuner", teacher: "", room: "", type: "lunch" },
    ],
    mercredi: [
      { startTime: "07:30", endTime: "08:15", subject: "Sciences Naturelles", teacher: "M. Augustin", room: "Labo 1", type: "course" },
      { startTime: "08:15", endTime: "09:00", subject: "Mathématiques", teacher: "M. Jean-Baptiste", room: "Salle 101", type: "course" },
      { startTime: "09:00", endTime: "09:45", subject: "Français", teacher: "Mme. Théodore", room: "Salle 101", type: "course" },
      { startTime: "09:45", endTime: "10:00", subject: "Récréation", teacher: "", room: "", type: "break" },
      { startTime: "10:00", endTime: "10:45", subject: "Informatique", teacher: "M. Étienne", room: "Salle Info", type: "course" },
      { startTime: "10:45", endTime: "11:30", subject: "Éducation Civique", teacher: "Mme. Décius", room: "Salle 101", type: "course" },
    ],
    jeudi: [
      { startTime: "07:30", endTime: "08:15", subject: "Anglais", teacher: "Mme. Charles", room: "Salle 102", type: "course" },
      { startTime: "08:15", endTime: "09:00", subject: "Français", teacher: "Mme. Théodore", room: "Salle 101", type: "course" },
      { startTime: "09:00", endTime: "09:45", subject: "Mathématiques", teacher: "M. Jean-Baptiste", room: "Salle 101", type: "course" },
      { startTime: "09:45", endTime: "10:00", subject: "Récréation", teacher: "", room: "", type: "break" },
      { startTime: "10:00", endTime: "10:45", subject: "Histoire-Géographie", teacher: "Mme. Décius", room: "Salle 101", type: "course" },
      { startTime: "10:45", endTime: "11:30", subject: "Sciences Naturelles", teacher: "M. Augustin", room: "Labo 1", type: "course" },
      { startTime: "11:30", endTime: "12:15", subject: "Créole", teacher: "M. Noël", room: "Salle 101", type: "course" },
      { startTime: "12:15", endTime: "13:00", subject: "Pause Déjeuner", teacher: "", room: "", type: "lunch" },
    ],
    vendredi: [
      { startTime: "07:30", endTime: "08:15", subject: "Mathématiques", teacher: "M. Jean-Baptiste", room: "Salle 101", type: "course" },
      { startTime: "08:15", endTime: "09:00", subject: "Sciences Sociales", teacher: "M. Louis", room: "Salle 101", type: "course" },
      { startTime: "09:00", endTime: "09:45", subject: "Français", teacher: "Mme. Théodore", room: "Salle 101", type: "course" },
      { startTime: "09:45", endTime: "10:00", subject: "Récréation", teacher: "", room: "", type: "break" },
      { startTime: "10:00", endTime: "10:45", subject: "Éducation Physique", teacher: "M. Pierre", room: "Terrain", type: "course" },
      { startTime: "10:45", endTime: "11:30", subject: "Informatique", teacher: "M. Étienne", room: "Salle Info", type: "course" },
    ],
  },

  NS2: {
    lundi: [
      { startTime: "07:30", endTime: "08:15", subject: "Français", teacher: "M. Dorsainvil", room: "Salle 201", type: "course" },
      { startTime: "08:15", endTime: "09:00", subject: "Mathématiques", teacher: "Mme. Sanon", room: "Salle 201", type: "course" },
      { startTime: "09:00", endTime: "09:45", subject: "Physique", teacher: "M. Métayer", room: "Labo 2", type: "course" },
      { startTime: "09:45", endTime: "10:00", subject: "Récréation", teacher: "", room: "", type: "break" },
      { startTime: "10:00", endTime: "10:45", subject: "Anglais", teacher: "Mme. Sylvain", room: "Salle 202", type: "course" },
      { startTime: "10:45", endTime: "11:30", subject: "Histoire", teacher: "M. Bien-Aimé", room: "Salle 201", type: "course" },
      { startTime: "11:30", endTime: "12:15", subject: "Chimie", teacher: "Mme. François", room: "Labo 2", type: "course" },
      { startTime: "12:15", endTime: "13:00", subject: "Pause Déjeuner", teacher: "", room: "", type: "lunch" },
    ],
    mardi: [
      { startTime: "07:30", endTime: "08:15", subject: "Mathématiques", teacher: "Mme. Sanon", room: "Salle 201", type: "course" },
      { startTime: "08:15", endTime: "09:00", subject: "Physique", teacher: "M. Métayer", room: "Labo 2", type: "course" },
      { startTime: "09:00", endTime: "09:45", subject: "Français", teacher: "M. Dorsainvil", room: "Salle 201", type: "course" },
      { startTime: "09:45", endTime: "10:00", subject: "Récréation", teacher: "", room: "", type: "break" },
      { startTime: "10:00", endTime: "10:45", subject: "Géographie", teacher: "M. Bien-Aimé", room: "Salle 201", type: "course" },
      { startTime: "10:45", endTime: "11:30", subject: "Éducation Physique", teacher: "M. Pierre", room: "Terrain", type: "course" },
      { startTime: "11:30", endTime: "12:15", subject: "Informatique", teacher: "M. Étienne", room: "Salle Info", type: "course" },
      { startTime: "12:15", endTime: "13:00", subject: "Pause Déjeuner", teacher: "", room: "", type: "lunch" },
    ],
    mercredi: [
      { startTime: "07:30", endTime: "08:15", subject: "Chimie", teacher: "Mme. François", room: "Labo 2", type: "course" },
      { startTime: "08:15", endTime: "09:00", subject: "Français", teacher: "M. Dorsainvil", room: "Salle 201", type: "course" },
      { startTime: "09:00", endTime: "09:45", subject: "Anglais", teacher: "Mme. Sylvain", room: "Salle 202", type: "course" },
      { startTime: "09:45", endTime: "10:00", subject: "Récréation", teacher: "", room: "", type: "break" },
      { startTime: "10:00", endTime: "10:45", subject: "Mathématiques", teacher: "Mme. Sanon", room: "Salle 201", type: "course" },
      { startTime: "10:45", endTime: "11:30", subject: "Créole", teacher: "M. Noël", room: "Salle 201", type: "course" },
    ],
    jeudi: [
      { startTime: "07:30", endTime: "08:15", subject: "Anglais", teacher: "Mme. Sylvain", room: "Salle 202", type: "course" },
      { startTime: "08:15", endTime: "09:00", subject: "Mathématiques", teacher: "Mme. Sanon", room: "Salle 201", type: "course" },
      { startTime: "09:00", endTime: "09:45", subject: "Physique", teacher: "M. Métayer", room: "Labo 2", type: "course" },
      { startTime: "09:45", endTime: "10:00", subject: "Récréation", teacher: "", room: "", type: "break" },
      { startTime: "10:00", endTime: "10:45", subject: "Français", teacher: "M. Dorsainvil", room: "Salle 201", type: "course" },
      { startTime: "10:45", endTime: "11:30", subject: "Histoire", teacher: "M. Bien-Aimé", room: "Salle 201", type: "course" },
      { startTime: "11:30", endTime: "12:15", subject: "Arts Plastiques", teacher: "Mme. Bellevue", room: "Salle Arts", type: "course" },
      { startTime: "12:15", endTime: "13:00", subject: "Pause Déjeuner", teacher: "", room: "", type: "lunch" },
    ],
    vendredi: [
      { startTime: "07:30", endTime: "08:15", subject: "Français", teacher: "M. Dorsainvil", room: "Salle 201", type: "course" },
      { startTime: "08:15", endTime: "09:00", subject: "Chimie", teacher: "Mme. François", room: "Labo 2", type: "course" },
      { startTime: "09:00", endTime: "09:45", subject: "Mathématiques", teacher: "Mme. Sanon", room: "Salle 201", type: "course" },
      { startTime: "09:45", endTime: "10:00", subject: "Récréation", teacher: "", room: "", type: "break" },
      { startTime: "10:00", endTime: "10:45", subject: "Éducation Civique", teacher: "M. Bien-Aimé", room: "Salle 201", type: "course" },
      { startTime: "10:45", endTime: "11:30", subject: "Musique", teacher: "M. Desrosiers", room: "Salle Musique", type: "course" },
    ],
  },

  NS3: {
    lundi: [
      { startTime: "07:30", endTime: "08:15", subject: "Physique", teacher: "M. Métayer", room: "Labo 2", type: "course" },
      { startTime: "08:15", endTime: "09:00", subject: "Mathématiques", teacher: "M. Gédéon", room: "Salle 301", type: "course" },
      { startTime: "09:00", endTime: "09:45", subject: "Littérature", teacher: "Mme. Romain", room: "Salle 301", type: "course" },
      { startTime: "09:45", endTime: "10:00", subject: "Récréation", teacher: "", room: "", type: "break" },
      { startTime: "10:00", endTime: "10:45", subject: "Anglais", teacher: "Mme. Charles", room: "Salle 302", type: "course" },
      { startTime: "10:45", endTime: "11:30", subject: "Philosophie", teacher: "M. Casimir", room: "Salle 301", type: "course" },
      { startTime: "11:30", endTime: "12:15", subject: "Biologie", teacher: "Mme. Joseph", room: "Labo 1", type: "course" },
      { startTime: "12:15", endTime: "13:00", subject: "Pause Déjeuner", teacher: "", room: "", type: "lunch" },
    ],
    mardi: [
      { startTime: "07:30", endTime: "08:15", subject: "Mathématiques", teacher: "M. Gédéon", room: "Salle 301", type: "course" },
      { startTime: "08:15", endTime: "09:00", subject: "Chimie", teacher: "Mme. François", room: "Labo 2", type: "course" },
      { startTime: "09:00", endTime: "09:45", subject: "Littérature", teacher: "Mme. Romain", room: "Salle 301", type: "course" },
      { startTime: "09:45", endTime: "10:00", subject: "Récréation", teacher: "", room: "", type: "break" },
      { startTime: "10:00", endTime: "10:45", subject: "Histoire", teacher: "M. Bien-Aimé", room: "Salle 301", type: "course" },
      { startTime: "10:45", endTime: "11:30", subject: "Informatique", teacher: "M. Étienne", room: "Salle Info", type: "course" },
      { startTime: "11:30", endTime: "12:15", subject: "Éducation Physique", teacher: "M. Pierre", room: "Terrain", type: "course" },
      { startTime: "12:15", endTime: "13:00", subject: "Pause Déjeuner", teacher: "", room: "", type: "lunch" },
    ],
    mercredi: [
      { startTime: "07:30", endTime: "08:15", subject: "Anglais", teacher: "Mme. Charles", room: "Salle 302", type: "course" },
      { startTime: "08:15", endTime: "09:00", subject: "Physique", teacher: "M. Métayer", room: "Labo 2", type: "course" },
      { startTime: "09:00", endTime: "09:45", subject: "Mathématiques", teacher: "M. Gédéon", room: "Salle 301", type: "course" },
      { startTime: "09:45", endTime: "10:00", subject: "Récréation", teacher: "", room: "", type: "break" },
      { startTime: "10:00", endTime: "10:45", subject: "Philosophie", teacher: "M. Casimir", room: "Salle 301", type: "course" },
      { startTime: "10:45", endTime: "11:30", subject: "Géographie", teacher: "M. Bien-Aimé", room: "Salle 301", type: "course" },
    ],
    jeudi: [
      { startTime: "07:30", endTime: "08:15", subject: "Biologie", teacher: "Mme. Joseph", room: "Labo 1", type: "course" },
      { startTime: "08:15", endTime: "09:00", subject: "Littérature", teacher: "Mme. Romain", room: "Salle 301", type: "course" },
      { startTime: "09:00", endTime: "09:45", subject: "Mathématiques", teacher: "M. Gédéon", room: "Salle 301", type: "course" },
      { startTime: "09:45", endTime: "10:00", subject: "Récréation", teacher: "", room: "", type: "break" },
      { startTime: "10:00", endTime: "10:45", subject: "Chimie", teacher: "Mme. François", room: "Labo 2", type: "course" },
      { startTime: "10:45", endTime: "11:30", subject: "Anglais", teacher: "Mme. Charles", room: "Salle 302", type: "course" },
      { startTime: "11:30", endTime: "12:15", subject: "Créole", teacher: "M. Noël", room: "Salle 301", type: "course" },
      { startTime: "12:15", endTime: "13:00", subject: "Pause Déjeuner", teacher: "", room: "", type: "lunch" },
    ],
    vendredi: [
      { startTime: "07:30", endTime: "08:15", subject: "Physique", teacher: "M. Métayer", room: "Labo 2", type: "course" },
      { startTime: "08:15", endTime: "09:00", subject: "Littérature", teacher: "Mme. Romain", room: "Salle 301", type: "course" },
      { startTime: "09:00", endTime: "09:45", subject: "Philosophie", teacher: "M. Casimir", room: "Salle 301", type: "course" },
      { startTime: "09:45", endTime: "10:00", subject: "Récréation", teacher: "", room: "", type: "break" },
      { startTime: "10:00", endTime: "10:45", subject: "Mathématiques", teacher: "M. Gédéon", room: "Salle 301", type: "course" },
      { startTime: "10:45", endTime: "11:30", subject: "Biologie", teacher: "Mme. Joseph", room: "Labo 1", type: "course" },
    ],
  },

  NS4: {
    lundi: [
      { startTime: "07:30", endTime: "08:15", subject: "Philosophie", teacher: "M. Casimir", room: "Salle 401", type: "course" },
      { startTime: "08:15", endTime: "09:00", subject: "Mathématiques", teacher: "M. Gédéon", room: "Salle 401", type: "course" },
      { startTime: "09:00", endTime: "09:45", subject: "Physique", teacher: "M. Métayer", room: "Labo 2", type: "course" },
      { startTime: "09:45", endTime: "10:00", subject: "Récréation", teacher: "", room: "", type: "break" },
      { startTime: "10:00", endTime: "10:45", subject: "Littérature", teacher: "Mme. Romain", room: "Salle 401", type: "course" },
      { startTime: "10:45", endTime: "11:30", subject: "Chimie", teacher: "Mme. François", room: "Labo 2", type: "course" },
      { startTime: "11:30", endTime: "12:15", subject: "Anglais", teacher: "Mme. Sylvain", room: "Salle 402", type: "course" },
      { startTime: "12:15", endTime: "13:00", subject: "Pause Déjeuner", teacher: "", room: "", type: "lunch" },
    ],
    mardi: [
      { startTime: "07:30", endTime: "08:15", subject: "Littérature", teacher: "Mme. Romain", room: "Salle 401", type: "course" },
      { startTime: "08:15", endTime: "09:00", subject: "Biologie", teacher: "Mme. Joseph", room: "Labo 1", type: "course" },
      { startTime: "09:00", endTime: "09:45", subject: "Mathématiques", teacher: "M. Gédéon", room: "Salle 401", type: "course" },
      { startTime: "09:45", endTime: "10:00", subject: "Récréation", teacher: "", room: "", type: "break" },
      { startTime: "10:00", endTime: "10:45", subject: "Physique", teacher: "M. Métayer", room: "Labo 2", type: "course" },
      { startTime: "10:45", endTime: "11:30", subject: "Histoire", teacher: "M. Bien-Aimé", room: "Salle 401", type: "course" },
      { startTime: "11:30", endTime: "12:15", subject: "Informatique", teacher: "M. Étienne", room: "Salle Info", type: "course" },
      { startTime: "12:15", endTime: "13:00", subject: "Pause Déjeuner", teacher: "", room: "", type: "lunch" },
    ],
    mercredi: [
      { startTime: "07:30", endTime: "08:15", subject: "Mathématiques", teacher: "M. Gédéon", room: "Salle 401", type: "course" },
      { startTime: "08:15", endTime: "09:00", subject: "Philosophie", teacher: "M. Casimir", room: "Salle 401", type: "course" },
      { startTime: "09:00", endTime: "09:45", subject: "Chimie", teacher: "Mme. François", room: "Labo 2", type: "course" },
      { startTime: "09:45", endTime: "10:00", subject: "Récréation", teacher: "", room: "", type: "break" },
      { startTime: "10:00", endTime: "10:45", subject: "Anglais", teacher: "Mme. Sylvain", room: "Salle 402", type: "course" },
      { startTime: "10:45", endTime: "11:30", subject: "Géographie", teacher: "M. Bien-Aimé", room: "Salle 401", type: "course" },
    ],
    jeudi: [
      { startTime: "07:30", endTime: "08:15", subject: "Physique", teacher: "M. Métayer", room: "Labo 2", type: "course" },
      { startTime: "08:15", endTime: "09:00", subject: "Philosophie", teacher: "M. Casimir", room: "Salle 401", type: "course" },
      { startTime: "09:00", endTime: "09:45", subject: "Littérature", teacher: "Mme. Romain", room: "Salle 401", type: "course" },
      { startTime: "09:45", endTime: "10:00", subject: "Récréation", teacher: "", room: "", type: "break" },
      { startTime: "10:00", endTime: "10:45", subject: "Biologie", teacher: "Mme. Joseph", room: "Labo 1", type: "course" },
      { startTime: "10:45", endTime: "11:30", subject: "Mathématiques", teacher: "M. Gédéon", room: "Salle 401", type: "course" },
      { startTime: "11:30", endTime: "12:15", subject: "Éducation Physique", teacher: "M. Pierre", room: "Terrain", type: "course" },
      { startTime: "12:15", endTime: "13:00", subject: "Pause Déjeuner", teacher: "", room: "", type: "lunch" },
    ],
    vendredi: [
      { startTime: "07:30", endTime: "08:15", subject: "Chimie", teacher: "Mme. François", room: "Labo 2", type: "course" },
      { startTime: "08:15", endTime: "09:00", subject: "Mathématiques", teacher: "M. Gédéon", room: "Salle 401", type: "course" },
      { startTime: "09:00", endTime: "09:45", subject: "Anglais", teacher: "Mme. Sylvain", room: "Salle 402", type: "course" },
      { startTime: "09:45", endTime: "10:00", subject: "Récréation", teacher: "", room: "", type: "break" },
      { startTime: "10:00", endTime: "10:45", subject: "Littérature", teacher: "Mme. Romain", room: "Salle 401", type: "course" },
      { startTime: "10:45", endTime: "11:30", subject: "Philosophie", teacher: "M. Casimir", room: "Salle 401", type: "course" },
    ],
  },
};
