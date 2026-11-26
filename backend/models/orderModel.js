const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        selectedSize: {
          type: String,
          enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
          required: true,
        },
      },
    ],
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryAddress: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in_delivery', 'completed', 'cancelled', 'shipped', 'delivered'],
      default: 'pending',
    },
    closedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
