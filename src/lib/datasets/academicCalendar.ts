export type CalendarEvent = {
  date: string; // format YYYY-MM-DD
  title: string;
  type: "holiday" | "school" | "exam" | "vacation";
};

/* ================= JOURS FÉRIÉS HAÏTIENS ================= */

export const defaultHolidays: CalendarEvent[] = [
  { date: "2026-01-01", title: "Jour de l'Indépendance / Jour de l'An", type: "holiday" },
  { date: "2026-01-02", title: "Jour des Aïeux", type: "holiday" },
  { date: "2026-03-03", title: "Lundi Gras (Carnaval)", type: "holiday" },
  { date: "2026-03-04", title: "Mardi Gras (Carnaval)", type: "holiday" },
  { date: "2026-03-05", title: "Mercredi des Cendres", type: "holiday" },
  { date: "2026-04-18", title: "Vendredi Saint", type: "holiday" },
  { date: "2026-05-01", title: "Fête du Travail / Fête de l'Agriculture", type: "holiday" },
  { date: "2026-05-18", title: "Fête du Drapeau et de l'Université", type: "holiday" },
  { date: "2026-05-25", title: "Fête des Mères", type: "holiday" },
  { date: "2026-05-29", title: "Ascension", type: "holiday" },
  { date: "2026-06-08", title: "Fête-Dieu (Corpus Christi)", type: "holiday" },
  { date: "2026-06-15", title: "Fête des Pères", type: "holiday" },
  { date: "2026-08-15", title: "Assomption", type: "holiday" },
  { date: "2026-10-17", title: "Anniversaire de la mort de Dessalines", type: "holiday" },
  { date: "2026-11-01", title: "Toussaint", type: "holiday" },
  { date: "2026-11-02", title: "Jour des Morts", type: "holiday" },
  { date: "2026-11-18", title: "Bataille de Vertières", type: "holiday" },
  { date: "2026-12-25", title: "Noël", type: "holiday" },
];

/* ================= EVENEMENTS SCOLAIRES ================= */

export const schoolEvents: CalendarEvent[] = [
  /* --- RENTRÉE --- */
  { date: "2026-09-02", title: "Rentrée scolaire", type: "school" },
  { date: "2026-09-02", title: "Début du 1er trimestre", type: "school" },

  /* --- 1ER TRIMESTRE (Sep – Déc) --- */
  { date: "2026-09-16", title: "Réunion parents-professeurs", type: "school" },
  { date: "2026-10-14", title: "Examens partiels — 1er trimestre", type: "exam" },
  { date: "2026-10-18", title: "Fin des examens partiels — 1er trimestre", type: "exam" },
  { date: "2026-11-11", title: "Remise des bulletins — mi-trimestre", type: "school" },
  { date: "2026-12-09", title: "Examens finaux — 1er trimestre", type: "exam" },
  { date: "2026-12-13", title: "Fin des examens finaux — 1er trimestre", type: "exam" },
  { date: "2026-12-16", title: "Remise des bulletins — 1er trimestre", type: "school" },
  { date: "2026-12-20", title: "Début des vacances de Noël", type: "vacation" },

  /* --- VACANCES DE NOËL --- */
  { date: "2026-01-06", title: "Reprise des cours / Début du 2e trimestre", type: "school" },

  /* --- 2E TRIMESTRE (Jan – Mars) --- */
  { date: "2026-01-20", title: "Réunion parents-professeurs", type: "school" },
  { date: "2026-02-10", title: "Examens partiels — 2e trimestre", type: "exam" },
  { date: "2026-02-14", title: "Fin des examens partiels — 2e trimestre", type: "exam" },
  { date: "2026-03-01", title: "Début des vacances de Carnaval", type: "vacation" },
  { date: "2026-03-06", title: "Reprise des cours après Carnaval", type: "school" },
  { date: "2026-03-10", title: "Remise des bulletins — mi-trimestre", type: "school" },
  { date: "2026-03-17", title: "Examens finaux — 2e trimestre", type: "exam" },
  { date: "2026-03-21", title: "Fin des examens finaux — 2e trimestre", type: "exam" },
  { date: "2026-03-24", title: "Remise des bulletins — 2e trimestre", type: "school" },

  /* --- VACANCES DE PÂQUES --- */
  { date: "2026-04-14", title: "Début des vacances de Pâques", type: "vacation" },
  { date: "2026-04-21", title: "Reprise des cours / Début du 3e trimestre", type: "school" },

  /* --- 3E TRIMESTRE (Avr – Juin) --- */
  { date: "2026-04-28", title: "Réunion parents-professeurs", type: "school" },
  { date: "2026-05-12", title: "Examens partiels — 3e trimestre", type: "exam" },
  { date: "2026-05-16", title: "Fin des examens partiels — 3e trimestre", type: "exam" },
  { date: "2026-05-26", title: "Remise des bulletins — mi-trimestre", type: "school" },
  { date: "2026-06-09", title: "Examens finaux — 3e trimestre", type: "exam" },
  { date: "2026-06-13", title: "Fin des examens finaux — 3e trimestre", type: "exam" },
  { date: "2026-06-16", title: "Remise des bulletins — 3e trimestre", type: "school" },

  /* --- EXAMENS OFFICIELS --- */
  { date: "2026-06-23", title: "Début des examens officiels (6e AF)", type: "exam" },
  { date: "2026-06-27", title: "Fin des examens officiels (6e AF)", type: "exam" },
  { date: "2026-07-07", title: "Début des examens officiels (9e AF / BEPC)", type: "exam" },
  { date: "2026-07-11", title: "Fin des examens officiels (9e AF / BEPC)", type: "exam" },
  { date: "2026-07-14", title: "Début des examens officiels (Philo / Bacc I & II)", type: "exam" },
  { date: "2026-07-18", title: "Fin des examens officiels (Philo / Bacc I & II)", type: "exam" },

  /* --- FIN D'ANNÉE --- */
  { date: "2026-06-20", title: "Cérémonie de fin d'année", type: "school" },
  { date: "2026-06-23", title: "Début des vacances d'été", type: "vacation" },
  { date: "2026-07-21", title: "Publication des résultats officiels", type: "school" },
];

/* ================= CALENDRIER GLOBAL ================= */

export const academicCalendar = [
  ...defaultHolidays,
  ...schoolEvents,
];
