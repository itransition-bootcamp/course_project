import passport, { Profile } from "passport";
import passportLocal from "passport-local";
import passportGithub from "passport-github2";
import passportFacebook from "passport-facebook";
const LocalStrategy = passportLocal.Strategy;
const GitHubStrategy = passportGithub.Strategy;
const FacebookStrategy = passportFacebook.Strategy;
import crypto, { BinaryLike } from "crypto";
import { Like, User as UserModel } from "./models/allModels";
import { VerifyCallback } from "passport-oauth2";

// serialize the user.id to save in the cookie session
// so the browser will remember the user when login
passport.serializeUser((user, done) => {
  return done(null, { id: user.id });
});

// deserialize the cookieUserId to user in the database
passport.deserializeUser<Express.User>((user, done) => {
  return done(null, user);
});

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: "http://127.0.0.1:3000/auth/github/callback",
    },
    async function verify(
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback
    ) {
      // check if user already exists in our own db
      const currentUser = await UserModel.findOne({
        where: { githubId: profile.id },
        include: { model: Like, attributes: ["ReviewId"] },
        attributes: {
          exclude: [
            "githubId",
            "twitterId",
            "hashedPassword",
            "salt",
            "updatedAt",
          ],
        },
      });

      if (currentUser) {
        // already have this user
        done(null, currentUser.sanitize());
      } else {
        // if not, create user in our db
        if (!profile.username)
          return done(null, undefined, {
            message: "Github profile missing username",
          });
        const newUser = await UserModel.create({
          username: profile.username,
          githubId: profile.id,
          avatar: profile.photos && profile.photos[0].value,
        });

        done(null, newUser.sanitize());
      }
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID!,
      clientSecret: process.env.FACEBOOK_APP_SECRET!,
      callbackURL: "http://localhost:3000/auth/facebook/callback",
    },
    async function verify(
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback
    ) {
      // check if user already exists in our own db
      const currentUser = await UserModel.findOne({
        where: { twitterId: profile.id },
        include: { model: Like, attributes: ["ReviewId"] },
        attributes: {
          exclude: [
            "githubId",
            "twitterId",
            "hashedPassword",
            "salt",
            "updatedAt",
          ],
        },
      });

      if (currentUser) {
        // already have this user
        done(null, currentUser.sanitize());
      } else {
        // if not, create user in our db
        if (!profile.displayName)
          return done(null, undefined, {
            message: "Facebook profile missing name",
          });
        const fbPfpUrl = await fetch(
          `https://graph.facebook.com/${profile.id}/picture?type=large&redirect=false&access_token=${accessToken}`
        )
          .then((resp) => resp.json())
          .then((json) => json.data.url);

        const newUser = await UserModel.create({
          username: profile.displayName,
          twitterId: profile.id,
          avatar: fbPfpUrl,
        });

        done(null, newUser.sanitize());
      }
    }
  )
);

passport.use(
  new LocalStrategy(function verify(username, password, done) {
    UserModel.findOne({
      where: { username: username },
      include: { model: Like, attributes: ["ReviewId"] },
      attributes: { exclude: ["githubId, hashedPassword, salt, updatedAt"] },
    }).then((user) => {
      if (!user) return done(null, false, { message: "User doesnt exist" });
      if (user.status == "banned")
        return done(null, false, { message: "User is banned" });
      if (!user.hashedPassword || !user.salt)
        return done(null, false, {
          message: "User stored in database is missing password",
        });

      crypto.pbkdf2(
        password,
        user.salt as BinaryLike,
        1000,
        32,
        "sha256",
        function (err, hashedPassword) {
          if (err) {
            return done(err);
          }
          if (
            !crypto.timingSafeEqual(
              Buffer.from(user.hashedPassword!, "base64"),
              hashedPassword
            )
          ) {
            return done(null, false, {
              message: "Incorrect username or password.",
            });
          }

          return done(null, user.sanitize());
        }
      );
    });
  })
);

declare global {
  namespace Express {
    interface User extends Partial<UserModel> {}
  }
}
