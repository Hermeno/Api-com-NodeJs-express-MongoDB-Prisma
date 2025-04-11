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


  router.post('/cadastrar-credito', async (req, res) => {
    try {
        const { moeda, valor: valorStr, referencia, missao_id } = req.body;
        const user_id = req.userId;
        const valor = Number(valorStr);

        if (!moeda || !valor || !missao_id) {
            return res.status(400).json({ message: 'Campos obrigatórios não preenchidos.' });
        }

        if (isNaN(valor) || valor <= 0) {
            return res.status(400).json({ message: 'O valor deve ser um número positivo.' });
        }

        const creditoExistente = await prisma.credito.findFirst({
            where: {
                user_id,
                moeda,
                missao_id
            }
        });

        let credito;

        if (creditoExistente) {
            credito = await prisma.credito.update({
                where: {
                    id: creditoExistente.id
                },
                data: {
                    valor: {
                        increment: valor
                    },
                    // Se quiser atualizar a referencia:
                    // referencia
                }
            });

            res.status(200).json({ message: 'Crédito atualizado!', credito });
        } else {
            credito = await prisma.credito.create({
                data: {
                    user_id,
                    moeda,
                    valor,
                    referencia,
                    missao_id
                }
            });

            res.status(201).json({ message: 'Crédito cadastrado!', credito });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Falha ao cadastrar o crédito' });
    }
});





router.get('/buscar-creditos', async (req, res) => {
    const { missao_id } = req.query; // Para pegar o missao_id da query string (url)
    
    try {
        const user_id = req.userId;
        const creditos = await prisma.credito.findMany({
            where: {
                user_id,
                missao_id // Certifique-se de que o missao_id seja tratado corretamente
            }
        });
        res.status(200).json({ message: 'Créditos encontrados!', creditos });
    } catch (error) {
        res.status(500).json({ message: 'Falha ao buscar os créditos' });
    }
});


router.get('/buscar-creditos-limit', async (req, res) => {
    const { missao_id } = req.query; 
    try {
        const user_id = req.userId;
        const creditos = await prisma.credito.findFirst({
            where: {
                user_id,
                missao_id
            }
        })
        res.status(200).json({ message: 'Créditos encontrados!', creditos })
    } catch (error) {
        res.status(500).json({ message: 'Falha ao buscar os créditos'})
    }
});


router.get('/buscar-moedas', async (req, res) => {
    const { missao_id } = req.query;
    console.log(missao_id)
    try {
        const user_id = req.userId;
        const creditos = await prisma.credito.findMany({
            where: { user_id, missao_id },
            select: { 
                moeda: true,
                valor: true 
            }
        });        
        res.status(200).json({ message: 'Créditos encontrados!', creditos });
    } catch (error) {
        res.status(500).json({ message: 'Falha ao buscar os créditos' });
    }
});











router.delete('/apagar-credito', async (req, res) => {
    try {
      await prisma.credito.deleteMany();
      res.status(200).json({ message: 'Todos moedas foram eliminadas com sucesso!' });
    } catch (error) {
      console.error('Erro ao apagar as missões:', error);
      res.status(500).json({ message: 'Falha ao apagar as missões', error });
    }
  });  




  export default router;
