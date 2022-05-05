const { getAllLaunches, addNewLaunch, existLaunchWithId, abortLaunchById } = require('../../models/launches.model');

function httpGetAllLaunches(req, res) {
    return res.status(200).json(Array.from(getAllLaunches()));
}

function httpAddNewLaunch(req, res) {
    const launch = req.body;

    if(!launch.mission || !launch.rocket || !launch.launchDate || !launch.target) {
        return res.status(400).json({error: 'Missing required launch property'}); //Bad Request
    }

    launch.launchDate = new Date(launch.launchDate);
    //if (launch.launchDate.toString() === 'Invalid Date') {
    if (isNaN(launch.launchDate)) {
        return res.status(400).json({error: 'Invalid launch date'}); //Bad Request
    }

    addNewLaunch(launch);
    
    return res.status(201).json(launch);
}

function httpAbortLaunch(req, res) {
    //const launchId = +req.params.id; //same as bellow.
    const launchId = Number(req.params.id);

    if (!existLaunchWithId(launchId)) {
        return res.status(404).json({error: 'Launch not found'}); //Bad Request
    }

    const aborted = abortLaunchById(launchId);
    return res.status(201).json(aborted);
}

module.exports = {
    httpGetAllLaunches,
    httpAddNewLaunch,
    httpAbortLaunch,
};