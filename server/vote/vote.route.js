const express = require('express');
const voteCtrl = require('./vote.controller');
const { ifNoUserRedirect } = require('../middlewares/user');

const router = express.Router(); // eslint-disable-line new-cap

router
  .route('/')
  .get(ifNoUserRedirect, voteCtrl.view);

module.exports = router;
