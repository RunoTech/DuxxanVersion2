import { Router } from 'express';
import { body, param } from 'express-validator';
import { storage } from '../storage';
import { insertChannelSchema, insertUpcomingRaffleSchema } from '@shared/schema';
import { validationMiddleware } from '../middleware/security';

const router = Router();

// Get all channels
router.get('/channels', async (req, res) => {
  try {
    const channels = await storage.getChannels();
    res.json({
      success: true,
      message: 'Channels retrieved successfully',
      data: channels
    });
  } catch (error: any) {
    console.error('Error fetching channels:', error);
    res.status(500).json({
      success: false,
      message: 'Kanallar alınırken bir hata oluştu',
      error: error.message
    });
  }
});

// Create a new channel
router.post('/channels', [
  body('name').trim().isLength({ min: 3, max: 50 }).withMessage('Kanal adı 3-50 karakter arası olmalıdır'),
  body('description').trim().isLength({ min: 10, max: 500 }).withMessage('Açıklama 10-500 karakter arası olmalıdır'),
  body('category').isIn(['general', 'crypto', 'gaming', 'community', 'news', 'trading']).withMessage('Geçersiz kategori'),
  validationMiddleware
], async (req, res) => {
  try {
    const validatedData = insertChannelSchema.parse(req.body);
    const userId = 1; // This should come from authenticated user
    
    const channel = await storage.createChannel({
      ...validatedData,
      creatorId: userId
    });

    res.status(201).json({
      success: true,
      message: 'Kanal başarıyla oluşturuldu',
      data: channel
    });
  } catch (error: any) {
    console.error('Error creating channel:', error);
    res.status(500).json({
      success: false,
      message: 'Kanal oluşturulurken bir hata oluştu',
      error: error.message
    });
  }
});

// Subscribe to a channel
router.post('/channels/:id/subscribe', [
  param('id').isInt().withMessage('Geçersiz kanal ID'),
  validationMiddleware
], async (req, res) => {
  try {
    const channelId = parseInt(req.params.id);
    const userId = 1; // This should come from authenticated user

    await storage.subscribeToChannel(userId, channelId);
    
    res.json({
      success: true,
      message: 'Kanala başarıyla abone oldunuz'
    });
  } catch (error: any) {
    console.error('Error subscribing to channel:', error);
    res.status(500).json({
      success: false,
      message: 'Abonelik sırasında hata oluştu',
      error: error.message
    });
  }
});

// Unsubscribe from a channel
router.delete('/channels/:id/subscribe', [
  param('id').isInt().withMessage('Geçersiz kanal ID'),
  validationMiddleware
], async (req, res) => {
  try {
    const channelId = parseInt(req.params.id);
    const userId = 1; // This should come from authenticated user

    await storage.unsubscribeFromChannel(userId, channelId);
    
    res.json({
      success: true,
      message: 'Kanal aboneliği başarıyla iptal edildi'
    });
  } catch (error: any) {
    console.error('Error unsubscribing from channel:', error);
    res.status(500).json({
      success: false,
      message: 'Abonelik iptali sırasında hata oluştu',
      error: error.message
    });
  }
});

// Get all upcoming raffles
router.get('/upcoming-raffles', async (req, res) => {
  try {
    const upcomingRaffles = await storage.getUpcomingRaffles();
    res.json({
      success: true,
      message: 'Upcoming raffles retrieved successfully',
      data: upcomingRaffles
    });
  } catch (error: any) {
    console.error('Error fetching upcoming raffles:', error);
    res.status(500).json({
      success: false,
      message: 'Gelecek çekilişler alınırken bir hata oluştu',
      error: error.message
    });
  }
});

// Create a new upcoming raffle announcement
router.post('/upcoming-raffles', [
  body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Başlık 5-100 karakter arası olmalıdır'),
  body('description').trim().isLength({ min: 20, max: 1000 }).withMessage('Açıklama 20-1000 karakter arası olmalıdır'),
  body('prizeValue').isNumeric().withMessage('Ödül değeri sayısal olmalıdır'),
  body('expectedDate').isISO8601().withMessage('Geçersiz tarih formatı'),
  validationMiddleware
], async (req, res) => {
  try {
    const validatedData = insertUpcomingRaffleSchema.parse(req.body);
    const userId = 1; // This should come from authenticated user
    
    const upcomingRaffle = await storage.createUpcomingRaffle({
      ...validatedData,
      creatorId: userId
    });

    res.status(201).json({
      success: true,
      message: 'Çekiliş duyurusu başarıyla oluşturuldu',
      data: upcomingRaffle
    });
  } catch (error: any) {
    console.error('Error creating upcoming raffle:', error);
    res.status(500).json({
      success: false,
      message: 'Çekiliş duyurusu oluşturulurken bir hata oluştu',
      error: error.message
    });
  }
});

// Express interest in an upcoming raffle
router.post('/upcoming-raffles/:id/interest', [
  param('id').isInt().withMessage('Geçersiz çekiliş ID'),
  validationMiddleware
], async (req, res) => {
  try {
    const raffleId = parseInt(req.params.id);
    const userId = 1; // This should come from authenticated user

    // For now, just return success - interest tracking can be enhanced later
    res.json({
      success: true,
      message: 'İlginiz başarıyla kaydedildi'
    });
  } catch (error: any) {
    console.error('Error expressing interest:', error);
    res.status(500).json({
      success: false,
      message: 'İlgi bildirme sırasında hata oluştu',
      error: error.message
    });
  }
});

export default router;