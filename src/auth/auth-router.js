const express = require("express");
const AuthService = require("./auth-service");
const logger = require('../logger')


const authRouter = express.Router();
const jsonBodyParser = express.json();

authRouter.post("/login", jsonBodyParser, (req, res, next) => {
  const { username, password } = req.body;
  const loginUser = { username, password };

  //check that user has entered values for username and password
  for (const [key, value] of Object.entries(loginUser))
    if (value == null)
      return res.status(400).json({
        error: `Missing '${key}' in request body`
      });

  //find user in db
  AuthService.getUserWithUserName(req.app.get("db"), loginUser.username)
    .then(dbUser => {
      if (!dbUser)
        return res.status(400).json({
          error: "Incorrect username or password"
        });

      //check that user has entered correct/matching password
      return AuthService.comparePasswords(
        loginUser.password,
        dbUser.password
      ).then(compareMatch => {
        if (!compareMatch)
          return res.status(400).json({
            error: "Incorrect username or password"
          });

        //on success send Jwt
        const sub = dbUser.username;
        const payload = { user_id: dbUser.id };
        res.send({
          authToken: AuthService.createJwt(sub, payload),
          user_id: dbUser.id
        });
      });
    })
    .catch(next);
});

module.exports = authRouter;
