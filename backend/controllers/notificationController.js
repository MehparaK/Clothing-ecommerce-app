const mongoose = require('mongoose');
const Notification = require('../models/notificationModel');

const MAX_NOTIFICATIONS = 50;

const getNotifications = async (req, res) => {
  try {
    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ user: req.user._id })
        .populate('product', 'name image price stock')
        .sort({ notifiedAt: -1, _id: -1 })
        .limit(MAX_NOTIFICATIONS),
      Notification.countDocuments({ user: req.user._id, read: false }),
    ]);

    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: 'Bildirişlər yüklənərkən xəta baş verdi.' });
  }
};

const markNotificationRead = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Bildiriş identifikatoru yanlışdır.' });
  }

  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Bildiriş tapılmadı.' });
    }

    res.json({ message: 'Bildiriş oxundu kimi işarələndi.' });
  } catch (error) {
    res.status(500).json({ message: 'Bildiriş yenilənərkən xəta baş verdi.' });
  }
};

const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { read: true }
    );

    res.json({ message: 'Bütün bildirişlər oxundu kimi işarələndi.' });
  } catch (error) {
    res.status(500).json({ message: 'Bildirişlər yenilənərkən xəta baş verdi.' });
  }
};

module.exports = {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
