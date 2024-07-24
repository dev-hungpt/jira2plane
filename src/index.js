const  fs = require('fs');
const csv = require('csv-parser');


const API_TOKEN = '';
const PROJECT_ID = '';
const WORKSPACE_SLUG = "";
const MOBILE_ID = "";
const BACKEND_ID = "";
const linkRegex = /(https?:\/\/[^\s\[\]]+)/g;

const CIRCLE_1 = "";
const CIRCLE_2 = "";
const CIRCLE_3 = "";
const CIRCLE_4 = "";
const CIRCLE_5 = "";

const URL_ROOT = "";
const URL_PROJECTS = `${URL_ROOT}/api/v1/workspaces/${WORKSPACE_SLUG}/projects/`;
const URL_ADD_ISSUE = `${URL_ROOT}/api/v1/workspaces/${WORKSPACE_SLUG}/projects/${PROJECT_ID}/issues/`;
const URL_MODULES = `${URL_ROOT}/api/v1/workspaces/${WORKSPACE_SLUG}/projects/${PROJECT_ID}/modules/`;

const results = [];
// Require Jira.csv export file
fs.createReadStream('./Jira.csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
        var i = 0;
        for (const issue of results) {
            const str = issue['Description'];
            const matches = str.match(linkRegex);
            let iss = parseInt(issue['Issue id']);
            if (iss > 12515) {
                console.log(issue['Summary']);
                console.log(issue['Description']);
                console.log(issue['Parent']);
                console.log(issue['Sprint']);

                const options = {
                    method: 'POST',
                    headers: {'x-api-key': API_TOKEN, 'Content-Type': 'application/json'},
                    body: `{"name":"${issue['Summary']}"}`
                };
                var response =  await fetch(URL_ADD_ISSUE, options);
                response = await response.json();
                const ID = response.id;

                if (matches &&  matches.length > 0) {
                    const options1 = {
                        method: 'POST',
                        headers: {'x-api-key': API_TOKEN, 'Content-Type': 'application/json'},
                        body: `{"title":"${response.name}","url":"${matches[0]}"}`
                    };
                    const response1 = await fetch(`${URL_ROOT}/api/v1/workspaces/${WORKSPACE_SLUG}/projects/${PROJECT_ID}/issues/${ID}/links/`, options1)
                    console.log(`${URL_ROOT}/api/v1/workspaces/${WORKSPACE_SLUG}/projects/${PROJECT_ID}/issues/${ID}/links/`);
                    console.log(response1);
                }

                var module = MOBILE_ID;
                if (issue['Parent'] == '12513') module = BACKEND_ID;
                const options2 = {
                    method: 'POST',
                    headers: {'x-api-key': API_TOKEN, 'Content-Type': 'application/json'},
                    body: `{"name":"${response.name}","issues":["${ID}"]}`
                };
                const response2 = await fetch(`${URL_ROOT}/api/v1/workspaces/${WORKSPACE_SLUG}/projects/${PROJECT_ID}/modules/${module}/module-issues/`, options2)

                var sprint = CIRCLE_1;
                if (issue['Sprint'].includes('2')) sprint = CIRCLE_2;
                else if (issue['Sprint'].includes('3')) sprint = CIRCLE_3;
                else if (issue['Sprint'].includes('4')) sprint = CIRCLE_4;
                else if (issue['Sprint'].includes('5')) sprint = CIRCLE_5;
                const options3 = {
                    method: 'POST',
                    headers: {'x-api-key': API_TOKEN, 'Content-Type': 'application/json'},
                    body: `{"issues":["${ID}"]}`
                };
                const response3 = await fetch(`${URL_ROOT}/api/v1/workspaces/${WORKSPACE_SLUG}/projects/${PROJECT_ID}/cycles/${sprint}/cycle-issues/`, options3)

                console.log(response);
                console.log(`${URL_ROOT}/api/v1/workspaces/${WORKSPACE_SLUG}/projects/${PROJECT_ID}/modules/${module}/module-issues/`);
                console.log(response2);
                console.log(`${URL_ROOT}/api/v1/workspaces/${WORKSPACE_SLUG}/projects/${PROJECT_ID}/cycles/${sprint}/cycle-issues/`);
                console.log(response3);
                await sleep(3000);
            }
            if (i++ > 10) {
                i = 0;
                await sleep(1000 * 60);
            }
        }
    });

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}