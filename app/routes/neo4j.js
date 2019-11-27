const express = require('express');
const neo4j = require('neo4j-driver').v1;
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const dotenv = require('dotenv');


const withAuth = require('../helpers/withAuth');
require('../models/FriendRequestNotification');

dotenv.config();

const FriendRequestNotification = mongoose.model('friendRequestNotifications');
const router = express.Router();
const driver = neo4j.driver(process.env.NEO4J_URL, neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD));
const session = driver.session();

router.put('/friendRequest', (req, res) => {
  if (req.body.status === "accepted") {
    session.run('MATCH (a:Person{id: $sender})-[r:FriendRequest]-(b:Person{id: $receiver}) DELETE r CREATE (a)-[:Friends]->(b)',
      { sender: req.body.sender._id, receiver: req.body.receiver._id }
    )
      .then(_ => {
        session.close();
      })
      .catch(err => {
        console.error(err);
        session.close();
        res.status(500).send();
      });
  } else {
    session.run('MATCH (a:Person{id: $sender})-[r:FriendRequest]-(b:Person{id: $receiver}) SET r.declined=TRUE',
      { sender: req.body.sender._id, receiver: req.body.receiver._id }
    )
      .then(_ => {
        session.close();
      })
      .catch(err => {
        console.error(err);
        session.close();
        res.status(500).send();
      });
  }
});


router.post('/friendRequest', (req, res) => {
  const personId = req.body.personId;
  let sessionId = "";

  const token = req.body.token || req.query.token || req.headers['x-access-token'] || req.cookies.token;

  jwt.verify(token, process.env.SECRET, function (err, decoded) {
    if (err) {
      res.status(401).send('Unauthorized: Invalid token');
    } else {
      sessionId = decoded.id;
    }
  });

  session.run('MERGE (a:Person{id: $sessionId}) MERGE (b:Person{id: $personId}) MERGE (a)-[:FriendRequest]->(b)',
    { personId: personId, sessionId: sessionId }
  )
    .then(_ => {
      session.close();

      let friendRequestNotificationData = {};
      friendRequestNotificationData.sender = sessionId;
      friendRequestNotificationData.receiver = personId;

      new FriendRequestNotification(friendRequestNotificationData)
        .save()
        .then(_ => {
          res.status(200).send();
        })
        .catch(err => {
          console.error(err);
          res.status(500).send();
        })
    })
    .catch(err => {
      console.error(err);
      session.close();
      res.status(500).send();
    });
});

router.get('/relationToPerson', withAuth, (req, res) => {

  const personId = req.query.personId;
  let sessionId = "";

  const token = req.body.token || req.query.token || req.headers['x-access-token'] || req.cookies.token;

  jwt.verify(token, process.env.SECRET, function (err, decoded) {
    if (err) {
      res.status(401).send('Unauthorized: Invalid token');
    } else {
      sessionId = decoded.id;
    }
  });

  session.run('MATCH (a:Person {id: $personId})-[r]-(b:Person {id: $sessionId}) RETURN type(r)',
    { personId: personId, sessionId: sessionId }
  )
    .then(result => {
      session.close();
      const singleRecord = result.records[0];
      const relationship = singleRecord ? singleRecord.get(0) : "None";
      res.status(200).send(relationship);
    })
    .catch(err => {
      console.error(err);
      session.close();
      res.status(404).send();
    });
});


process.on('exit', () => { driver.close() });
//catches ctrl+c event
process.on('SIGINT', () => { driver.close() });
// catches "kill pid" (for example: nodemon restart)
// process.on('SIGUSR1', () => { driver.close() });
// process.on('SIGUSR2', () => { driver.close() });
//catches uncaught exceptions
process.on('uncaughtException', () => { driver.close() });


module.exports = router;
