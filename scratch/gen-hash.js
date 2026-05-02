const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('@myCardealer@303', 10);
console.log(hash);
