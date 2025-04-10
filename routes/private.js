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

router.get('/listar-usuarios', async (req, res) => {

    try {
        const users = await prisma.user.findMany( );
        res.status(200).json({ message: 'Usuarios listados!', users})
    } catch (error) {
        res.status(500).json({ message: 'Falha no servidor'})
    }
});



router.get('/buscar-imagens', async (req, res) => {
    const { id_post, type } = req.query;
    try {
        const imagens = await prisma.imagens.findMany({
            where: {
                id_post: id_post
            }
        });

        if (imagens.length === 0) {
            return res.status(404).json({ message: 'Nenhuma imagem encontrada' });
        }

        console.log(imagens.fotos);
        res.status(200).json({ message: 'Imagens listadas!', imagens });
    } catch (error) {
        console.error('Erro ao buscar imagens:', error);
        res.status(500).json({ message: 'Falha ao buscar imagens', error: error.message });
    }
});
export default router;


