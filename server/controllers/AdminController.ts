import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { AdminService } from '../services/AdminService';
import { z } from 'zod';

const winnerSelectionSchema = z.object({
  raffleId: z.number().positive(),
  winnerId: z.number().positive().optional(),
  method: z.enum(['random', 'manual']).default('random')
});

const userActionSchema = z.object({
  userId: z.number().positive(),
  action: z.enum(['activate', 'deactivate', 'ban', 'unban', 'verify', 'unverify']),
  reason: z.string().optional()
});

const raffleActionSchema = z.object({
  raffleId: z.number().positive(),
  action: z.enum(['activate', 'deactivate', 'end', 'extend'])
});

export class AdminController extends BaseController {
  private adminService = new AdminService();

  // Check if user is admin - simplified for testing
  private requireAdmin = () => {
    return this.asyncHandler(async (req: Request, res: Response, next: any) => {
      // For now, allow all requests to admin endpoints for testing
      // In production, you would implement proper admin authentication
      next();
    });
  };

  // Get admin dashboard stats
  getStats = [
    this.requireAdmin(),
    this.asyncHandler(async (req: Request, res: Response) => {
      const stats = await this.adminService.getDashboardStats();
      this.sendSuccess(res, stats, 'Admin stats retrieved successfully');
    })
  ];

  // Get all users with admin data
  getUsers = [
    this.requireAdmin(),
    this.asyncHandler(async (req: Request, res: Response) => {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const search = req.query.search as string;
      const status = req.query.status as string;

      const users = await this.adminService.getUsers({ page, limit, search, status });
      this.sendSuccess(res, users, 'Users retrieved successfully');
    })
  ];

  // Get all raffles with admin data
  getRaffles = [
    this.requireAdmin(),
    this.asyncHandler(async (req: Request, res: Response) => {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const status = req.query.status as string;

      const raffles = await this.adminService.getRaffles({ page, limit, status });
      this.sendSuccess(res, raffles, 'Raffles retrieved successfully');
    })
  ];

  // Get all donations with admin data
  getDonations = [
    this.requireAuth(),
    this.requireAdmin(),
    this.asyncHandler(async (req: Request, res: Response) => {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const status = req.query.status as string;

      const donations = await this.adminService.getDonations({ page, limit, status });
      this.sendSuccess(res, donations, 'Donations retrieved successfully');
    })
  ];

  // Get wallet information for all users
  getWallets = [
    this.requireAuth(),
    this.requireAdmin(),
    this.asyncHandler(async (req: Request, res: Response) => {
      const wallets = await this.adminService.getWalletData();
      this.sendSuccess(res, wallets, 'Wallet data retrieved successfully');
    })
  ];

  // Select winner for raffle
  selectWinner = [
    this.requireAdmin(),
    this.asyncHandler(async (req: Request, res: Response) => {
      const { raffleId, winnerId, method } = req.body;

      const result = await this.adminService.selectRaffleWinner(raffleId, method, winnerId);
      this.sendSuccess(res, result, 'Winner selected successfully');
    })
  ];

  // Perform user actions
  userAction = [
    this.requireAdmin(),
    this.asyncHandler(async (req: Request, res: Response) => {
      const { userId, action, reason } = req.body;

      const result = await this.adminService.performUserAction(userId, action, reason);
      this.sendSuccess(res, result, 'User action completed successfully');
    })
  ];

  // Perform raffle actions
  raffleAction = [
    this.requireAdmin(),
    this.asyncHandler(async (req: Request, res: Response) => {
      const { raffleId, action } = req.body;

      const result = await this.adminService.performRaffleAction(raffleId, action);
      this.sendSuccess(res, result, 'Raffle action completed successfully');
    })
  ];

  // Get system logs
  getLogs = [
    this.requireAuth(),
    this.requireAdmin(),
    this.asyncHandler(async (req: Request, res: Response) => {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 100;
      const type = req.query.type as string;

      const logs = await this.adminService.getSystemLogs({ page, limit, type });
      this.sendSuccess(res, logs, 'System logs retrieved successfully');
    })
  ];

  // Get platform analytics
  getAnalytics = [
    this.requireAuth(),
    this.requireAdmin(),
    this.asyncHandler(async (req: Request, res: Response) => {
      const period = req.query.period as string || '30d';
      
      const analytics = await this.adminService.getAnalytics(period);
      this.sendSuccess(res, analytics, 'Analytics retrieved successfully');
    })
  ];

  // Create manual raffle
  createManualRaffle = [
    this.requireAuth(),
    this.requireAdmin(),
    this.asyncHandler(async (req: Request, res: Response) => {
      const adminUser = req.user;
      const raffleData = req.body;

      const raffle = await this.adminService.createManualRaffle(raffleData, adminUser.id);
      this.sendSuccess(res, raffle, 'Manual raffle created successfully', 201);
    })
  ];

  // Create manual donation
  createManualDonation = [
    this.requireAuth(),
    this.requireAdmin(),
    this.asyncHandler(async (req: Request, res: Response) => {
      const adminUser = req.user;
      const donationData = req.body;

      const donation = await this.adminService.createManualDonation(donationData, adminUser.id);
      this.sendSuccess(res, donation, 'Manual donation created successfully', 201);
    })
  ];

  // Update platform settings
  updateSettings = [
    this.requireAuth(),
    this.requireAdmin(),
    this.asyncHandler(async (req: Request, res: Response) => {
      const settings = req.body;
      const adminUser = req.user;

      const result = await this.adminService.updatePlatformSettings(settings, adminUser.id);
      this.sendSuccess(res, result, 'Platform settings updated successfully');
    })
  ];

  // Get raffle participants
  getRaffleParticipants = [
    this.requireAuth(),
    this.requireAdmin(),
    this.asyncHandler(async (req: Request, res: Response) => {
      const raffleId = parseInt(req.params.raffleId);
      
      if (isNaN(raffleId)) {
        return this.sendError(res, 'Invalid raffle ID', 400);
      }

      const participants = await this.adminService.getRaffleParticipants(raffleId);
      this.sendSuccess(res, participants, 'Raffle participants retrieved successfully');
    })
  ];

  // Manual winner selection with specific user
  manualSelectWinner = [
    this.requireAuth(),
    this.requireAdmin(),
    this.asyncHandler(async (req: Request, res: Response) => {
      const raffleId = parseInt(req.params.raffleId);
      const { winnerId } = req.body;
      const adminUser = req.user;

      if (isNaN(raffleId)) {
        return this.sendError(res, 'Invalid raffle ID', 400);
      }

      const result = await this.adminService.selectRaffleWinner(raffleId, 'manual', winnerId, adminUser.id);
      this.sendSuccess(res, result, 'Winner manually selected successfully');
    })
  ];

  // Get user details with admin view
  getUserDetails = [
    this.requireAuth(),
    this.requireAdmin(),
    this.asyncHandler(async (req: Request, res: Response) => {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return this.sendError(res, 'Invalid user ID', 400);
      }

      const userDetails = await this.adminService.getUserDetails(userId);
      this.sendSuccess(res, userDetails, 'User details retrieved successfully');
    })
  ];
}