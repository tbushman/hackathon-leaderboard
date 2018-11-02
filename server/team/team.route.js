const express = require('express');
const validate = require('express-validation');

const { ifNoUserRedirect } = require('../middlewares/user');
const { ifNoBody400 } = require('../middlewares/util');
const teamCtrl = require('./team.contoller');
const validators = require('./team.validation');

const router = express.Router(); // eslint-disable-line new-cap

// const multer = require('multer');

// const upload = multer();

router
  .route('/')
  /** GET /api/teams - Get list of users */
  .get(teamCtrl.list)
  /** POST /api/teams - Create new team */
  .post(ifNoUserRedirect(), ifNoBody400, validate(validators.createTeam), teamCtrl.create);

router
  .route('/:teamId')
  .get(teamCtrl.single)
  .post(teamCtrl.update);

router
  .route('/analyze/:teamId')
  .post(ifNoUserRedirect()/* , upload.array()*/, teamCtrl.analyze);

router
  .route('/delete/:teamId')
  .delete(teamCtrl.deleteTeam);

module.exports = router;