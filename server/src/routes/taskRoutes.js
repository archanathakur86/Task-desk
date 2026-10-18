const express = require('express');
const controller = require('../controllers/taskController');

const router = express.Router();

router.route('/').get(controller.list).post(controller.create);
router.get('/export.csv', controller.exportCsv);
router.put('/:id/status', controller.changeStatus);
router.route('/:id').get(controller.getOne).put(controller.update).delete(controller.remove);

module.exports = router;
