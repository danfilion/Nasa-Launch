const express = require('express');

//const planetsController = require('./planets.controller');
const { httpGetAllPlanets } = require('./planets.controller');

const planetsRouter = express.Router();

planetsRouter.get('/', httpGetAllPlanets);

module.exports = planetsRouter;