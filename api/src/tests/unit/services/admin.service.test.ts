// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
// import { AdminService } from '../../../src/services/admin.service';
// import { LoggingService } from '../../../src/services/logging.service';
// import pool from '../../../src/db/config';


// jest.mock('../../../src/db/config');
// jest.mock('../../../src/services/logging.service');
// jest.mock('bcrypt');
// jest.mock('jsonwebtoken');

// const mockedPool = pool as jest.Mocked<typeof pool>;
// const mockedLoggingService = LoggingService as jest.Mocked<typeof LoggingService>;
// const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
// const mockedJwt = jwt as jest.Mocked<typeof jwt>;

// describe('AdminService', () => {
//   let adminService: AdminService;

//   beforeEach(() => {
//     adminService = new AdminService();
//     jest.clearAllMocks();


//     process.env.JWT_SECRET = 'test-secret';
//   });

//   describe('createAdminUser', () => {
//     const mockAdminData = {
//       username: 'testadmin',
//       email: 'admin@test.com',
//       password: 'password123',
//       role: 'admin' as const
//     };

//     it('should create a new admin user successfully', async () => {
//       const hashedPassword = 'hashed-password';
//       const mockResult = {
//         rows: [{
//           id: 1,
//           username: mockAdminData.username,
//           email: mockAdminData.email,
//           role: mockAdminData.role,
//           is_active: true,
//           created_at: new Date()
//         }]
//       };

//       mockedBcrypt.hash.mockResolvedValue(hashedPassword);
//       mockedPool.query.mockResolvedValue(mockResult);

//       const result = await adminService.createAdminUser(
//         mockAdminData.username,
//         mockAdminData.email,
//         mockAdminData.password,
//         mockAdminData.role
//       );

//       expect(mockedBcrypt.hash).toHaveBeenCalledWith(mockAdminData.password, 12);
//       expect(mockedPool.query).toHaveBeenCalledWith(
//         expect.stringContaining('INSERT INTO "AdminUser"'),
//         [mockAdminData.username, mockAdminData.email, hashedPassword, mockAdminData.role, true]
//       );
//       expect(mockedLoggingService.logAdminAction).toHaveBeenCalledWith(
//         'system',
//         'CREATE_ADMIN',
//         mockAdminData.username,
//         { role: mockAdminData.role, email: mockAdminData.email }
//       );
//       expect(result).toEqual(expect.objectContaining({
//         id: 1,
//         username: mockAdminData.username,
//         email: mockAdminData.email,
//         role: mockAdminData.role,
//         isActive: true
//       }));
//     });

//     it('should throw error when username or email already exists', async () => {
//       const error = new Error('Unique constraint violation');
//       (error as any).code = '23505';

//       mockedBcrypt.hash.mockResolvedValue('hashed-password');
//       mockedPool.query.mockRejectedValue(error);

//       await expect(adminService.createAdminUser(
//         mockAdminData.username,
//         mockAdminData.email,
//         mockAdminData.password
//       )).rejects.toThrow('Username or email already exists');

//       expect(mockedLoggingService.logError).toHaveBeenCalled();
//     });

//     it('should throw error for other database errors', async () => {
//       const error = new Error('Database connection failed');
//       mockedBcrypt.hash.mockResolvedValue('hashed-password');
//       mockedPool.query.mockRejectedValue(error);

//       await expect(adminService.createAdminUser(
//         mockAdminData.username,
//         mockAdminData.email,
//         mockAdminData.password
//       )).rejects.toThrow('Failed to create admin user: Database connection failed');

//       expect(mockedLoggingService.logError).toHaveBeenCalled();
//     });
//   });

//   describe('authenticateAdmin', () => {
//     const mockAdminData = {
//       id: 1,
//       username: 'testadmin',
//       email: 'admin@test.com',
//       password_hash: 'hashed-password',
//       role: 'admin',
//       is_active: true,
//       last_login: null,
//       created_at: new Date()
//     };

//     it('should authenticate admin successfully', async () => {
//       const mockResult = { rows: [mockAdminData] };
//       const token = 'jwt-token';

//       mockedPool.query
//         .mockResolvedValueOnce(mockResult)
//         .mockResolvedValueOnce({}); 

//       mockedBcrypt.compare.mockResolvedValue(true);
//       mockedJwt.sign.mockReturnValue(token);

//       const result = await adminService.authenticateAdmin(
//         mockAdminData.email,
//         'password123'
//       );

