const Team = require('../team/team.model');

function view(req, res) {
  if (!req.user) {
    /* eslint-disable no-param-reassign */
    req.session.admin = false;
    req.session.userId = false;
    return res.redirect('/');
  }
  if (process.env.ADMINS.split(',').indexOf(req.user.username) !== -1) {
    req.session.admin = true;
    return Team.find({})
    .then(teams => res.render('votes', { teams }));
  }
  req.session.admin = false;
  /* eslint-enable no-param-reassign */
  return res.redirect('/');
}

module.exports = { view };
