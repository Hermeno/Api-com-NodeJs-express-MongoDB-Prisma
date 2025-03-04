import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient()

// app.use(express.json());

// Criando um middleware que imprime no console o caminho e a query da requisição

router.get('/listar-usuarios', async (req, res) => {

    try {
        const users = await prisma.user.findMany( );
        res.status(200).json({ message: 'Usuarios listados!', users})
    } catch (error) {
        res.status(500).json({ message: 'Falha no servidor'})
    }
})


router.post('/cadastrar-credito', async (req, res) => {
    try {
        const { user_id, valor, data_vencimento } = req.body
        await prisma.credito.create({
            data: {
                user_id,
                moeda,
                valor,
                referencia,
                data_criacao
            }
        })
        res.status(200).json({ message: 'Crédito cadastrado com sucesso!' })
    } catch (error) {
        res.status(500).json({ message: 'Falha ao cadastrar o crédito'})
    }
})

router.get('/buscar-creditos/:user_id', async (req, res) => {
    try {
        const user_id = parseInt(req.params.user_id)
        const creditos = await prisma.credito.findMany({
            where: {
                user_id
            }
        })
        res.status(200).json({ message: 'Créditos encontrados!', creditos })
    } catch (error) {
        res.status(500).json({ message: 'Falha ao buscar os créditos'})
    }
})





export default router;