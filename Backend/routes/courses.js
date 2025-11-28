const express = require('express');
const Course = require('../Model/course');
const Users = require('../Model/user');
const { authenticateToken } = require('../middleware/auth');
const mongoose = require('mongoose');

const router = express.Router();

// GET course and whether user has access (enrollment check)
router.get('/:courseId', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId).lean();
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: 'Course not found' });

    const user = await Users.findById(req.user.id).lean();
    // simple access check: user.orders array contains courseId (update per your orders schema)
    const userHasAccess =
      Array.isArray(user.orders) &&
      user.orders.some((o) => String(o) === String(courseId));
    return res.json({
      success: true,
      data: { course: { ...course, userHasAccess } },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET progress map for course for this user
router.get('/:courseId/progress', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const user = await Users.findById(req.user.id).lean();
    const cp = (user.coursesProgress || []).find(
      (c) => String(c.courseId) === String(courseId)
    );
    const progressMap = {};
    if (cp) {
      cp.topics.forEach((t) => {
        progressMap[String(t.topicId)] = t.percent || 0;
      });
    }
    res.json({ success: true, data: { progress: progressMap } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// mark topic complete
router.post(
  '/:courseId/topics/:topicId/complete',
  authenticateToken,
  async (req, res) => {
    try {
      const { courseId, topicId } = req.params;
      const user = await Users.findById(req.user.id);
      if (!user)
        return res
          .status(404)
          .json({ success: false, message: 'User not found' });

      // find or create course progress entry
      let cp = user.coursesProgress.find(
        (c) => String(c.courseId) === String(courseId)
      );
      if (!cp) {
        cp = { courseId: mongoose.Types.ObjectId(courseId), topics: [] };
        user.coursesProgress.push(cp);
      }
      let t = cp.topics.find((x) => String(x.topicId) === String(topicId));
      if (!t) {
        t = {
          topicId: mongoose.Types.ObjectId(topicId),
          percent: 100,
          lastSeenAt: new Date(),
          lastImageIndex: 0,
        };
        cp.topics.push(t);
      } else {
        t.percent = 100;
        t.lastSeenAt = new Date();
      }
      await user.save();
      res.json({ success: true, message: 'Topic marked complete' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// save bookmark (topic page)
router.post('/:courseId/bookmark', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { topicId, imageIndex } = req.body;
    const user = await Users.findById(req.user.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });

    // update lastImageIndex for the topic in coursesProgress
    let cp = user.coursesProgress.find(
      (c) => String(c.courseId) === String(courseId)
    );
    if (!cp) {
      cp = { courseId: mongoose.Types.ObjectId(courseId), topics: [] };
      user.coursesProgress.push(cp);
    }
    let t = cp.topics.find((x) => String(x.topicId) === String(topicId));
    if (!t) {
      t = {
        topicId: mongoose.Types.ObjectId(topicId),
        percent: 0,
        lastSeenAt: new Date(),
        lastImageIndex: imageIndex || 0,
      };
      cp.topics.push(t);
    } else {
      t.lastImageIndex = imageIndex || 0;
      t.lastSeenAt = new Date();
    }
    await user.save();
    res.json({ success: true, message: 'Bookmark saved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// get bookmark
router.get('/:courseId/bookmark', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const user = await Users.findById(req.user.id).lean();
    const cp = (user.coursesProgress || []).find(
      (c) => String(c.courseId) === String(courseId)
    );
    let result = null;
    if (cp) {
      // pick the most recent topic that has lastImageIndex (or first)
      const t = cp.topics.find((x) => x.lastImageIndex !== undefined);
      if (t) result = { topicId: t.topicId, imageIndex: t.lastImageIndex || 0 };
    }
    res.json({ success: true, data: { bookmark: result } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// notes: post note for a specific image
router.post(
  '/:courseId/topics/:topicId/images/:imageIndex/note',
  authenticateToken,
  async (req, res) => {
    try {
      const { courseId, topicId, imageIndex } = req.params;
      const { note } = req.body;
      const user = await Users.findById(req.user.id);
      if (!user)
        return res
          .status(404)
          .json({ success: false, message: 'User not found' });

      // Remove existing note for same (course,topic,imageIndex)
      user.notes = (user.notes || []).filter(
        (n) =>
          !(
            String(n.courseId) === String(courseId) &&
            String(n.topicId) === String(topicId) &&
            Number(n.imageIndex) === Number(imageIndex)
          )
      );

      user.notes.push({
        courseId: mongoose.Types.ObjectId(courseId),
        topicId: mongoose.Types.ObjectId(topicId),
        imageIndex: Number(imageIndex),
        note: note || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await user.save();
      res.json({ success: true, message: 'Note saved' });
    } catch (err) {
      console.error('Save note error', err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// get all notes for a course for current user
router.get('/:courseId/notes', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const user = await Users.findById(req.user.id).lean();
    const notes = (user.notes || []).filter(
      (n) => String(n.courseId) === String(courseId)
    );
    // convert to { topicId: { imageIndex: note } }
    const out = {};
    notes.forEach((n) => {
      const t = String(n.topicId);
      out[t] = out[t] || {};
      out[t][Number(n.imageIndex)] = n.note;
    });
    res.json({ success: true, data: { notes: out } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
