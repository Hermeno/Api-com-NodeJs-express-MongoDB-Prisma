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







router.post('/fotos-despesas-cadastrar', upload.array('file'), async (req, res) => {
    try {
        const { id_post } = req.body;
        const user_id = req.userId;
        const type = 'despesas';

        // Armazena apenas o nome do arquivo
        const fotos = req.files.map(file => file.filename);

        const pictures = await prisma.imagens.create({
            data: { user_id, fotos, id_post, type }
        });
        res.status(200).json({ message: 'Despesas cadastradas com sucesso!', pictures });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Falha ao cadastrar as fotos' });
    }
});



router.get('/fotos-despesas/:id_post', async (req, res) => {
    try {
        const { id_post } = req.params;

        const pictures = await prisma.imagens.findMany({
            where: { id_post: id_post }
        });

        if (!pictures || pictures.length === 0) {
            return res.status(404).json({ message: 'Sem imagens para esta despesa' });
        }

        res.status(200).json(pictures);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Sem nenhuma imagem' });
    }
});







router.put('/despesa/:despesa_id', async (req, res) => {
    const { despesa_id } = req.params;
    const { valor, cidade, descricao, numero_recibo, data_padrao } = req.body;
    const userId = req.userId;

    try {
        // Atualiza a despesa garantindo que o usuário só possa atualizar suas próprias despesas
        const despesa = await prisma.despesa.update({
            where: { 
                id: despesa_id, 
                user_id: userId 
            },
            data: { 
                valor,
                cidade,
                descricao,
                numero_recibo,
                data_padrao
            },
        });

        // Resposta de sucesso
        res.status(200).json({ message: 'Despesa atualizada com sucesso.', despesa });
    } catch (error) {
        console.error('Erro ao atualizar a despesa:', error);
        res.status(500).json({ message: 'Falha ao atualizar a despesa.', error });
    }
});




router.get('/buscar-despesas-All', async (req, res) => {
    const { missao_id } = req.query;  // Use `req.query` para parâmetros na URL
    const user_id = req.userId;
    try {
        const despesas = await prisma.despesa.findMany({
            where: {
                user_id, 
                missao_id: missao_id,
            }
        });
        console.log(despesas)
        res.status(200).json({ message: 'despesas listadas!', despesas });
    } catch (error) {
        res.status(500).json({ message: 'Falha no servidor' });
    }
});


router.get('/buscar-despesas-One', async (req, res) => {
    const { id_despesa } = req.query;  // Use `req.query` para parâmetros na URL
    const user_id = req.userId;
    try {
        const despesas = await prisma.despesa.findUnique({
            where: {
                user_id, 
                id: id_despesa,
            }
        });
        console.log(despesas)
        res.status(200).json({ message: 'despesas listadas!', despesas });
    } catch (error) {
        res.status(500).json({ message: 'Falha no servidor' });
    }
});






router.delete('/apagar-despesas', async (req, res) => {
    try {
      await prisma.despesa.deleteMany();
      res.status(200).json({ message: 'Todas as despesas foram eliminadas com sucesso!' });
    } catch (error) {
      console.error('Erro ao apagar as missões:', error);
      res.status(500).json({ message: 'Falha ao apagar as despesas', error });
    }
  });  




  router.post('/cadastrar-despesas', async (req, res) => {
    try {
        const { moeda, valor, cidade, descricao, outro, data_padrao, numero_recibo , missao_id } = req.body;
        const user_id = req.userId;

        const credito = await prisma.credito.findFirst({
            where: {
                user_id,
                moeda
            }
        });

        if (!credito) {
            return res.status(404).json({ message: 'Crédito não encontrado para essa moeda' });
        }

        if (Number(credito.valor) < valor) {
            return res.status(400).json({ message: 'Saldo insuficiente para realizar o câmbio' });
        }

        const novoValor = (Number(credito.valor) - valor).toString();

        await prisma.credito.update({
            where: {
                id: credito.id
            },
            data: {
                valor: novoValor
            }
        });

        const dispesas = await prisma.despesa.create({
            data: { 
                user_id, 
                moeda, 
                valor, 
                cidade, 
                descricao, 
                outro, 
                data_padrao, 
                numero_recibo, 
                missao_id, 
            }
        });
        res.status(200).json({ message: 'Despesa cadastrada com sucesso!', dispesas });
    } catch (error) {
        console.error('Erro ao cadastrar despesa:', error);
        res.status(500).json({ message: 'Falha ao cadastrar a despesa', error: error.message });
    }
});








router.get('/buscar-despesas', async (req, res) => {
    const { missao_id } = req.query;  // Use `req.query` para parâmetros na URL
    const user_id = req.userId;
    console.log(user_id, missao_id);
    try {
        const despesas = await prisma.despesa.findMany({
            where: {
                user_id, 
                missao_id: missao_id,
            }
        });
        console.log(despesas)  // Mostra as despesas no console
        res.status(200).json({ message: 'Despesas listadas!', despesas });
    } catch (error) {
        res.status(500).json({ message: 'Falha no servidor' });
    }
});


export default router;
