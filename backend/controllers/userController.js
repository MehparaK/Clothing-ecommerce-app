const User = require('../models/userModel');

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'İstifadəçilər yüklənərkən xəta baş verdi.' });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: 'Öz hesabınızı silə bilməzsiniz.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'İstifadəçi tapılmadı.' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'İstifadəçi silindi.' });
  } catch (error) {
    res.status(500).json({ message: 'İstifadəçi silinərkən xəta baş verdi.' });
  }
};

module.exports = { getUsers, deleteUser };
