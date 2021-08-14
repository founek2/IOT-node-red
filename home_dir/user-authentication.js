require('dotenv').config();

const fetch = require('node-fetch');

const URL = process.env.PLATFORM_URL;
const AUTH_TYPE_PATH = '/api/user/martas?attribute=authType';
const LOGIN_PATH = '/api/authorization';

if (!URL || URL === '') throw new Error('env PLATFORM_URL must be specified');

module.exports = {
    type: 'credentials',
    users: function (username) {
        return new Promise(async function (resolve) {
            // Do whatever work is needed to check username is a valid
            // user.
            const res = await fetch(URL + `/api/user/${username}?attribute=authType`);
            const body = await res.json();
            if (body.authTypes.some((type) => type === 'passwd')) {
                // Resolve with the user object. It must contain
                // properties 'username' and 'permissions'
                var user = { username: username, permissions: '*' };
                resolve(user);
            } else {
                // Resolve with null to indicate this user does not exist
                resolve(null);
            }
        });
    },
    authenticate: function (username, password) {
        return new Promise(async function (resolve) {
            // Do whatever work is needed to validate the username/password
            // combination.
            const res = await fetch(URL + LOGIN_PATH, {
                method: 'post',
                body: JSON.stringify({
                    formData: {
                        LOGIN: {
                            userName: username,
                            authType: 'passwd',
                            password: password,
                        },
                    },
                }),
                headers: { 'Content-Type': 'application/json' },
            });

            if (res.status !== 200) return resolve(null);

            const body = await res.json();
            if (body.user.groups.some((group) => group === 'admin' || group === 'root')) {
                // Resolve with the user object. Equivalent to having
                // called users(username);
                var user = { username: username, permissions: '*' };
                resolve(user);
            } else {
                // Resolve with null to indicate the username/password pair
                // were not valid.
                resolve(null);
            }
        });
    },
    default: function () {
        return new Promise(function (resolve) {
            // Resolve with the user object for the default user.
            // If no default user exists, resolve with null.
            resolve({ anonymous: true, permissions: 'read' });
        });
    },
};
