const express = require("express");
const sendEmail = require("../utils/emailSender");
const router = express.Router();

// POST: Create and send a notification
router.post("/send", async (req, res) => {
  /*#swagger.tags = ['Notifications']
    #swagger.description = 'Create and send a notification' 
    #swagger.summary = 'Create and send a notification' 
    #swagger.parameters['userEmail'] = {
            in: 'body',
            description: 'User email',
            required: true,
            type: 'string',
            schema: "user.email@email.com",
    } 
    #swagger.parameters['content'] = {
            in: 'body',
            description: 'Notification content',
            required: true,
            type: 'string',
            schema: "Notification email content, lorem ipsum etc...",
    } 
    #swagger.responses[200] = {
            description: 'Notification sent successfully',
    }
      #swagger.responses[400] = {
            description: 'Required: content, userEmail'
    } 
    #swagger.responses[500] = {
            description: 'Server error'
    } */
  try {
    const { content, userEmail } = req.body;

    if (!userEmail || !content ) {
      return res
        .status(400)
        .json({ message: "Required: content, userEmail" });
    }

    // send
    await sendEmail(userEmail, "New Notification", content);
    console.log(`Email notification sent to ${userEmail}`);

    res
      .status(200)
      .json({ status: "sent", message: "Notification sent successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
