export const SEED_ROLES = [
  { name: 'admin', description: 'Administrator with full access' },
  { name: 'super-user', description: 'Power user with elevated permissions' },
  { name: 'user', description: 'Standard user' },
];

export const SEED_USERS = [
  {
    email: 'admin@siren.dev',
    password: 'Admin123',
    fullName: 'Admin User',
    roleName: 'admin',
  },
  {
    email: 'superuser@siren.dev',
    password: 'Super123',
    fullName: 'Super User',
    roleName: 'super-user',
  },
  {
    email: 'user@siren.dev',
    password: 'User1234',
    fullName: 'Regular User',
    roleName: 'user',
  },
];
