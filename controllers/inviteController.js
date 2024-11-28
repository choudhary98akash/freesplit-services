const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Invite = require('../models/Invite');
const Person = require('../models/Person');
const User = require('../models/User');
require('dotenv').config();

// Send Invitation Email
exports.sendInvite = async (req, res) => {
  const { senderId, receiverEmail } = req.body;

  try {
    // Generate a unique token
    const token = crypto.randomBytes(32).toString('hex');

    // Store the invite in the database
    await Invite.create({ senderId, receiverEmail, token });

    // Construct the invite link
    const inviteLink = `${process.env.HOST}/api/people/accept-invite/${token}`;

    // Send email using Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: 'freesplitcare@gmail.com',
      to: receiverEmail,
      subject: 'You’re Invited!',
      html: `Hello! You’ve been invited to join, please click the link below to accept:<br><br><br>${inviteLink}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Invitation sent successfully!' });
  } catch (error) {
    console.error('Error sending invitation:', error);
    res.status(500).json({ error: 'Failed to send invitation.' });
  }
};

// Accept Invite
exports.acceptInvite = async (req, res) => {
  const { token } = req.params;

  try {
    // Find the invite by token
    const invite = await Invite.findOne({ token });
    if (!invite) {
      return res.status(400).json({ error: 'Invalid or expired token.' });
    }

    // Extract senderId and receiverEmail from invite
    const { senderId, receiverEmail } = invite;

    // Check if the user exists in the system
    const existingUser = await User.findOne({ email: receiverEmail });

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found. Please register first.' });
    }

    // Check if the receiver is already added to the sender's list
    const alreadyAdded = await Person.findOne({
      email: receiverEmail,
      addedBy: senderId,
    });

    if (alreadyAdded) {
      return res.status(400).json({ error: 'User is already in your people list.' });
    }

    // Add the receiver to the sender's people list
    const person = await Person.create({
      name: existingUser.name, // Use existing user's name
      email: receiverEmail,
      addedBy: senderId,
    });

    // Remove the invite after it's used
    await Invite.deleteOne({ token });

    res.status(200).json({
      message: 'You’ve been added successfully!',
      person,
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    res.status(500).json({ error: 'Failed to process the invite.' });
  }
};

