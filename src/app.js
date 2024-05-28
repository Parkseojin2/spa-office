
import express from 'express';
import cookieParser from 'cookie-parser';
import UsersRouter from './routers/users.router.js';
import ResumeRouter from './routers/resumes.router.js';
import errorHandler from './middlewares/error-handler.middleware.js';

const app = express();
const PORT = 3018;


app.use(express.json());
app.use(cookieParser());
app.use('/auth', [UsersRouter]);
app.use('/resumes', [ResumeRouter]);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸어요!');
});