//       expect(mockedPool.query).toHaveBeenCalledWith(
//         expect.stringContaining('SELECT id, username'),
//         [mockAdminData.email]
//       );
//       expect(mockedBcrypt.compare).toHaveBeenCalledWith('password123', mockAdminData.password_hash);
//       expect(mockedJwt.sign).toHaveBeenCalledWith(
//         expect.objectContaining({
//           id: mockAdminData.id,
//           username: mockAdminData.username,
//           email: mockAdminData.email,
//           role: mockAdminData.role,
//           type: 'admin'
//         }),
//         'test-secret',
//         { expiresIn: '8h' }
//       );
//       expect(mockedLoggingService.logAuth).toHaveBeenCalledWith('1', 'ADMIN_LOGIN');
//       expect(result).toEqual({
//         token,
//         admin: expect.objectContaining({
//           id: 1,
//           username: mockAdminData.username,
//           email: mockAdminData.email,
//           role: mockAdminData.role,
//           isActive: true
//         })
//       });
//     });

//     it('should return null when admin not found', async () => {
//       mockedPool.query.mockResolvedValue({ rows: [] });

//       const result = await adminService.authenticateAdmin(
//         'nonexistent@test.com',
//         'password123'
//       );

//       expect(result).toBeNull();
//       expect(mockedLoggingService.logSecurity).toHaveBeenCalledWith(
//         'ADMIN_LOGIN_FAILED',
//         { email: 'nonexistent@test.com', reason: 'user_not_found' }
//       );
//     });

//     it('should return null when password is invalid', async () => {
//       const mockResult = { rows: [mockAdminData] };

//       mockedPool.query.mockResolvedValue(mockResult);
//       mockedBcrypt.compare.mockResolvedValue(false);

//       const result = await adminService.authenticateAdmin(
//         mockAdminData.email,
//         'wrongpassword'
//       );

//       expect(result).toBeNull();
//       expect(mockedLoggingService.logSecurity).toHaveBeenCalledWith(
//         'ADMIN_LOGIN_FAILED',
//         { email: mockAdminData.email, reason: 'invalid_password' }
//       );
//     });

//     it('should throw error on database failure', async () => {
//       const error = new Error('Database error');
//       mockedPool.query.mockRejectedValue(error);

//       await expect(adminService.authenticateAdmin(
//         mockAdminData.email,
//         'password123'
//       )).rejects.toThrow('Authentication failed: Database error');

//       expect(mockedLoggingService.logError).toHaveBeenCalled();
//     });
//   });

//   describe('getAdminById', () => {
//     it('should return admin when found', async () => {
//       const mockAdmin = {
//         id: 1,
//         username: 'testadmin',
//         email: 'admin@test.com',
//         role: 'admin',
//         is_active: true,
//         last_login: null,
//         created_at: new Date()
//       };

//       mockedPool.query.mockResolvedValue({ rows: [mockAdmin] });

//       const result = await adminService.getAdminById(1);

//       expect(mockedPool.query).toHaveBeenCalledWith(
//         expect.stringContaining('SELECT id, username'),
//         [1]
//       );
//       expect(result).toEqual({
//         id: 1,
//         username: 'testadmin',
//         email: 'admin@test.com',
//         role: 'admin',
//         isActive: true,
//         lastLogin: null,
//         createdAt: mockAdmin.created_at
//       });
//     });

//     it('should return null when admin not found', async () => {
//       mockedPool.query.mockResolvedValue({ rows: [] });

//       const result = await adminService.getAdminById(999);

//       expect(result).toBeNull();
//     });
//   });

//   describe('getAllAdmins', () => {
//     it('should return all admins', async () => {
//       const mockAdmins = [
//         {
//           id: 1,
//           username: 'admin1',
//           email: 'admin1@test.com',
//           role: 'admin',
//           is_active: true,
//           last_login: null,
//           created_at: new Date()
//         },
//         {
//           id: 2,
//           username: 'admin2',
//           email: 'admin2@test.com',
//           role: 'moderator',
//           is_active: true,
//           last_login: new Date(),
//           created_at: new Date()
//         }
//       ];

//       mockedPool.query.mockResolvedValue({ rows: mockAdmins });

//       const result = await adminService.getAllAdmins();

//       expect(mockedPool.query).toHaveBeenCalledWith(
//         expect.stringContaining('SELECT id, username'),
//         []
//       );
//       expect(result).toHaveLength(2);
//       expect(result[0]).toEqual(expect.objectContaining({
//         id: 1,
//         username: 'admin1',
//         email: 'admin1@test.com',
//         role: 'admin'
//       }));
//     });
//   });

