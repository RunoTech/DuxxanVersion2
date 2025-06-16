import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { RaffleController } from '../controllers/RaffleController';
import { DonationController } from '../controllers/DonationController';
import { translationService } from '../../lib/translation';

// Initialize controllers
const userController = new UserController();
const raffleController = new RaffleController();
const donationController = new DonationController();

// Create router
const router = Router();

// User routes
router.get('/users/me', userController.getCurrentUser);
router.get('/users/:id', userController.getUserById);
router.post('/users', userController.createUser);
router.put('/users/me', userController.updateUser);
router.delete('/users/me', userController.deleteUser);
router.get('/users/:id/stats', userController.getUserStats);
router.post('/users/auth/wallet', userController.authenticateWallet);

// Raffle routes
router.get('/raffles', raffleController.getRaffles);
router.get('/raffles/active', raffleController.getActiveRaffles);
router.get('/raffles/my', raffleController.getMyRaffles);
router.get('/raffles/:id', raffleController.getRaffleById);
router.post('/raffles', raffleController.createRaffle);
router.put('/raffles/:id', raffleController.updateRaffle);
router.get('/raffles/creator/:creatorId', raffleController.getRafflesByCreator);

// Ticket routes
router.post('/tickets', raffleController.purchaseTickets);
router.get('/tickets/my', raffleController.getUserTickets);
router.get('/raffles/:id/tickets', raffleController.getRaffleTickets);

// Donation routes
router.get('/donations', donationController.getDonations);
router.get('/donations/active', donationController.getActiveDonations);
router.get('/donations/my', donationController.getMyDonations);
router.get('/donations/:id', donationController.getDonationById);
router.post('/donations', donationController.createDonation);
router.put('/donations/:id', donationController.updateDonation);
router.get('/donations/creator/:creatorId', donationController.getDonationsByCreator);
router.get('/donations/org/:orgType', donationController.getDonationsByOrganizationType);
router.get('/donations/stats', donationController.getDonationStats);

// Donation contribution routes
router.post('/donations/:id/contribute', donationController.makeDonationContribution);
router.get('/donations/:id/contributions', donationController.getDonationContributions);
router.post('/donations/:id/startup-fee', donationController.processStartupFeePayment);

// Translation API
router.post('/translate', async (req, res) => {
  try {
    const { text, targetLanguage, sourceLanguage = 'tr' } = req.body;
    
    if (!text || !targetLanguage) {
      return res.status(400).json({ error: 'Text and target language are required' });
    }

    const translatedText = await translationService.translateText(text, targetLanguage, sourceLanguage);
    
    res.json({ 
      translatedText,
      sourceLanguage,
      targetLanguage,
      originalText: text
    });
  } catch (error) {
    console.error('Translation API error:', error);
    res.status(500).json({ error: 'Translation failed' });
  }
});

export default router;