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






router.post('/fotos-cambio', upload.array('file'), async (req, res) => {
    try {
        const { id_post } = req.body;
        const user_id = req.userId;
        const type = 'cambio';
        const fotos = req.files.map(file => file.filename);

        const pictures = await prisma.imagens.create({
            data: { user_id, fotos, id_post,  type }
        });

        res.status(200).json({ message: 'Cambio cadastrado com sucesso!', pictures });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Falha ao cadastrar as fotos' });
    }
});




router.get('/fotos-cambios/:id_post', async (req, res) => {
    try {
        const { id_post } = req.params;

        const pictures = await prisma.imagens.findMany({
            where: { id_post: id_post }
        });

        if (!pictures || pictures.length === 0) {
            return res.status(404).json({ message: 'Nenhuma imagem encontrada para este cambio' });
        }

        res.status(200).json(pictures);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Sem nenhuma imagem' });
    }
});


router.post('/cadastrar-cambio',  async (req, res) => {
    try {
        const { moeda_origem, moeda_destino, cotacao, total_a_cambiar, total_cambiado, numero_recibo,missao_id } = req.body;
        const user_id = req.userId;
        const credito = await prisma.credito.findFirst({
            where: {
                user_id,
                moeda: moeda_origem,
                missao_id
            }
        });
        if (!credito) {
            return res.status(404).json({ message: 'Crédito não encontrado para essa moeda' });
        }
        if (Number(credito.valor) < total_a_cambiar) {
            return res.status(400).json({ message: 'Saldo insuficiente para realizar o câmbio' });
        }
        const novoValor = (Number(credito.valor) - total_a_cambiar).toString();

        await prisma.credito.update({
            where: {
                id: credito.id
            },
            data: {
                valor: novoValor
            }
        });

        const refere = 'Cambio de ' + moeda_origem + ' para ' + moeda_destino;

        // Verifica se já existe crédito na moeda_destino
        const creditoDestino = await prisma.credito.findFirst({
            where: { user_id, moeda: moeda_destino, missao_id }
        });
        
        if (creditoDestino) {
            // Se existir, soma o valor
            const novoValorDestino = (Number(creditoDestino.valor) + Number(total_cambiado)).toString();
            await prisma.credito.update({
                where: { id: creditoDestino.id },
                data: { valor: novoValorDestino }
            });
        } else {
            // Se não existir, cria o crédito
            await prisma.credito.create({
                data: {
                    user_id,
                    moeda: moeda_destino,
                    valor: total_cambiado,
                    referencia: refere,
                    missao_id
                }
            });
        }
        



        const cambio = await prisma.cambio.create({
            data: {
                user_id,
                moeda_origem,
                moeda_destino,
                cotacao,
                total_a_cambiar,
                total_cambiado,
                numero_recibo,
                missao_id
            }
        });






        res.status(200).json({ message: 'Cambio cadastrado com sucesso!', cambio });
    } catch (error) {
        res.status(500).json({ message: 'Falha ao cadastrar o câmbio' });
    }
});





router.get('/buscar-cambios/:user_id', async (req, res) => {
    try {
        const user_id = parseInt(req.params.user_id)
        const cambios = await prisma.cambio.findMany({
            where: {
                user_id
            } 
        })
        res.status(200).json({ message: 'Cambios encontrados!', cambios })
    } catch (error) {
        res.status(500).json({ message: 'Falha ao buscar os cambios'})
    }
});






router.get('/buscar-cambios-one-by-one', async (req, res) => {
    try {
        const { missao_id } = req.query;
        const user_id = req.user_id;
        const cambios = await prisma.cambio.findMany({
            where: {
                missao_id
            } 
        })
        res.status(200).json({ message: 'Cambios encontrados!', cambios })
    } catch (error) {
        res.status(500).json({ message: 'Falha ao buscar os cambios'})
    }
});





router.get('/buscar-cambio-All', async (req, res) => {
    const { missao_id } = req.query;  // Use `req.query` para parâmetros na URL
    const user_id = req.userId;
    try {
        const cambios = await prisma.cambio.findMany({
            where: {
                user_id, 
                missao_id: missao_id,
            }
        });
        res.status(200).json({ message: 'cambios listadas!', cambios });
    } catch (error) {
        res.status(500).json({ message: 'Falha no servidor' });
    }
});


router.delete('/apagar-cambio', async (req, res) => {
    try {
      await prisma.cambio.deleteMany();
      res.status(200).json({ message: 'Todas as missões foram eliminadas com sucesso!' });
    } catch (error) {
      console.error('Erro ao apagar as missões:', error);
      res.status(500).json({ message: 'Falha ao apagar as missões', error });
    }
  }); 




  export default router;
