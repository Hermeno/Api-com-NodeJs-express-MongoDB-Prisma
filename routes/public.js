import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { PrismaClient } from '@prisma/client';



const prisma = new PrismaClient();
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET


router.post('/cadastro', async (req, res) => {
    try{
        const user = req.body;
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(user.password, salt);

        const usp = await prisma.user.create({
            data: {
                name: user.name,
                email: user.email,
                password: hashPassword,
            },
        })
        res.status(201).json(usp);
    }catch(error){
        res.status(400).json({ error: 'Erro ao cadastrar o usuário' });
    }
});


router.post('/login', async (req, res) => {
    try{
        const userInfo =req.body
        const user = await prisma.user.findUnique({
            where: {
                email: userInfo.email,
            },

        });

        if(!user){
            return res.status(401).json({ error: 'E-mail ou senha inválidos' });
        }


        const isMatch = await bcrypt.compare(userInfo.password, user.password)
        if(!isMatch){
            return res.status(401).json({ error: 'E-mail ou senha inválidos' });
        }

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json(token)
    } 
    catch(error){
        res.status(401).json({ error: 'E-mail ou senha inválidos' });
    }
})






export default router;