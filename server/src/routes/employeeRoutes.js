const express = require('express');
const controller = require('../controllers/employeeController');

const router = express.Router();

router.route('/').get(controller.list).post(controller.create);
router.get('/lookup', controller.lookup);
router.route('/:id').get(controller.getOne).put(controller.update).delete(controller.remove);

module.exports = router;
