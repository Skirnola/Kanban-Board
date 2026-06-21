import { Router } from 'express'
import {
  createTask,
  deleteTask,
  getTasks,
  updateTaskStatus,
} from '../controllers/taskController.js'
import { requireAuth } from '../middleware/authMiddleware.js'

const router = Router()

router.use(requireAuth)
router.route('/').get(getTasks).post(createTask)
router.patch('/:id/status', updateTaskStatus)
router.delete('/:id', deleteTask)

export default router
