const User = require('../models/userModel');
const Notification = require('../models/notificationModel');

/**
 * Verilmiş məhsulu sevimlilərinə əlavə etmiş bütün istifadəçilər üçün
 * eyni tipli bildiriş yaradır (və ya mövcud bildirişi yeniləyir).
 *
 * Eyni istifadəçi/məhsul/type üçün təkrar hadisə baş verərsə,
 * mövcud bildiriş yenidən oxunmamış kimi işarələnir.
 */
const notifyFavoriteUsers = async (productId, type, payload = {}) => {
  const userIds = await User.distinct('_id', { favorites: productId });

  if (userIds.length === 0) {
    return 0;
  }

  await Notification.bulkWrite(
    userIds.map((userId) => ({
      updateOne: {
        filter: { user: userId, product: productId, type },
        update: { $set: { read: false, notifiedAt: new Date(), ...payload } },
        upsert: true,
      },
    }))
  );

  return userIds.length;
};

/** Məhsul yenidən stoka düşdükdə. */
const notifyFavoriteUsersInStock = (productId) =>
  notifyFavoriteUsers(productId, 'back_in_stock');

/** Sevimli məhsulun qiyməti aşağı düşdükdə (endirim tətbiq olunduqda). */
const notifyFavoriteUsersPriceDrop = (productId, { price, previousPrice }) =>
  notifyFavoriteUsers(productId, 'price_drop', { price, previousPrice });

module.exports = {
  notifyFavoriteUsersInStock,
  notifyFavoriteUsersPriceDrop,
};
