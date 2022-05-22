const DEFAULT_PAGE_NUMBER = 1;
const DEFAULT_PAGE_LIMIT = 0; //MONGO will set the result to infinite when 0

function getPagination(query) {
    const page = Math.abs(query.page) || DEFAULT_PAGE_NUMBER;
    const limit = Math.abs(query.limit) || DEFAULT_PAGE_LIMIT;  //Math.abs always return the number as positive number.
    const skip = (page -1) * limit;

    return {
        skip,
        limit,
    };
}

module.exports = {
    getPagination,
}