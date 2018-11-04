const Team = require('../team/team.model');

function handlePassportLogin(req, res) {
  if (process.env.ADMINS.split(',').indexOf(req.user.username) !== -1) {
    /* eslint-disable no-param-reassign */
    req.session.admin = true;
  }
  return Team.findOne({ collaborators: req.user.username })
  .then((team) => {
    if (!team) req.session.canVote = false;
    else req.session.canVote = true;
    req.session.userId = req.user._id;
    /* eslint-enable no-param-reassign */
    return res.redirect('/');
  });
}

function handleSignout(req, res) {
  if (req.session) {
    req.session.destroy();
  }
  req.logout();
  return res.redirect('/');
}
/**
 * This is a protected route. Will return random number only if jwt token is provided in header.
 * @param req
 * @param res
 * @returns {*}
 */
function getRandomNumber(req, res) {
  // req.user is assigned by jwt middleware if valid token is provided
  return res.json({
    user: req.user,
    num: Math.random() * 100
  });
}

module.exports = { handlePassportLogin, handleSignout, getRandomNumber };
