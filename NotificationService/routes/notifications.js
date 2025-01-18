const express = require("express");
const sendEmail = require("../utils/emailSender");
const Notification = require("../models/Notification");
const router = express.Router();

// GET: all notifications of a user
router.get("/user/:userId", async (req, res) => {
  /*#swagger.tags = ['Notifications']
    #swagger.description = 'Get all notifications for a user' 
    #swagger.summary = 'Get all notifications for a user' 
	  #swagger.parameters['userId'] = {
           in: 'path',
           description: 'User ID',
           required: true,
           type: 'string'
    } 
	  #swagger.parameters['status'] = {
            in: 'query',
            description: 'Filter by status',
            required: false,
            type: 'string'
    } 
	  #swagger.responses[200] = {
            description: 'Notifications found',
            schema: [
                {
                  "_id": "67844df7abdcdbf9d5c80487",
                  "userId": "15125645645645",
                  "userEmail": "user.email@email.com",
                  "content": "Example notification content, lorem ipsum 3 etc...",
                  "status": "unread",
                  "timestamp": "2025-01-02T21:15:03.839Z"
                },
              ]
            
    }
      #swagger.responses[404] = {
            description: 'No notifications found for user or user does not exist'
    } 
	  #swagger.responses[500] = {
            description: 'Server error'
    } */

  try {
    const { userId } = req.params;
    const { status } = req.query; // Filter by status
    const query = { userId };
    if (status) query.status = status;

    const notifications = await Notification.find(query);
    if (!notifications.length)
      return res.status(404).json({
        message: "No notifications found for user, or user does not exist",
      });
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: get a specific notification
router.get("/:notificationId", async (req, res) => {
  /*#swagger.tags = ['Notifications']
    #swagger.description = 'Get a specific notification' 
    #swagger.summary = 'Get a specific notification' 
    #swagger.parameters['notificationId'] = {
           in: 'path',
           description: 'Notification ID',
           required: true,
           type: 'string'
    } 
    #swagger.responses[200] = {
            description: 'Notification found',
            schema: { 
                "_id": "67844c7e422a93f61e1f0dcb",
                "userId": "15125645645645",
                "userEmail": "user.email@email.com",
                "content": "Example notification content, lorem ipsum etc...",
                "status": "unread",
                "timestamp": "2024-12-29T21:13:02.839Z"
            }
    }
      #swagger.responses[404] = {
            description: 'Notification not found'
    } 
    #swagger.responses[500] = {
            description: 'Server error'
    } */
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findById(notificationId);
    if (!notification)
      return res.status(404).json({ message: "Notification not found" });
    res.status(200).json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Create a new notification
router.post("/", async (req, res) => {
  /*#swagger.tags = ['Notifications']
    #swagger.description = 'Create a new notification' 
    #swagger.summary = 'Create a new notification' 
    #swagger.parameters['userId'] = {
          in: 'body',
          description: 'User ID',
          required: true,
          type: 'string',
          schema: "5f9f1b3b3b6f6b0017f3b3b6",
    } 
    #swagger.parameters['userEmail'] = {
          in: 'body',
          description: 'User email',
          required: true,
          type: 'string',
          schema: "user.email@email.com",
    } 
    #swagger.parameters['content'] = {
          in: 'body',
          description: 'Notification content, lorem ipsum etc...',
          required: true,
          type: 'string',
          schema: "Notification email content",
    } 
    #swagger.responses[201] = {
          description: 'Notification created successfully',
    }
    #swagger.responses[500] = {
          description: 'Server error'
    } */
  try {
    const { userId, userEmail, content } = req.body;
    console.log("Creating notification:", req.body);

    const notification = new Notification({ userId, userEmail, content });
    await notification.save();
    res.status(201).json({
      id: notification._id,
      message: "Notification created successfully",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Create and send a notification
router.post("/send", async (req, res) => {
  /*#swagger.tags = ['Notifications']
    #swagger.description = 'Create and send a notification' 
    #swagger.summary = 'Create and send a notification' 
    #swagger.parameters['userId'] = {
            in: 'body',
            description: 'User ID',
            required: true,
            type: 'string',
            schema: "5f9f1b3b3b6f6b0017f3b3b6",
    } 
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
            description: 'Required: userId, content, userEmail'
    } 
    #swagger.responses[500] = {
            description: 'Server error'
    } */
  try {
    const { userId, content, userEmail } = req.body;

    if (!userEmail || !content || !userId) {
      return res
        .status(400)
        .json({ message: "Required: userId, content, userEmail" });
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

// POST: send an existing notification
router.post("/send/:notificationId", async (req, res) => {
  /*#swagger.tags = ['Notifications']
    #swagger.description = 'Send an existing notification' 
    #swagger.summary = 'Send an existing notification' 
    #swagger.parameters['notificationId'] = {
           in: 'path',
           description: 'Notification ID',
           required: true,
           type: 'string'
    } 
    #swagger.responses[200] = {
            description: 'Notification sent successfully',
    }
      #swagger.responses[404] = {
            description: 'Notification not found'
    } 
    #swagger.responses[500] = {
            description: 'Server error'
    } */
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findById(notificationId);
    if (!notification)
      return res.status(404).json({ message: "Notification not found" });

    // send
    await sendEmail(
      notification.userEmail,
      "Notification",
      notification.content
    );
    console.log(`Email notification sent to ${notification.userEmail}`);
    res
      .status(200)
      .json({ status: "sent", message: "Notification sent successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// PUT: update notification to read
router.put("/read/:notificationId", async (req, res) => {
  /*#swagger.tags = ['Notifications']
    #swagger.description = 'Update notification to read' 
    #swagger.summary = 'Update notification to read' 
    #swagger.parameters['notificationId'] = {
           in: 'path',
           description: 'Notification ID',
           required: true,
           type: 'string'
    } 
    #swagger.responses[200] = {
            description: 'Notification status updated to read',
    }
      #swagger.responses[404] = {
            description: 'Notification not found'
    } 
    #swagger.responses[500] = {
            description: 'Server error'
    } */
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { status: "read" },
      { new: true }
    );

    if (!notification)
      return res.status(404).json({ message: "Notification not found" });
    res
      .status(200)
      .json({ message: "Notification status updated to read", notification });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// PUT: update notification to unread
router.put("/unread/:notificationId", async (req, res) => {
  /*#swagger.tags = ['Notifications']
    #swagger.description = 'Update notification to unread' 
    #swagger.summary = 'Update notification to unread' 
    #swagger.parameters['notificationId'] = {
           in: 'path',
           description: 'Notification ID',
           required: true,
           type: 'string'
    } 
    #swagger.responses[200] = {
            description: 'Notification status updated to unread',
    }
      #swagger.responses[404] = {
            description: 'Notification not found'
    } 
    #swagger.responses[500] = {
            description: 'Server error'
    } */
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { status: "unread" },
      { new: true }
    );

    if (!notification)
      return res.status(404).json({ message: "Notification not found" });
    res
      .status(200)
      .json({ message: "Notification status updated to unread", notification });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT: Update a specific notification
router.put("/:notificationId", async (req, res) => {
  /*#swagger.tags = ['Notifications']
    #swagger.description = 'Update a specific notification' 
    #swagger.summary = 'Update a specific notification' 
    #swagger.parameters['notificationId'] = {
            in: 'path',
            description: 'Notification ID',
            required: true,
            type: 'string',
            schema: "5f9f1b3b3b6f6b0017f3b3b6",
    } 
    #swagger.parameters['userId'] = {
          in: 'body',
          description: 'User ID',
          required: false,
          type: 'string',
          schema: "5a7f1b3b3b6f6b0017a53r22",
    } 
    #swagger.parameters['userEmail'] = {
          in: 'body',
          description: 'User email',
          required: false,
          type: 'string',
          schema: "user.email@email.com",
    } 
    #swagger.parameters['content'] = {
          in: 'body',
          description: 'Notification content',
          required: false,
          type: 'string',
          schema: "Notification email content, lorem ipsum etc...",
    } 
    #swagger.responses[200] = {
          description: 'Notification updated successfully',
    }
      #swagger.responses[404] = {
          description: 'Notification not found'
    } 
    #swagger.responses[500] = {
          description: 'Server error'
    } */
  try {
    const { notificationId } = req.params;
    const updates = req.body;
    updates.timestamp = Date.now();

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      updates,
      { new: true }
    );
    if (!notification)
      return res.status(404).json({ message: "Notification not found" });

    res
      .status(200)
      .json({ message: "Notification updated successfully", notification });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE: Delete a specific notification
router.delete("/:notificationId", async (req, res) => {
  /*#swagger.tags = ['Notifications']
    #swagger.description = 'Delete a specific notification' 
    #swagger.summary = 'Delete a specific notification' 
    #swagger.parameters['notificationId'] = {
           in: 'path',
           description: 'Notification ID',
           required: true,
           type: 'string'
    } 
    #swagger.responses[200] = {
            description: 'Notification deleted successfully',
    }
    #swagger.responses[500] = {
            description: 'Server error'
    } */
  try {
    const { notificationId } = req.params;
    await Notification.findByIdAndDelete(notificationId);
    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE: Delete all notifications for a user
router.delete("/user/:userId", async (req, res) => {
  /*#swagger.tags = ['Notifications']
    #swagger.description = 'Delete all notifications for a user' 
    #swagger.summary = 'Delete all notifications for a user' 
    #swagger.parameters['userId'] = {
           in: 'path',
           description: 'User ID',
           required: true,
           type: 'string'
    } 
    #swagger.responses[200] = {
            description: 'All notifications for user deleted',
    }
    #swagger.responses[500] = {
            description: 'Server error'
    } */
  try {
    const { userId } = req.params;
    await Notification.deleteMany({ userId });
    res.status(200).json({
      message: `All notifications for user ${userId} have been deleted`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