//   describe('updateAdminRole', () => {
//     it('should update admin role successfully', async () => {
//       const mockResult = {
//         rows: [{
//           id: 1,
//           username: 'testadmin',
//           email: 'admin@test.com',
//           role: 'super_admin',
//           is_active: true,
//           last_login: null,
//           created_at: new Date()
//         }]
//       };

//       mockedPool.query.mockResolvedValue(mockResult);

//       const result = await adminService.updateAdminRole(1, 'super_admin', 2);

//       expect(mockedPool.query).toHaveBeenCalledWith(
//         expect.stringContaining('UPDATE "AdminUser" SET role'),
//         ['super_admin', 1]
//       );
//       expect(mockedLoggingService.logAdminAction).toHaveBeenCalledWith(
//         '2',
//         'UPDATE_ADMIN_ROLE',
//         '1',
//         { newRole: 'super_admin' }
//       );
//       expect(result.role).toBe('super_admin');
//     });

//     it('should throw error when admin not found', async () => {
//       mockedPool.query.mockResolvedValue({ rows: [] });

//       await expect(adminService.updateAdminRole(999, 'admin', 1))
//         .rejects.toThrow('Admin not found or inactive');
//     });
//   });

//   describe('deactivateAdmin', () => {
//     it('should deactivate admin successfully', async () => {
//       mockedPool.query.mockResolvedValue({ rowCount: 1 });

//       await adminService.deactivateAdmin(1, 2);

//       expect(mockedPool.query).toHaveBeenCalledWith(
//         expect.stringContaining('UPDATE "AdminUser" SET is_active'),
//         [1]
//       );
//       expect(mockedLoggingService.logAdminAction).toHaveBeenCalledWith(
//         '2',
//         'DEACTIVATE_ADMIN',
//         '1'
//       );
//     });

//     it('should throw error when admin not found', async () => {
//       mockedPool.query.mockResolvedValue({ rowCount: 0 });

//       await expect(adminService.deactivateAdmin(999, 1))
//         .rejects.toThrow('Admin not found');
//     });
//   });

//   describe('changePassword', () => {
//     it('should change password successfully', async () => {
//       const currentPassword = 'oldpassword';
//       const newPassword = 'newpassword';
//       const hashedNewPassword = 'new-hashed-password';


//       mockedPool.query
//         .mockResolvedValueOnce({ rows: [{ password_hash: 'old-hash' }] }) // SELECT
//         .mockResolvedValueOnce({}); // UPDATE

//       mockedBcrypt.compare.mockResolvedValue(true);
//       mockedBcrypt.hash.mockResolvedValue(hashedNewPassword);

//       await adminService.changePassword(1, currentPassword, newPassword);

//       expect(mockedBcrypt.compare).toHaveBeenCalledWith(currentPassword, 'old-hash');
//       expect(mockedBcrypt.hash).toHaveBeenCalledWith(newPassword, 12);
//       expect(mockedPool.query).toHaveBeenLastCalledWith(
//         expect.stringContaining('UPDATE "AdminUser" SET password_hash'),
//         [hashedNewPassword, 1]
//       );
//       expect(mockedLoggingService.logAdminAction).toHaveBeenCalledWith(
//         '1',
//         'PASSWORD_CHANGE'
//       );
//     });

//     it('should throw error when current password is incorrect', async () => {
//       mockedPool.query.mockResolvedValue({ rows: [{ password_hash: 'old-hash' }] });
//       mockedBcrypt.compare.mockResolvedValue(false);

//       await expect(adminService.changePassword(1, 'wrongpassword', 'newpassword'))
//         .rejects.toThrow('Current password is incorrect');
//     });

//     it('should throw error when admin not found', async () => {
//       mockedPool.query.mockResolvedValue({ rows: [] });

//       await expect(adminService.changePassword(999, 'password', 'newpassword'))
//         .rejects.toThrow('Admin not found');
//     });
//   });

//   describe('getAdminStats', () => {
//     it('should return admin statistics', async () => {
//       const mockStats = {
//         total_admins: 5,
//         active_today: 2,
//         super_admins: 1,
//         admins: 3,
//         moderators: 1
//       };

//       mockedPool.query.mockResolvedValue({ rows: [mockStats] });

//       const result = await adminService.getAdminStats();

//       expect(mockedPool.query).toHaveBeenCalledWith(
//         expect.stringContaining('SELECT COUNT(*) as total_admins'),
//         []
//       );
//       expect(result).toEqual(mockStats);
//     });

//     it('should throw error on database failure', async () => {
//       const error = new Error('Database error');
//       mockedPool.query.mockRejectedValue(error);

//       await expect(adminService.getAdminStats())
//         .rejects.toThrow('Failed to fetch admin stats: Database error');
//     });
//   });
// });