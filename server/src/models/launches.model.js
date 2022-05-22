const axios = require('axios');

const launchesDatabase = require('./launches.mongo');
const planets = require('./planets.mongo');

const DEFAULT_FLIGHT_NUMBER = 100;

const launches = new Map();



const launch = {
    flightNumber: 100, // flight_number in sx api
    mission: 'Kepler Exploration x', // name in sx api
    rocket: 'Explorer IS1', // rocket.name in sx api
    launchDate: new Date('December 27, 2030'), // date_local
    target: 'Kepler-442 b', //na
    customers: ['ZTM', 'NASA'], // from sx api -> payload.customers for each payload.
    upcoming: true, // upcoming in sx api
    success: true, // success in sx api
}

saveLaunch(launch);

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

async function populateLaunches() {
    console.log('Downloading launch data...');
    const response = await axios.post(SPACEX_API_URL, {
        query : {},
        options: {
            pagination: false,
            populate: [
                {
                    path: 'rocket', 
                    select: {
                        name: 1
                    }
                },
                {
                    path: 'payloads',
                    select: {
                        'customers': 1
                    }
                }
            ]
        }
    });

    if (response.status !== 200) {
        console.log('Problem downloading lauch data');
        throw new Error('Lauch dta download failed.');
    }

    const launchDocs = response.data.docs;
    for (const launchDoc of launchDocs) {
        const payloads = launchDoc['payloads'];
        const customers = payloads.flatMap((payload) => {
            return payload['customers'];
        });

        const launch = {
            flightNumber: launchDoc['flight_number'],
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: launchDoc['date_local'],
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'],
            customers, //shorhand for customers: customers,
        };

        console.log(`${launch.flightNumber} ${launch.mission}`);

        //TODO: Populate launches collection...
        await saveLaunch(launch);
    }
}

async function loadLaunchData() {
    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat',
    });
    if (firstLaunch) {
        console.log('Launch data already loaded !');
    } else {
        await populateLaunches();
    }
}

async function findLaunch(filter) {
    return await launchesDatabase.findOne(filter);
}

async function existLaunchWithId(launchId) {
    return await findLaunch({
        flightNumber: launchId,
    });
}

async function getLatestFlightNumber() {
    // the - minus in front of the field name specify a sort descending.
    const latestLaunch = await launchesDatabase.findOne().sort('-flightNumber');

    if (!latestLaunch) {
        return DEFAULT_FLIGHT_NUMBER;
    }

    return latestLaunch.flightNumber;    
}

async function getAllLaunches(skip, limit) {
    //.sort with 1 or -1 for decending or ascending
    return await launchesDatabase.find({}, { '_id': 0, '__v': 0 })
                                .sort({ flightNumber: 1 })
                                .skip(skip)
                                .limit(limit);
}

async function saveLaunch(launch) {
    //await launchesDatabase.updateOne({
    //findOneAndUpdate will not include $setOnInsert in the response.
    await launchesDatabase.findOneAndUpdate({
        flightNumber: launch.flightNumber,
    }, launch, {
        upsert: true,
    })
}

async function scheduleNewLaunch(launch) {
    const planet = await planets.findOne({
        keplerName: launch.target,
    });

    if (!planet) {
        throw new Error('No matching planets found.');
    }

    const newFlightNumber = await getLatestFlightNumber() + 1;

    const newLaunch = Object.assign(launch, {
        success: true,
        upcoming: true,
        customers: ['Winvasion', 'Nasa'],
        flightNumber: newFlightNumber,
    })

    await saveLaunch(newLaunch);
}

async function abortLaunchById(launchId) {
    const aborted = await launchesDatabase.updateOne({
        flightNumber: launchId,
    }, {
        upcoming: false,
        success: false,
    });

    // Find out about these value by analysing the return from updateOne.
    //return aborted.ok === 1 && aborted.nModified === 1;
    //Return for Mongoose version 6+
    return aborted.modifiedCount === 1;
}

module.exports = {
    loadLaunchData,
    getAllLaunches,
    scheduleNewLaunch,
    existLaunchWithId,
    abortLaunchById,
};