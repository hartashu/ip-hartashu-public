const { compareHash } = require("../helpers/bcrypt");
const { generateToken } = require("../helpers/jwt");
const { OAuth2Client } = require("google-auth-library");
const { User, Message } = require("../models");
const summarizedByAi = require("../helpers/gemini");

let ioInstance;

class Controller {
  static setIo(io) {
    ioInstance = io;
  }

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

      const access_token = generateToken({
        id: foundUser.id,
        username: foundUser.username,
        email: foundUser.email,
        imgUrl: foundUser.imgUrl,
        role: foundUser.role,
      });

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
        imgUrl: user.imgUrl,
        role: user.role,
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
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        throw new Error("EMPTY_USERNAME_PASSWORD");
      }

      const createdUser = await User.create({
        username,
        email,
        password,
        imgUrl:
          "https://static.vecteezy.com/system/resources/previews/021/548/095/non_2x/default-profile-picture-avatar-user-avatar-icon-person-icon-head-icon-profile-picture-icons-default-anonymous-user-male-and-female-businessman-photo-placeholder-social-network-avatar-portrait-free-vector.jpg",
      });

      res.status(201).json({
        message: "Success create user",
        data: {
          id: createdUser.id,
          username: createdUser.username,
          email: createdUser.email,
          imgUrl: createdUser.imgUrl,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // ========== message ==========
  static async getMessages(req, res, next) {
    try {
      let messages = await Message.findAll({
        include: {
          model: User,
        },
        order: [["createdAt", "ASC"]],
      });

      messages = messages.map((message) => {
        return {
          username: message.User.username,
          imgUrl: message.User.imgUrl,
          message: message.message,
        };
      });

      res.status(200).json({
        message: messages,
      });
    } catch (error) {
      next(error);
    }
  }

  static async postMessage(req, res, next) {
    try {
      const { userId, message } = req.body;

      const createdMessage = await Message.create({
        userId,
        message,
      });

      res.status(201).json({
        message: "Success create message",
        data: {
          id: createdMessage.id,
          userId: createdMessage.userId,
          message: createdMessage.message,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateMessageById(req, res, next) {
    try {
      const { id } = req.params;

      const { userId, message } = req.body;

      const foundMessage = await Message.findByPk(+id);

      if (!foundMessage) {
        throw new Error("INVALID_ID");
      }

      await Message.update(
        {
          userId,
          message,
        },
        {
          where: {
            id: +id,
          },
        }
      );

      res.status(200).json({
        message: "Success update message",
        data: {
          id: foundMessage.id,
          userId: foundMessage.userId,
          message: foundMessage.message,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteMessageById(req, res, next) {
    try {
      const { id } = req.params;

      const foundMessage = await Message.findByPk(+id);

      if (!foundMessage) {
        throw new Error("INVALID_ID");
      }

      await Message.destroy({
        where: {
          id: +id,
        },
      });

      res.status(200).json({
        message: "Success delete message",
        data: {
          id: foundMessage.id,
          userId: foundMessage.userId,
          message: foundMessage.message,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateMessageIsSummarized(req, res, next) {
    try {
      const { isSummarized } = req.body;

      await Message.update(
        {
          isSummarized,
        },
        {
          where: {},
        }
      );

      res.status(200).json({
        message: "Success update all messages to summarized",
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSummary(req, res, next) {
    try {
      const messages = await Message.findAll({
        where: {
          isSummarized: false,
        },
      });

      const summary = await summarizedByAi(
        messages.map((message) => message.message).join("\n\n")
      );

      if (ioInstance) {
        ioInstance.emit("summaryBroadcast", {
          username: "AI Summary",
          message: summary,
        });
      }

      res.status(200).json({
        message: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  // ========== server ==========
  static async postMessageByServer(userId, message) {
    try {
      const createdMessage = await Message.create({
        userId,
        message,
      });
    } catch (error) {
      throw new Error("INVALID_ID");
    }
  }

  // ========== user ==========
  static async updateUserById(req, res, next) {
    try {
      const { id } = req.params;
      const { imgUrl } = req.body;

      console.log("MASUK CONTROLLER UPDATE USER BY ID");

      const foundUser = await User.findByPk(+id);

      if (!foundUser) {
        throw new Error("INVALID_ID");
      }

      await User.update(
        {
          imgUrl,
        },
        {
          where: {
            id: +id,
          },
        }
      );

      res.status(200).json({
        message: "Success update user",
        data: {
          id: foundUser.id,
          imgUrl: foundUser.imgUrl,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = Controller;
