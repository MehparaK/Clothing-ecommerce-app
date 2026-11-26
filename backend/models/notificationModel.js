const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    type: {
      type: String,
      enum: ['back_in_stock', 'price_drop'],
      default: 'back_in_stock',
    },
    // Endirim bildirişi üçün qiymət anlık görüntüsü
    price: {
      type: Number,
      min: 0,
    },
    previousPrice: {
      type: Number,
      min: 0,
    },
    read: {
      type: Boolean,
      default: false,
    },
    notifiedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Bir istifadəçi üçün eyni məhsul barədə təkrar bildiriş yığılmasın
notificationSchema.index({ user: 1, product: 1, type: 1 }, { unique: true });
notificationSchema.index({ user: 1, read: 1, notifiedAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
