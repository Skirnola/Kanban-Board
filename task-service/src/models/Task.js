import mongoose from 'mongoose'

const allowedStatuses = ['todo', 'in-progress', 'done']

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: allowedStatuses,
      default: 'todo',
    },
  },
  { timestamps: true },
)

taskSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString()
    delete ret._id
    return ret
  },
})

const Task = mongoose.model('Task', taskSchema)

export default Task
export { allowedStatuses }
