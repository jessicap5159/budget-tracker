// variable to hold db connection
let db;
// establish connection to IndexedDB database called "budget" and set to version 1
const request = indexedDB.open('budget', 1);

// if database version changes
request.onupgradeneeded = function(event) {
    // save a reference to database
    const db = event.target.result;
    // create an object store (table), set to have autoincrementing primary key
    db.createObjectStore('new_data', { autoIncrement: true });
};

// upon successful 
request.onsuccess = function(event) {
    // when db is successfully created with its object store (from onupgradedneeded event above) 
    // or simply established a connection, save reference to db
    db = event.target.result;

    // check if app is online, if yes, 
    // run uploadNewData function to send all local db data to api
    if (navigator.onLine) {
        // uploadNewData();
    }
};

request.onerror = function(event) {
    // log error here
    console.log(event.target.errorCode);
}