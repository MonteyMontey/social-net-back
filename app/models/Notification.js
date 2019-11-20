const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  receiver: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  type: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: false
  },
  isRead: {
    type: Boolean,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

mongoose.model('notifications', NotificationSchema);