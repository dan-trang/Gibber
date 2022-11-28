let waitRoom = [
    { UID:223434356, name: 'Daniel', state: 'Waiting', joined:1222, lastUID: 2123123213 },
    { UID:233434359, name: 'David', state: 'Waiting', joined:2322, lastUID: 4323553235 },
    { UID:743434359, name: 'Travis', state: 'Searching', joined: 344, lastUID: 0 },
    { UID:743434359, name: 'Travis', state: 'Waiting', joined: 1121, lastUID: 2342342344 },
    { UID:743434359, name: 'Travis', state: 'Waiting', joined: 1454, lastUID: 55604483 },
    { UID:743434359, name: 'Travis', state: 'Waiting', joined: 2211, lastUID: 98053858 },
    { UID:743434359, name: 'Travis', state: 'Waiting', joined: 967 , lastUID: 0}
];

/*
    First version will have necessary fields, but will just pair longest waiting person with rando
    
    Sort database by time, then pair the longest waiting user with the next longest waiting user
    that the longest waiting person did not talk to last conversation
*/

module.exports = waitRoom;