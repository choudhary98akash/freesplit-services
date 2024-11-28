const express = require('express');
const router = express.Router();
const inviteController = require('../controllers/inviteController');
const {sendInvite, acceptInvite} = require('../controllers/inviteController')

// Route to send an invite
router.post('/invite',sendInvite);

// Route to accept an invite
router.get('/accept-invite/:token',acceptInvite);

module.exports = router;
