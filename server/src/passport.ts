import passport, { Profile } from "passport";
import passportLocal from "passport-local";
import passportGithub from "passport-github2";
const LocalStrategy = passportLocal.Strategy;
const GitHubStrategy = passportGithub.Strategy;
import crypto, { BinaryLike } from "crypto";
import { User as UserModel } from "./models/allModels";
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
      });

      if (currentUser) {
        // already have this user
        done(null, currentUser);
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

        done(null, newUser);
      }
    }
  )
);

passport.use(
  new LocalStrategy(function verify(username, password, done) {
    UserModel.findOne({ where: { username: username } }).then((user) => {
      if (!user) return done(null, false, { message: "User doesnt exist" });

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
          return done(null, user);
        }
      );
    });
  })
);

declare global {
  namespace Express {
    interface User extends UserModel {}
  }
}
