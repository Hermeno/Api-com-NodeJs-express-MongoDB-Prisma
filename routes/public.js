import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';




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
                username:  user.username,
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
        const token = jwt.sign({ id: user.id, user: user.username, name: user.name,  email: user.email }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json(token)
    } 
    catch(error){
        res.status(401).json({ error: 'E-mail ou senha inválidos' });
    }
})

router.post('/esqueci-senha', async (req, res) => {
    const { email } = req.body;
    
    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'herminiomacamo6@gmail.com',
                pass: 'awsyngcxxrprflrw '
            },
            tls: {
                rejectUnauthorized: false // Ignora erros de certificado autoassinado
            }
        });
        const mailOptions = {
            from: 'herminiomacamo6@gmail.com',
            to: user.email,
            subject: 'Redefinição de Senha',
            html: `<p>Clique no link para redefinir sua senha:</p>
                   <a href="http://192.168.43.226:3000/redefinir-senha/${token}">Redefinir Senha</a>`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Email de recuperação enviado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao enviar email de recuperação' });
    }
});

router.post('/redefinir-senha', async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await prisma.user.update({
            where: { id: decoded.id },
            data: { password: hashedPassword }
        });

        res.status(200).json({ message: 'Senha redefinida com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Token inválido ou expirado' });
    }
});


export default router;
