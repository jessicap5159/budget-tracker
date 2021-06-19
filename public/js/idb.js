// const { get } = require("mongoose");
// variable to hold db connection
const indexedDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;
let db;
// establish connection to IndexedDB database called "budget" and set to version 1
const request = indexedDB.open("budget", 1);

// if database version changes
request.onupgradeneeded = function (event) {
  // save a reference to database
  const db = event.target.result;
  // create an object store (table), set to have autoincrementing primary key
  db.createObjectStore("new_data", { autoIncrement: true });
};

// upon successful
request.onsuccess = function (event) {
  // when db is successfully created with its object store (from onupgradedneeded event above)
  // or simply established a connection, save reference to db
  db = event.target.result;

  // check if app is online, if yes,
  // run uploadNewData function to send all local db data to api
  if (navigator.onLine) {
    uploadNewData();
  }
};

request.onerror = function (event) {
  // log error here
  console.log(event.target.errorCode);
};

// This function will be executed if we attempt to submit new data
function saveRecord(record) {
  // open new transaction with database with read and write permissions
  const transaction = db.transaction(["new_data"], "readwrite");

  // access the object store for `new_data`
  const budgetObjectStore = transaction.objectStore("new_data");

  // add record to store with add method
  budgetObjectStore.add(record);
}

function uploadNewData() {
    // open a transaction on your db
    const transaction = db.transaction(['new_data'], 'readwrite');

    // access your object store
    const budgetObjectStore = transaction.objectStore('new_data');

    // get all record from store and set to a variable
    const getAll = budgetObjectStore.getAll();
    
    // upon successful .getAll() execution, run this function
    getAll.onsuccess = function() {
            // if there was data in indexedDb's store, let's send it to the api server
            if (getAll.result.length > 0) {
                fetch('/api/transaction', {
                    method: 'POST',
                    body: JSON.stringify(getAll.result),
                    headers: {
                        Accept: 'application/json, text/plain, */*',
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }
                    // open one more transaction
                    const transaction = db.transaction(['new_data'], 'readwrite');
                    // access the new_pizza object store
                    const budgetObjectStore = transaction.objectStore('new_data');
                    // clear all items in your store
                    budgetObjectStore.clear();

                    alert('All saved data has been submited!');
                })
                .catch(err => {
                    console.log(err);
                });
            }

    };

}

// listen for app coming back online
window.addEventListener('online', uploadNewData);
// this listens for the browser regaining internet connection using the online event. If the browser comes back online, we execute uploadPizza() 
// function automatically