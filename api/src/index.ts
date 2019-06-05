import express from 'express';
import log4js from 'log4js';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import cors from 'cors';
import http from 'http';

import LoginRouter from './routers/login';
import OAuthRouter from './routers/oauth';
import AdminRouter from './routers/admin';

import Auth from './auth/auth';
import config from './config/main.json';

export const app = express();
export const logger = log4js.getLogger();
const port = 8080;

log4js.configure(__dirname + '/config/log4js.json');

const httpServer = http.createServer(app);

logger.level = 'ALL';

app.use(cors({ origin: config.webserver_host, credentials: true }));

app.use(express.json());
app.use(cookieParser());
app.use(session({
    secret: config.session_secret,
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

Auth();
app.use(LoginRouter);
app.use(OAuthRouter);
app.use(AdminRouter);

httpServer.listen(port, () => logger.info(`API server listening on ${port}`));