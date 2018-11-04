const { isEmpty } = require('lodash');
const Team = require('../team/team.model');

exports.ifNoBody400 = function ifNoBody400(req, res, next) {
  const { body } = req;
  if (!body || isEmpty(body)) {
    return res.sendStatus(400);
  }
  return next();
};

exports.ifNotOwnTeam400 = function ifNotOwnTeam400(req, res, next) {
  if (req.user.teamId !== req.params.teamId) {
    return res.sendStatus(400);
  }
  return next();
};


exports.ifDuplicate400 = async function ifDuplicate400(req, res, next) {
  const { body } = req;
  const collaborators = Array.isArray(body.collaborators)
    ? body.collaborators
    : body.collaborators
        .split(',')
        .map(str => str.trim().replace(/@/g, ''))
        .filter(Boolean);
  const filtered = (await Promise.all(collaborators.map(member =>
        Team.find({ collaborators: member })
        .then((dup) => {
          if (dup.length > 0) { return false; }
          return member;
        }))
    )).filter(Boolean);

  if (filtered.length !== collaborators.length) {
    return res.sendStatus(400);
  }
  return next();
};
