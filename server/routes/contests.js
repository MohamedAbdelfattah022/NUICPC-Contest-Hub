import express from 'express';
import {
    createContest,
    getAllContests,
    getContestById,
    updateContest,
    deleteContest
} from '../controllers/contestController.js';
import { verifyToken } from '../middleware/auth_middleware.js';

const router = express.Router();



router.get('/', getAllContests);
router.get('/:id', getContestById);

router.post('/', createContest);
router.put('/:id', updateContest);
// router.use(verifyToken);
router.delete('/:id', deleteContest);

export default router;