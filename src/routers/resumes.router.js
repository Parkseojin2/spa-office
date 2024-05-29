
import express from 'express'
import { prisma } from '../utils/prisma.util.js';
import authMiddleware from '../middlewares/require-access-token.middleware.js';



const router = express.Router();


 router.post('/apply', authMiddleware, async (req, res, next) => {
   
    try{
    
    const { title, content } = req.body;
    const userId = req.user.userId;

    if (!title || !content) {
        return res.status(400).json({ error: `${!title ? '제목' : '내용'}을 입력해 주세요.` });
    }
    

    if (content.length < 150) {
        return res.status(400).json({ error: "자기 소개는 150자 이상 작성해야 합니다."})
    }

    const post = await prisma.posts.create({

        data: {
            UserId: userId,
            title,
            content,
            status: 'APPLY',
        },

    });

    return res.status(201).json({ message: '이력서 등록이 완료되었습니다.',
        postId: post.postId,
        userId:post.UserId,
        title: post.title,
        content: post.content,
        status: post.status,
        createdAt: post.createdAt,
        updatedAt:post.updatedAt
    });


} catch(error) {
    next(error);
}
});


  router.get('/status', authMiddleware, async(req, res, next)=> {
    try{
        const { userId } = req.user;
        const { sort } =req.query;


        const orderBy =sort && sort.toLowerCase() === 'asc' ? { createdAt: 'asc'} : { createdAt: 'desc'};
        const resumes = await prisma.posts.findMany({
            where: {UserId: userId},
            orderBy,
            include: { User: { select: { name: true } } }
        });

        res.status(200).json(resumes);
    } catch (error) {
        next(error);
    }
});


router.get('/status/:postId',  authMiddleware, async(req, res, next) => {
    try {
        const { userId } = req.user;
        const { postId } = req.params;

        const resume = await prisma.posts.findFirst({
            where: { postId: +postId, UserId: userId },

            include: {
                User: true,
            },
        });

        if (!resume) {
            return res.status(404).json({ message: '이력서가 존재하지 않습니다.' });
        }

        const resumeDetail = {
            postId: resume.postId,
            userName: resume.User.name,
            title: resume.title,
            content: resume.content,
            status: resume.status,
            createdAt: resume.createdAt,
            updatedAt: resume.updatedAt,
        };

        return res.status(200).json(resumeDetail);
    } catch(error) {
        next(error);
    }
});


router.patch('/:postId', authMiddleware, async (req, res, next) => {
    try {
     
        const { userId } = req.user;
        const { postId } = req.params;
        const { title, content } = req.body;

      
        if (!title && !content) {
            return res.status(400).json({ error: '수정할 정보를 입력해 주세요.' });
        }

        
        if (content && content.length < 150) {
            return res.status(400).json({ error: '자기 소개는 150자 이상 작성해야 합니다.' });
        }

     
        const resume = await prisma.posts.findFirst({
            where: { postId: +postId, UserId: userId },
        });
        if (!resume) {
            return res.status(404).json({ message: '이력서가 존재하지 않습니다.' });
        }

      
        const updateData = {};
        if (title) updateData.title = title;
        if (content) updateData.content = content;

       
        const updatedResume = await prisma.posts.update({ message: '수정이 완료 되었습니다.',
            where: { postId: +postId },
            data: updateData,
        });

       
        const resumeDetail = {
            postId: updatedResume.postId,
            userId: updatedResume.UserId,
            title: updatedResume.title,
            content: updatedResume.content,
            status: updatedResume.status,
            createdAt: updatedResume.createdAt,
            updatedAt: updatedResume.updatedAt,
        };

        return res.status(200).json(resumeDetail);
    } catch (error) {
        next(error);
    }
});


router.delete('/delete/:postId', authMiddleware, async (req, res, next) => {
    try {
        
        const { userId } = req.user;
        const { postId } = req.params;

     
        const resume = await prisma.posts.findFirst({
            where: { postId: +postId, UserId: userId },
        });

        
        if (!resume) {
            return res.status(404).json({ message: '이력서가 존재하지 않습니다.' });
        }

   
        await prisma.posts.delete({
            where: { postId: +postId },
        });

      
        return res.status(200).json({ postId: +postId });
    } catch (error) {
        next(error);
    }
});


export default router;

    
        
    



    
    
