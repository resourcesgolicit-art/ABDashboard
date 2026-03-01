const sendEmail = require('../utils/sendEmail');

exports.registerUser = async (req, res) => {
  const { email } = req.body;

  await sendEmail(
    email,
    'Welcome to ABInstitute',
    '<h1>Welcome 🎉</h1><p>Your account is created.</p>',
  );

  res.json({ message: 'User registered and email sent' });
};
