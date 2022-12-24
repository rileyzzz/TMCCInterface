const open = require('open');
const url = require('url');
const http = require('http');
const https = require('https');
const fs = require('fs');


module.exports = {
  getAuthCode: function(bot_client_id) {
    return new Promise((resolve, reject) => {
      // first time auth
      let http = require('http');
      let server = http.createServer();
      server.listen(3000);

      var auth_code = null;
      server.on('request', (req, res) => {
        // console.log(`received 3000 request ${req.url}`);
        if (auth_code)
          return;
        
        const queryObject = url.parse(req.url, true).query;
        if (queryObject.code) {
          auth_code = queryObject.code;
          console.log(`Received auth code '${auth_code}'`);
          resolve(auth_code);
          server.close();
        }
        else {
          return;
        }

        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end("Please close this window");
        // server.close();
      });

      open(`https://id.twitch.tv/oauth2/authorize?response_type=code&client_id=${bot_client_id}&redirect_uri=http://localhost:3000&scope=chat%3Aread+chat%3Aedit`);
    });
  },

  getToken: function(bot_client_id, bot_client_secret, auth_code) {
    return new Promise((resolve, reject) => {
      var post_data = `client_id=${bot_client_id}&client_secret=${bot_client_secret}&code=${auth_code}&grant_type=authorization_code&redirect_uri=http://localhost:3000`;
      console.log(`POST: ${post_data}`);
      var post_options = {
        host: 'id.twitch.tv',
        port: 443,
        path: '/oauth2/token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': post_data.length
        }
      };

      var post_req = https.request(post_options, function(res) {
        res.setEncoding('utf8');

        let allData = '';
        res.on('data', chunk => {
          allData += chunk;
        });

        res.on('end', () => {
          let resolved_data = JSON.parse(allData);
          let bot_token = resolved_data.access_token;
          let bot_refresh_token = resolved_data.refresh_token;

          console.log(`received bot token: '${bot_token}', refresh token '${bot_refresh_token}'`);
          resolve({token: bot_token, refresh_token: bot_refresh_token});
        });
      });

      post_req.on('error', (e) => {
        console.error(e);
        reject();
      });

      post_req.on('timeout', () => {
        post_req.destroy();
        console.error("Request timed out!");
        reject();
      });

      // post the data
      post_req.write(post_data);
      post_req.end();
    });
  },

  refreshToken: function (bot_client_id, bot_client_secret, auth_code, bot_refresh_token) {
    return new Promise((resolve, reject) => {
      // we need a new token
      var post_data = `client_id=${bot_client_id}&client_secret=${bot_client_secret}&code=${auth_code}&grant_type=refresh_token&refresh_token=${bot_refresh_token}`;
      console.log(`POST: ${post_data}`);
      var post_options = {
        host: 'id.twitch.tv',
        port: 443,
        path: '/oauth2/token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': post_data.length
        }
      };

      var post_req = https.request(post_options, function(res) {
        res.setEncoding('utf8');

        let allData = '';
        res.on('data', chunk => {
          allData += chunk;
        });

        res.on('end', () => {
          let resolved_data = JSON.parse(allData);
          let bot_token = resolved_data.access_token;
          let bot_refresh_token = resolved_data.refresh_token;

          // resave the data
          if (bot_token && bot_refresh_token) {
            resolve({token: bot_token, refresh_token: bot_refresh_token});
          }
          else {
            reject();
          }
        });
      });

      post_req.on('error', (e) => {
        console.error(e);
        reject();
      });

      post_req.on('timeout', () => {
        post_req.destroy();
        console.error("Request timed out!");
        reject();
      });

      // post the data
      post_req.write(post_data);
      post_req.end();
    });
  }
};