import {generateToken} from '../util/tokenHandle';
import tokenConf from '../config/tokenConf.json';
import path from 'path';

const {Accounts, Varification} = require('../models');

const accessTokenSecret  = tokenConf.ACCESS_TOKEN_SECRET;
const accessTokenLife = tokenConf.ACCESS_TOKEN_LIFE;

const login = function(server, bodyParser) {
    // Get Login
    server.get('/login', bodyParser, async (req, res) => {
        try {
            res.sendFile(path.join(__dirname, '../public/html/login.html'));
        } catch (err) {
            console.log(err);
            res.status(500).json('Server Err: ', err);
        }
    })

    // Post Login
    server.post('/login', bodyParser, async (req, res) => {
        try {
            // Check username, password
            let username = await Accounts.findOne({
                where: {
                    username: req.body.user_name.toLowerCase(),    // All of username will be convert to Lowercase (at register)
                    password: req.body.password
                }
            });
            // Select * From accounts Where username = username, password = password
                if (username !== null) {    // Correct Information
                    try {
                        const accessToken = await generateToken( req.body, accessTokenSecret, accessTokenLife);     // Create Token
                        // Save JWT to (varification) Database
                        await Varification.create({
                            vari_code: accessToken,
                            user_id: username.id
                        });
                        res.setHeader('Token', accessToken);
                        res.status(200).redirect('/');
                    } catch (err) {
                        console.log("Errrrr: ", err);
                        res.status(500).json('Error!');
                    }
                }
                else {  // Not correct Information
                    res.json("Your username or password is incorrect!").redirect('/login');
                }
        } catch (err) {
            console.log(err);
            res.status(500).json({"Server Error": err}).redirect('/login');
        }
    })
}

export default login;