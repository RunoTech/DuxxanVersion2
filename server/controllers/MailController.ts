import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { storage } from '../storage';
import { z } from 'zod';

const sendMailSchema = z.object({
  toWalletAddress: z.string().min(1, 'Recipient wallet address is required'),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject too long'),
  content: z.string().min(1, 'Content is required').max(10000, 'Content too long'),
  raffleId: z.number().optional(),
  communityId: z.number().optional(),
});

export class MailController extends BaseController {
  // Get user's mailbox messages
  getMailbox = [
    this.requireAuth(),
    this.asyncHandler(async (req: Request, res: Response) => {
      const user = (req as any).user;
      const { category } = req.query;
      
      const messages = await storage.getMailMessages(
        user.walletAddress, 
        category as string
      );
      
      this.sendSuccess(res, messages, 'Mailbox retrieved successfully');
    })
  ];

  // Send a new mail message
  sendMail = [
    this.requireAuth(),
    this.validateBody(sendMailSchema),
    this.asyncHandler(async (req: Request, res: Response) => {
      const user = (req as any).user;
      const { toWalletAddress, subject, content, raffleId, communityId } = req.body;

      // Determine category based on context
      let category = 'user';
      if (communityId) category = 'community';

      const message = await storage.sendMailMessage({
        fromWalletAddress: user.walletAddress,
        toWalletAddress,
        subject,
        content,
        category,
        raffleId,
        communityId
      });

      this.sendSuccess(res, message, 'Mail sent successfully');
    })
  ];

  // Mark mail as read
  markAsRead = [
    this.requireAuth(),
    this.asyncHandler(async (req: Request, res: Response) => {
      const user = (req as any).user;
      const messageId = parseInt(req.params.id);

      if (isNaN(messageId)) {
        return this.sendError(res, 'Invalid message ID', 400);
      }

      const success = await storage.markMailAsRead(messageId, user.walletAddress);
      
      if (!success) {
        return this.sendError(res, 'Failed to mark as read', 400);
      }

      this.sendSuccess(res, { marked: true }, 'Mail marked as read');
    })
  ];

  // Toggle mail star status
  toggleStar = [
    this.requireAuth(),
    this.validateBody(z.object({
      starred: z.boolean()
    })),
    this.asyncHandler(async (req: Request, res: Response) => {
      const user = (req as any).user;
      const messageId = parseInt(req.params.id);
      const { starred } = req.body;

      if (isNaN(messageId)) {
        return this.sendError(res, 'Invalid message ID', 400);
      }

      const success = await storage.markMailAsStarred(messageId, user.walletAddress, starred);
      
      if (!success) {
        return this.sendError(res, 'Failed to update star status', 400);
      }

      this.sendSuccess(res, { starred }, 'Star status updated');
    })
  ];

  // Get unread mail count
  getUnreadCount = [
    this.requireAuth(),
    this.asyncHandler(async (req: Request, res: Response) => {
      const user = (req as any).user;
      
      const count = await storage.getUnreadMailCount(user.walletAddress);
      
      this.sendSuccess(res, { count }, 'Unread count retrieved');
    })
  ];

  // Send community message (to all members)
  sendCommunityMessage = [
    this.requireAuth(),
    this.validateBody(z.object({
      communityId: z.number(),
      subject: z.string().min(1).max(200),
      content: z.string().min(1).max(10000),
    })),
    this.asyncHandler(async (req: Request, res: Response) => {
      const user = (req as any).user;
      const { communityId, subject, content } = req.body;

      // TODO: Check if user has permission to send community messages
      
      const sentCount = await storage.sendCommunityMessage(
        user.walletAddress,
        communityId,
        subject,
        content
      );

      this.sendSuccess(res, { sentCount }, `Message sent to ${sentCount} community members`);
    })
  ];
}