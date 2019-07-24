const express = require("express");
const path = require("path");
const UsersService = require("./users-service");
const logger = require('../logger')


const usersRouter = express.Router();
const jsonBodyParser = express.json();

usersRouter.post("/", jsonBodyParser, (req, res, next) => {
  const { password, username } = req.body;

  //check that user has entered values into username and password fields
  for (const field of ["username", "password"])
    if (!req.body[field])
      return res.status(400).json({
        error: `Missing '${field}' in request body`
      });

  const passwordError = UsersService.validatePassword(password);

  //check that password entered meets password requirements (8-72 chars etc.)
  if (passwordError) return res.status(400).json({ error: passwordError });

  //check that username does not already exist in db
  UsersService.hasUserWithUserName(req.app.get("db"), username)
    .then(hasUserWithUserName => {
      if (hasUserWithUserName)
        return res.status(400).json({ error: `Username already taken` });

      //hash password
      return UsersService.hashPassword(password).then(hashedPassword => {
        const newUser = {
          username,
          password: hashedPassword
        };

        //insert new user into user table in db, serialize username (check for xss attacks)
        return UsersService.insertUser(req.app.get("db"), newUser).then(
          user => {
            res
              .status(201)
              .location(path.posix.join(req.originalUrl, `/${user.id}`))
              .json(UsersService.serializeUser(user));
          }
        );
      });
    })
    .catch(next);
});

module.exports = usersRouter;
