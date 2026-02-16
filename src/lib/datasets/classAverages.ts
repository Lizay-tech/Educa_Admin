export type StudentAverage = {
  id: string;
  name: string;
  average: number;
};

export const classAveragesDataset: Record<string, StudentAverage[]> = {
  NS1: [
    { id: "ST-001", name: "Jean Dupont", average: 88 },
    { id: "ST-002", name: "Marie Pierre", average: 84 },
    { id: "ST-003", name: "David Joseph", average: 79 },
    { id: "ST-004", name: "Sandra Michel", average: 75 },
    { id: "ST-005", name: "Paul Louis", average: 69 },
  ],

  NS2: [
    { id: "ST-101", name: "Laura Georges", average: 40 },
    { id: "ST-102", name: "Jacques Laurent", average: 50 },
    { id: "ST-103", name: "Mickael Pierre", average: 40 },
    { id: "ST-104", name: "Carine Noel", average: 40 },
    { id: "ST-105", name: "Samuel Charles", average: 60 },
  ],

  NS3: [
    { id: "ST-201", name: "Clara Jean", average: 95 },
    { id: "ST-202", name: "Patrick Denis", average: 89 },
    { id: "ST-203", name: "Luna Pierre", average: 83 },
    { id: "ST-204", name: "Robenson Paul", average: 76 },
    { id: "ST-205", name: "Fabiola Pierre", average: 70 },
  ],

  NS4: [
    { id: "ST-301", name: "Frantz Belizaire", average: 47 },
    { id: "ST-302", name: "Rose Marie", average: 52 },
    { id: "ST-303", name: "Elie Toussaint", average: 39 },
    { id: "ST-304", name: "Nadège Fils-Aimé", average: 58 },
    { id: "ST-305", name: "Marc Antoine", average: 44 },
  ],
};