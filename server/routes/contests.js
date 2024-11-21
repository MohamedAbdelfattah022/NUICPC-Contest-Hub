import express from 'express';
import {
    createContest,
    getAllContests,
    getContestById,
    updateContest,
    deleteContest
} from '../controllers/contestController.js';

const router = express.Router();

router.get('/', getAllContests);
router.post('/', createContest);

router.get('/:id', getContestById);
router.put('/:id', updateContest);
router.delete('/:id', deleteContest);


export default router;