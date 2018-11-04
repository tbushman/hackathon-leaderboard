const nanoId = require('nanoid');

const { host } = require('../../config/config');
const Team = require('./team.model');
const User = require('../user/user.model');
const Webhook = require('../webhooks/webhook.model');

function generateKeys() {
  return {
    id: nanoId(24),
    secret: nanoId(80)
  };
}

function generateWebhook(provider) {
  const { id, secret } = generateKeys();
  return { webhook: `${host}api/webhook/${provider}/${id}`, id, secret, name: provider };
}

function createWebhooks() {
  return {
    github: generateWebhook('github'),
    netlify: generateWebhook('netlify')
  };
}

function castMaybeStringToArray(maybeString) {
  return Array.isArray(maybeString) ? maybeString : maybeString.split(',');
}

function createRelationships(userId, teamId, webhooks) {
  const { netlify, github } = webhooks;
  netlify.belongsTo = teamId;
  github.belongsTo = teamId;
  return Promise.all([
    User.update({ _id: userId }, { teamId }),
    Webhook.create(netlify),
    Webhook.create(github)
  ]);
}

function create(req, res, next) {
  const { body: team } = req;
  const collaborators = castMaybeStringToArray(team.collaborators)
    .map(str => str.trim().replace(/@/g, ''))
    .filter(Boolean);

  return Team.create({ ...team, collaborators })
    .then((newTeam) => {
      if (!newTeam) {
        return res.status(500).json({ acknowledged: false });
      }
      const webhook = createWebhooks();
      return createRelationships(req.user._id, newTeam._id, webhook).then(() =>
        res.json({ acknowledged: true, teamId: newTeam._id, webhook })
      );
    })
    .catch(next);
}

function update(req, res) {
  const { body: team } = req;
  const collaborators = castMaybeStringToArray(team.collaborators)
    .map(str => str.trim().replace(/@/g, ''))
    .filter(Boolean);
  team.collaborators = collaborators;
  return Team.update({ _id: req.params.teamId }, team).then(() => res.json({ acknowledged: true }));
}

function list(req, res) {
  return Team.find({})
    .sort()
    .lean()
    .then((teams) => {
      if (teams.length === 0) {
        return res.status(200).json(['']);
      }
      return res.status(200).json(teams);
    });
}

function single(req, res) {
  return Team.findOne({ _id: req.params.teamId }).then((team) => {
    if (!team) {
      return res.status(200).json(['']);
    }
    return res.status(200).json(team);
  });
}

function deleteTeam(req, res) {
  return Team.remove({ _id: req.params.teamId }).then(() => {
    User.update({ teamId: req.params.teamId }, { $set: { teamId: null } }).then(() => {
      Webhook.remove({ belongsTo: req.params.teamId }).then(() => res.redirect('/'));
    });
  });
}
/*
vote: {
  canVote: Boolean,
  votesFor: [String],
  receivedVotes: [String]
}
*/

function vote(req, res) {
  const voteKey = (req.params.isAdd ? '$set' : '$pull');
  const voteObj = {};
  const decodedVoteId = castMaybeStringToArray(decodeURIComponent(req.params.voteForThisId));
  voteObj[voteKey] = { 'vote.votesFor': decodedVoteId };
  User.findOne({ _id: req.params.userId })
  .then((user) => {
    Team.findOneAndUpdate(
      {
        collaborators: user.username
      },
      voteObj,
      {
        new: true, safe: true, multi: false
      }
    )
    .then((team) => {
      const pushKey = (req.params.isAdd ? '$push' : '$pull');
      const pushObj = {};
      pushObj[pushKey] = { 'vote.receivedVotes': team._id };
      console.log('!!!!!!!!!!!!!!!!');
      console.log(req.params.voteForThisId);
      decodedVoteId.forEach((id) => {
        Team.findOne({ _id: id })
        .then((t) => {
          if (t.vote.receivedVotes.indexOf(team._id) !== -1) {
            return res.status(200).json({});
          }
          return Team.findOneAndUpdate(
            {
              _id: req.params.voteForThisId
            },
            pushObj,
            {
              new: true, safe: true, multi: false
            }
          )
          .then((newTeam) => {
            if (!newTeam) {
              return res.status(200).json({});
            }
            return res.status(200).json(newTeam);
          });
        });
      });
    });
  });
}
module.exports = { create, update, list, single, deleteTeam, vote };
