import express from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
// import auth from './auth';
import path from 'path'; 
import { v4 as uuidv4 } from 'uuid'; 
const router = express.Router();
const prisma = new PrismaClient()




const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads'); // Pasta de destino
    },
    filename: function (req, file, cb) {
        const extname = path.extname(file.originalname); // Obtém a extensão do arquivo
        const uniqueName = uuidv4() + extname; // Gera um nome único usando UUID + extensão do arquivo
        cb(null, uniqueName); // Define o nome do arquivo com UUID
    },
});

  
  const upload = multer({ storage });





// Em seu arquivo intermediário (ex: missao.js)
router.put('/missao/:missaoId', async (req, res) => {
    const { missaoId } = req.params;
    const { status } = req.body; // O status enviado será "terminado"
    const userId = req.userId; // Supondo que você tenha um middleware de autenticação que coloca o userId na req

    if (!status || status !== 'terminado') {
        return res.status(400).json({ message: 'Status inválido ou ausente.' });
    }

    try {
        // Passo 1: Selecionar todos os créditos da missão
        const creditos = await prisma.credito.findMany({
            where: {
                user_id: userId,
                missao_id: missaoId
            }
        });

        if (creditos.length === 0) {
            return res.status(404).json({ message: 'Nenhum crédito encontrado para esta missão.' });
        }

        // Passo 2: Adicionar os créditos na tabela CreditoSobra
        for (const credito of creditos) {
            await prisma.creditoSobra.create({
                data: {
                    user_id: credito.user_id,
                    moeda: credito.moeda,
                    valor: credito.valor,
                    missao_id: credito.missao_id
                }
            });
        }

        // Passo 3: Excluir os registros na tabela credito
        await prisma.credito.deleteMany({
            where: {
                user_id: userId,
                missao_id: missaoId
            }
        });

        // Passo 4: Atualizar o status da missão para "terminado"
        const missao = await prisma.missao.update({
            where: { id: missaoId, user_id: userId }, // Garante que o usuário só possa atualizar suas próprias missões
            data: { status },
        });

        // Resposta de sucesso
        res.status(200).json({ message: 'Missão atualizada para "terminado". Créditos movidos para "CreditoSobra".', missao });
    } catch (error) {
        console.error('Erro ao processar a missão:', error);
        res.status(500).json({ message: 'Falha ao processar a missão.', error });
    }
});





router.post('/cadastrar-missao', async (req, res) => {
    try {
        const { missao, estado, cidade, data_inicio_prevista, data_final_prevista, pais, username } = req.body
        const user_id = req.userId;
        const status = 'Em Andamento';
        const mission = await prisma.missao.create({
            data: {
                missao, 
                estado, 
                cidade, 
                data_inicio_prevista, 
                data_final_prevista, 
                pais,
                user_id,
                username,
                status
            }
        })
        res.status(200).json({ message: 'Missão cadastrada com sucesso!', mission })
    } catch (error) {
        // console.error(error);
        res.status(500).json({ message: 'Falha ao cadastrar a missão'})
    }
});






router.put('/atualizar-missao/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { missao, estado, cidade, data_inicio_prevista, data_final_prevista, pais, username } = req.body;
        const user_id = req.userId;

        const mission = await prisma.missao.update({
            where: { id: id },
            data: {
                missao,
                estado,
                cidade,
                data_inicio_prevista,
                data_final_prevista,
                pais,
                user_id,
                username
            }
        });

        res.status(200).json({ message: 'Missão atualizada com sucesso!', mission });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Falha ao atualizar a missão' });
    }
});














router.get('/buscar-missoes', async (req, res) => {
    const user_id = req.userId;
    try {
        const missoes = await prisma.missao.findMany({
            where: {
                user_id, // Filtra pelo ID do usuário
                status: 'Em Andamento' // Filtra pelo status "pending"
            }
        });

        res.status(200).json({ message: 'Missões encontradas!', missoes });
    } catch (error) {
        res.status(500).json({ message: 'Falha ao buscar as missões', error });
    }
});

router.get('/buscar-missoes-All', async (req, res) => {
    const user_id = req.userId;
    try {
        const missoes = await prisma.missao.findMany({
            where: {
                user_id, // Filtra pelo ID do usuário
                // status: 'Em Andamento' // Filtra pelo status "pending"
            }
        });

        res.status(200).json({ message: 'Missões encontradas!', missoes });
    } catch (error) {
        res.status(500).json({ message: 'Falha ao buscar as missões', error });
    }
});



router.get('/buscar-missaoId', async (req, res) => {
    const { missao_id } = req.query;
    const user_id = req.userId;
    try {
        const missoes = await prisma.missao.findMany({
            where: {
                user_id,
                id: missao_id
            }
        });
        res.status(200).json({ message: 'Missões encontradas!', missoes });
    } catch (error) {
        console.error('Erro ao buscar missões:', error);
        res.status(500).json({ message: 'Falha ao buscar as missões', error });
    }
});




  router.delete('/apagar-missoes', async (req, res) => {
    try {
      await prisma.missao.deleteMany();
      res.status(200).json({ message: 'Todas as missões foram eliminadas com sucesso!' });
    } catch (error) {
      console.error('Erro ao apagar as missões:', error);
      res.status(500).json({ message: 'Falha ao apagar as missões', error });
    }
  });  

  export default router;
