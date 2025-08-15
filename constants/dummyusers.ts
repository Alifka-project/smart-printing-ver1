export const dummyUsers = [
  {
    id: "EMP001",
    name: "John Admin",
    role: "admin",
    email: "admin@example.com",
    password: "admin123",
  },
  {
    id: "EMP002",
    name: "Jane Estimator",
    role: "estimator",
    email: "estimator@example.com",
    password: "estimate123",
  },
] as const;


export type AppUserRole = "admin" | "user" | "estimator";
export type AppUserStatus = "Active" | "Inactive";

export interface AppUser {
  id: string;           
  name: string;
  email: string;
  joined: string;      
  role: AppUserRole;
  password?: string
  status: AppUserStatus;
}

export const seedUsers: AppUser[] = [
  { id: "EMP001", name: "EMP001", email: "EMP001@gmail.com", joined: "2025-06-25", role: "admin",     status: "Active" },
  { id: "EMP002", name: "EMP002", email: "EMP002@gmail.com", joined: "2025-06-25", role: "user",      status: "Active" },
  { id: "EMP003", name: "EMP003", email: "EMP003@gmail.com", joined: "2025-06-25", role: "user",      status: "Inactive" },
];
