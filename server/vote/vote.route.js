const express = require('express');
const voteCtrl = require('./vote.controller');
const { ifNoUserRedirect } = require('../middlewares/user');

const router = express.Router(); // eslint-disable-line new-cap

/** GET /api/auth/random-number - Protected route,
 * needs token returned by the above as header. Authorization: Bearer {token} */
router
  .route('/')
  .get(ifNoUserRedirect, voteCtrl.view);

module.exports = router;
