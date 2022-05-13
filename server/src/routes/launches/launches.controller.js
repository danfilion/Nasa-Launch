const { getAllLaunches, scheduleNewLaunch, existLaunchWithId, abortLaunchById } = require('../../models/launches.model');

async function httpGetAllLaunches(req, res) {
    return res.status(200).json(await getAllLaunches());
}

async function httpAddNewLaunch(req, res) {
    const launch = req.body;

    if(!launch.mission || !launch.rocket || !launch.launchDate || !launch.target) {
        return res.status(400).json({error: 'Missing required launch property'}); //Bad Request
    }

    launch.launchDate = new Date(launch.launchDate);
    //if (launch.launchDate.toString() === 'Invalid Date') {
    if (isNaN(launch.launchDate)) {
        return res.status(400).json({error: 'Invalid launch date'}); //Bad Request
    }

    await scheduleNewLaunch(launch);
    
    return res.status(201).json(launch);
}

async function httpAbortLaunch(req, res) {
    //const launchId = +req.params.id; //same as bellow.
    const launchId = Number(req.params.id);

    const existsLaunch = await existLaunchWithId(launchId);
    if (!existsLaunch) {
        return res.status(404).json({error: 'Launch not found'}); //Bad Request
    }

    const aborted = await abortLaunchById(launchId);
    if (!aborted) {
        return res.status(400).json({
            error: 'Launch not aborted.',
        });
    }
    return res.status(200).json({
        ok: true,
    });
}

module.exports = {
    httpGetAllLaunches,
    httpAddNewLaunch,
    httpAbortLaunch,
};