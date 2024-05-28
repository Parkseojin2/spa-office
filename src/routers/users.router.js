import express from 'express';
import { prisma } from '../utils/prisma.util.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import  authMiddleware from '../middlewares/require-access-token.middleware.js';
 


const router = express.Router();


router.post('/sign-up', async (req, res, next) => {
   try{
        const { email, password, passwordConfirm, name } = req.body;

        if (!email) {
            return res.status(400).json({ error: '이메일을 입력해 주세요.' });
        }
        if (!password) {
            return res.status(400).json({ error: '비밀번호를 입력해 주세요.' });
        }
        if (!passwordConfirm) {
            return res.status(400).json({ error: '비밀번호 확인을 입력해 주세요.' });
        }
        if (!name) {
            return res.status(400).json({ error: '이름을 입력해 주세요.' });
        }

        // 이메일 형식 검증
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: '올바른 이메일 형식이 아닙니다.' });
        }

        // 비밀번호 길이 검증
        if (password.length < 6) {
            return res.status(400).json({ error: '비밀번호는 6자리 이상이어야 합니다.' });
        }

        // 비밀번호 일치 검증
        if (password !== passwordConfirm) {
            return res.status(400).json({ error: '비밀번호가 일치하지 않습니다.' });
        }

        // 이메일 중복 검사
        const existingUser = await prisma.users.findFirst({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ error: '이미 가입된 이메일입니다.' });
        }

        // 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(password, 10);

        // 사용자 생성
        const newUser = await prisma.users.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: 'APPLICANT'
            }
        });

        // 회원가입 성공 시 새로운 사용자 정보 반환
        res.status(201).json({
            message: '회원가입이 완료되었습니다.',
            userId: newUser.userId,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
            createdAt: newUser.createdAt,
            updatedAt: newUser.updatedAt
        }); } catch (err) {
            next(err);
        }
    });



/** 로그인 API **/
router.post('/sign-in', async (req, res, next) => {
   try{
   
    const { email, password } = req.body;
    const user = await prisma.users.findFirst({ where: { email } });
    
    if (!email || !password) {
        return res.status(400).json({ error: `${!email ? '이메일' : '비밀번호'}을 입력해 주세요.` });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: '이메일 형식이 올바르지 않습니다.' });
    }


    if (!user)
      return res.status(401).json({ message: '존재하지 않는 이메일입니다.' });
    // 입력받은 사용자의 비밀번호와 데이터베이스에 저장된 비밀번호를 비교합니다.
    else if (!(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
  
    // 로그인에 성공하면, 사용자의 userId를 바탕으로 토큰을 생성합니다.
    const token = jwt.sign(
      {
        userId: user.userId,
      },
      'customized_secret_key',
      { expiresIn: '12h'}
    );
  
  
    res.header('authorization', `Bearer ${token}`);
    return res.status(200).json({ message: '로그인 성공', token });
  } catch(error) {
    next(error);
  }
});


  router.get('/profile', authMiddleware, async (req, res, next) => {
   try{
    const { userId, email, name, role, createdAt, updatedAt } = req.user;

    res.status(200).json({ userId, email, name, role, createdAt, updatedAt});

  }  catch(error) {
    next(error);
  }
});


 

export default router;

