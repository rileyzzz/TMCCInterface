
// connect to C++ app
const tmcc_port = 8080;
var tmcc = require('net').Socket();
tmcc.connect(tmcc_port, 'localhost', () => {
    console.log(`Connected to TMCC on port ${tmcc_port}`);

    tmcc.write('Hello\n');
});
