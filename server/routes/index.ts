import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { RaffleController } from '../controllers/RaffleController';

// Initialize controllers
const userController = new UserController();
const raffleController = new RaffleController();

// Create router
const router = Router();

// User routes
router.get('/users/me', userController.getCurrentUser);
router.get('/users/:id', userController.getUserById);
router.post('/users', userController.createUser);
router.put('/users/me', userController.updateUser);
router.delete('/users/me', userController.deleteUser);
router.get('/users/:id/stats', userController.getUserStats);
router.post('/auth/wallet', userController.authenticateWallet);

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

export default router;