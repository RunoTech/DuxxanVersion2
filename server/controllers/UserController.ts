import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { UserService } from '../services/UserService';
import { insertUserSchema } from '@shared/schema';
import { z } from 'zod';

export class UserController extends BaseController {
  private userService = new UserService();

  // Get current user profile
  getCurrentUser = this.asyncHandler(async (req: Request, res: Response) => {
    // Check for wallet address in headers or session
    const walletAddress = req.headers['x-wallet-address'] as string || 
                         (req as any).session?.walletAddress;
    
    if (!walletAddress) {
      return this.sendError(res, 'No authenticated user found', 404);
    }

    const user = await this.userService.getUserByWallet(walletAddress);
    if (!user) {
      return this.sendError(res, 'User not found', 404);
    }

    this.sendSuccess(res, user, 'User profile retrieved successfully');
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

      let user = await this.userService.getUserByWallet(walletAddress.toLowerCase());
      
      if (!user) {
        // Create new user if doesn't exist
        try {
          const userData = {
            walletAddress: walletAddress.toLowerCase(),
            username: `user_${walletAddress.slice(2, 8).toLowerCase()}`,
            organizationType: 'individual' as const
          };
          user = await this.userService.createUser(userData);
        } catch (error: any) {
          // If user already exists (race condition), fetch the existing user
          if (error.message.includes('duplicate key value violates unique constraint')) {
            user = await this.userService.getUserByWallet(walletAddress.toLowerCase());
            if (!user) {
              return this.sendError(res, 'Failed to authenticate wallet', 500);
            }
          } else {
            throw error;
          }
        }
      }

      // Store user data in session-compatible format
      (req as any).user = user;

      this.sendSuccess(res, user, 'Authentication successful');
    })
  ];
}