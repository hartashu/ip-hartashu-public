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
      const { google_access_token } = req.headers;

      if (!google_access_token) {
        throw new Error("EMPTY_GOOGLE_ACCESS_TOKEN");
      }

      const client = new OAuth2Client();

      const ticket = await client.verifyIdToken({
        idToken: google_access_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      res.status(200).json({
        access_token,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = Controller;
