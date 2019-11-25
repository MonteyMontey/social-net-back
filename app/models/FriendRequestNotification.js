const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FriendRequestNotificationSchema = new Schema({
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
  isRead: {
    type: Boolean,
    default: false
  },
  accepted: {
    type: Boolean,
    default: false
  },
  declined: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

mongoose.model('friendRequestNotifications', FriendRequestNotificationSchema);