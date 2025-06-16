import { BaseService } from './BaseService';
import { storage } from '../storage';
import { Raffle, InsertRaffle } from '@shared/schema';
import { redis } from '../../lib/redis';
import { firebase } from '../../lib/firebase';

export class RaffleService extends BaseService {
  async getRaffles(limit?: number, offset?: number): Promise<any[]> {
    try {
      // Try cache first
      const cached = await redis.get(`raffles:${limit}:${offset}`);
      if (cached) return cached;
      
      const raffles = await storage.getRaffles(limit, offset);
      
      // Cache for 5 minutes
      await redis.set(`raffles:${limit}:${offset}`, raffles, 300);
      
      return raffles;
    } catch (error) {
      return this.handleError(error, 'Failed to get raffles');
    }
  }

  async getActiveRaffles(): Promise<any[]> {
    try {
      // Skip Redis for now and get directly from database
      const raffles = await storage.getActiveRaffles();
      return raffles || [];
    } catch (error) {
      console.error('Error getting active raffles:', error);
      // Return empty array instead of throwing error
      return [];
    }
  }

  async getRaffleById(id: number): Promise<any | null> {
    try {
      this.validatePositiveNumber(id, 'Raffle ID');
      
      const cached = await redis.get(`raffle:${id}`);
      if (cached) return cached;
      
      const raffle = await storage.getRaffleById(id);
      
      if (raffle) {
        await redis.set(`raffle:${id}`, raffle, 300);
      }
      
      return raffle || null;
    } catch (error) {
      return this.handleError(error, 'Failed to get raffle');
    }
  }

  async createRaffle(raffleData: InsertRaffle & { creatorId: number }): Promise<Raffle> {
    try {
      this.validateRequired(raffleData.title, 'Title');
      this.validateRequired(raffleData.description, 'Description');
      this.validatePositiveNumber(raffleData.creatorId, 'Creator ID');
      
      // Sanitize text fields
      raffleData.title = this.sanitizeString(raffleData.title);
      raffleData.description = this.sanitizeString(raffleData.description);
      
      const raffle = await storage.createRaffle(raffleData);
      
      // Clear cache
      await redis.del('raffles:active');
      await redis.invalidateCache('raffles:*');
      
      // Log to Firebase
      await firebase.saveRaffleEvent(raffle.id, 'raffle_created', {
        creatorId: raffleData.creatorId,
        title: raffle.title,
        prizeValue: raffle.prizeValue,
        timestamp: new Date()
      });
      
      return raffle;
    } catch (error) {
      return this.handleError(error, 'Failed to create raffle');
    }
  }

  async updateRaffle(id: number, updates: Partial<Raffle>): Promise<Raffle | null> {
    try {
      this.validatePositiveNumber(id, 'Raffle ID');
      
      if (updates.title) {
        updates.title = this.sanitizeString(updates.title);
      }
      if (updates.description) {
        updates.description = this.sanitizeString(updates.description);
      }
      
      const raffle = await storage.updateRaffle(id, updates);
      
      if (raffle) {
        // Update cache
        await redis.set(`raffle:${id}`, raffle, 300);
        await redis.del('raffles:active');
        await redis.invalidateCache('raffles:*');
        
        // Log to Firebase
        await firebase.saveRaffleEvent(id, 'raffle_updated', {
          updates,
          timestamp: new Date()
        });
      }
      
      return raffle || null;
    } catch (error) {
      return this.handleError(error, 'Failed to update raffle');
    }
  }

  async getRafflesByCreator(creatorId: number): Promise<Raffle[]> {
    try {
      this.validatePositiveNumber(creatorId, 'Creator ID');
      
      const cached = await redis.get(`raffles:creator:${creatorId}`);
      if (cached) return cached;
      
      const raffles = await storage.getRafflesByCreator(creatorId);
      
      // Cache for 10 minutes
      await redis.set(`raffles:creator:${creatorId}`, raffles, 600);
      
      return raffles;
    } catch (error) {
      return this.handleError(error, 'Failed to get raffles by creator');
    }
  }

  async purchaseTickets(userId: number, raffleId: number, quantity: number, totalAmount: string, transactionHash?: string): Promise<any> {
    try {
      this.validatePositiveNumber(userId, 'User ID');
      this.validatePositiveNumber(raffleId, 'Raffle ID');
      this.validatePositiveNumber(quantity, 'Quantity');
      this.validateRequired(totalAmount, 'Total amount');
      
      // Create ticket entry
      const ticket = await storage.createTicket({
        userId,
        raffleId,
        quantity,
        totalAmount,
        transactionHash: transactionHash || null
      });
      
      // Clear relevant caches
      await redis.del(`raffle:${raffleId}`);
      await redis.del('raffles:active');
      
      // Log to Firebase
      await firebase.saveRaffleEvent(raffleId, 'ticket_purchased', {
        userId,
        quantity,
        totalAmount,
        transactionHash,
        timestamp: new Date()
      });
      
      return ticket;
    } catch (error) {
      return this.handleError(error, 'Failed to purchase tickets');
    }
  }

  async getRaffleTickets(raffleId: number): Promise<any[]> {
    try {
      this.validatePositiveNumber(raffleId, 'Raffle ID');
      
      const tickets = await storage.getTicketsByRaffle(raffleId);
      return tickets;
    } catch (error) {
      return this.handleError(error, 'Failed to get raffle tickets');
    }
  }

  async getUserTickets(userId: number): Promise<any[]> {
    try {
      this.validatePositiveNumber(userId, 'User ID');
      
      const cached = await redis.get(`tickets:user:${userId}`);
      if (cached) return cached;
      
      const tickets = await storage.getTicketsByUser(userId);
      
      // Cache for 5 minutes
      await redis.set(`tickets:user:${userId}`, tickets, 300);
      
      return tickets;
    } catch (error) {
      return this.handleError(error, 'Failed to get user tickets');
    }
  }
}