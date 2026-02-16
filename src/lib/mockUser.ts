import { User } from "@/types/user";

export const mockUser: User = {
  id: "1",
  name: "ESAIE GUERSON LARA",
  email: "educa@gmail.com",
  role: "ADMIN",
};

export const mockSchool = {
  name: "Lycée Jacques Roumain",
  city: "Port-au-Prince",
};

export const mockStats = {
  totalEleves: { value: 452, variation: -5.6 },
  totalClasses: { value: 32, variation: 4.8 },
  totalUtilisateurs: { value: 510, variation: null },
  totalEvaluations: { value: 18, variation: null },
};
