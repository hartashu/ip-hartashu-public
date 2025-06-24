const { compareHash } = require("../helpers/bcrypt");
const { generateToken } = require("../helpers/jwt");
const { OAuth2Client } = require("google-auth-library");
const { User } = require("../models");

class Controller {
  // ========== user ==========
  static async postLogin(req, res, next) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        throw new Error("EMPTY_USERNAME_PASSWORD");
      }

      const foundUser = await User.findOne({
        where: {
          username,
        },
      });

      if (!foundUser || !compareHash(password, foundUser.password)) {
        throw new Error("INVALID_CREDENTIALS");
      }

      const payload = {
        id: foundUser.id,
        username: foundUser.username,
        email: foundUser.email,
      };

      const access_token = generateToken(payload);

      res.status(200).json({
        access_token,
      });
    } catch (error) {
      next(error);
    }
  }

  static async postGoogleLogin(req, res, next) {
    try {
      const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

      const { google_token } = req.headers;

      if (!google_token) {
        throw new Error("EMPTY_GOOGLE_ACCESS_TOKEN");
      }

      const client = new OAuth2Client(GOOGLE_CLIENT_ID);

      const ticket = await client.verifyIdToken({
        idToken: google_token,
        audience: GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      const [user, created] = await User.findOrCreate({
        where: {
          email: payload.email,
        },
        defaults: {
          username: payload.email.split("@")[0],
          email: payload.email,
          password: "password_google",
          imgUrl: payload.picture,
        },
        hooks: false,
      });

      const access_token = generateToken({
        id: user.id,
        username: user.username,
        email: user.email,
      });

      res.status(200).json({
        access_token,
      });
    } catch (error) {
      next(error);
    }
  }

  static async postRegister(req, res, next) {
    try {
      res.status(501).json({
        message: "Not implemented yet",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = Controller;
