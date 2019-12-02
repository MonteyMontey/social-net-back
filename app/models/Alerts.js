const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AlertSchema = new Schema({
  receiver: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  body: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

mongoose.model('alerts', AlertSchema);