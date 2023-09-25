module.exports = getDate();

//A function which displays the current day, month and date in the desired format.

function getDate() {
    const today = new Date();
    const options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    }

    const day = today.toLocaleDateString("en-US", options);
    return day;
}