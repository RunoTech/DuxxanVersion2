import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { UserService } from '../services/UserService';
import { insertUserSchema } from '@shared/schema';
import { z } from 'zod';

export class UserController extends BaseController {
  private userService = new UserService();

  // Get current user profile
  getCurrentUser = this.asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    if (!user) {
      return this.sendError(res, 'User not found', 404);
    }

    const userProfile = await this.userService.getUserProfile(user.id);
    if (!userProfile) {
      return this.sendError(res, 'User profile not found', 404);
    }

    this.sendSuccess(res, userProfile, 'User profile retrieved successfully');
  });

  // Get user by ID
  getUserById = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return this.sendError(res, 'Invalid user ID', 400);
    }

    const user = await this.userService.getUserProfile(userId);
    if (!user) {
      return this.sendError(res, 'User not found', 404);
    }

    // Remove sensitive data for public view
    const publicUser = {
      id: user.id,
      username: user.username,
      walletAddress: user.walletAddress,
      totalRaffleEntries: user.totalRaffleEntries,
      totalDonations: user.totalDonations,
      createdAt: user.createdAt
    };

    this.sendSuccess(res, publicUser, 'User profile retrieved successfully');
  });

  // Create new user
  createUser = [
    this.validateBody(insertUserSchema),
    this.asyncHandler(async (req: Request, res: Response) => {
      const userData = req.body;

      try {
        const user = await this.userService.createUser(userData);
        this.sendSuccess(res, user, 'User created successfully', 201);
      } catch (error) {
        if (error instanceof Error && error.message.includes('already exists')) {
          return this.sendError(res, error.message, 409);
        }
        throw error;
      }
    })
  ];

  // Update user profile
  updateUser = [
    this.requireAuth(),
    this.validateBody(insertUserSchema.partial()),
    this.asyncHandler(async (req: Request, res: Response) => {
      const user = (req as any).user;
      const updates = req.body;

      const updatedUser = await this.userService.updateUser(user.id, updates);
      if (!updatedUser) {
        return this.sendError(res, 'Failed to update user', 400);
      }

      this.sendSuccess(res, updatedUser, 'User updated successfully');
    })
  ];

  // Get user statistics
  getUserStats = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return this.sendError(res, 'Invalid user ID', 400);
    }

    const stats = await this.userService.getUserStats(userId);
    this.sendSuccess(res, stats, 'User statistics retrieved successfully');
  });

  // Delete user account
  deleteUser = [
    this.requireAuth(),
    this.asyncHandler(async (req: Request, res: Response) => {
      const user = (req as any).user;
      
      const deleted = await this.userService.deleteUser(user.id);
      if (!deleted) {
        return this.sendError(res, 'Failed to delete user', 400);
      }

      this.sendSuccess(res, { deleted: true }, 'User account deleted successfully');
    })
  ];

  // Authenticate user by wallet
  authenticateWallet = [
    this.validateBody(z.object({
      walletAddress: z.string().min(1, 'Wallet address is required'),
      signature: z.string().optional(),
      message: z.string().optional()
    })),
    this.asyncHandler(async (req: Request, res: Response) => {
      const { walletAddress } = req.body;

      let user = await this.userService.getUserByWallet(walletAddress);
      
      if (!user) {
        // Create new user if doesn't exist
        user = await this.userService.createUser({
          walletAddress: walletAddress.toLowerCase(),
          username: `User_${walletAddress.slice(-6)}`,
          email: null,
          totalRaffleEntries: 0,
          totalDonations: 0
        });
      }

      // Set user in session (assuming passport is used)
      (req as any).login(user, (err: any) => {
        if (err) {
          return this.sendError(res, 'Authentication failed', 500);
        }
        this.sendSuccess(res, user, 'Authentication successful');
      });
    })
  ];
}