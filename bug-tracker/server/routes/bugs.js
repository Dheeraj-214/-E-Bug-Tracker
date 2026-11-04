const router = require('express').Router();
const Bug = require('../models/Bug');
const auth = require('../middleware/auth');

router.use(auth); // every route below needs login

router.get('/', async (req, res) => {
  const { status, severity, search } = req.query;
  const q = {};
  if (status) q.status = status;
  if (severity) q.severity = severity;
  if (search) q.title = { $regex: search, $options: 'i' };
  const bugs = await Bug.find(q)
    .populate('reportedBy', 'name')
    .populate('assignedTo', 'name')
    .sort({ createdAt: -1 });
  res.json(bugs);
});

router.post('/', async (req, res) => {
  const { title, description, severity } = req.body;
  const bug = await Bug.create({ title, description, severity, reportedBy: req.user.id });
  res.json(bug);
});

router.put('/:id', async (req, res) => {
  const { status, assignedTo, solution, severity } = req.body;
  const patch = {};
  if (status !== undefined) patch.status = status;
  if (assignedTo !== undefined) patch.assignedTo = assignedTo || null;
  if (solution !== undefined) patch.solution = solution;
  if (severity !== undefined) patch.severity = severity;
  const bug = await Bug.findByIdAndUpdate(req.params.id, patch, { new: true });
  res.json(bug);
});

router.delete('/:id', async (req, res) => {
  const bug = await Bug.findById(req.params.id);
  if (!bug) return res.status(404).json({ message: 'Not found' });
  if (bug.reportedBy.toString() !== req.user.id)
    return res.status(403).json({ message: 'Only the reporter can delete' });
  await bug.deleteOne();
  res.json({ message: 'Deleted' });
});

module.exports = router;
