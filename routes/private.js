import express from 'express';
import { PrismaClient } from '@prisma/client';
// import auth from './auth';

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
});





router.post('/cadastrar-credito', async (req, res) => {
    try {
        const { moeda, valor, referencia } = req.body;
        const user_id = req.userId; // Pega direto do token autenticado

        const credito = await prisma.credito.create({
            data: {
                user_id,
                moeda,
                valor,
                referencia,
            },
        });

        res.status(201).json({ message: 'Crédito cadastrado!', credito });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Falha ao cadastrar o crédito' });
    }
});






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
});




router.post('/cadastrar-cambio', async (req, res) => {
    try {
        const { user_id, moeda_origem, moeda_destino, cotacao, total_a_cambiar, total_cambiado, numero_recibo, foto_recibo } = req.body
        await prisma.cambio.create({
            data: {
                user_id,
                moeda_origem,
                moeda_destino,
                cotacao,
                total_a_cambiar,
                total_cambiado,
                numero_recibo,
                foto_recibo
            }
        })
        res.status(200).json({ message: 'Cambio cadastrado com sucesso!' })
    } catch (error) {
        res.status(500).json({ message: 'Falha ao cadastrar o cambio'})
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



router.post('/cadastrar-missao', async (req, res) => {
    try {
        const { missao, estado, cidade, data_inicio_prevista, data_final_prevista, pais, username } = req.body
        const user_id = req.userId;
        const mission = await prisma.missao.create({
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
        })
        res.status(200).json({ message: 'Missão cadastrada com sucesso!', mission })
    } catch (error) {
        // console.error(error);
        res.status(500).json({ message: 'Falha ao cadastrar a missão'})
    }
});



router.get('/buscar-missoes', async (req, res) => {
    try {
      const missoes = await prisma.missao.findMany();
      res.status(200).json({ message: 'Missões encontradas!', missoes });
    } catch (error) {
      res.status(500).json({ message: 'Falha ao buscar as missões', error });
    }
  });
  


  router.delete('/apagar-missoes', async (req, res) => {
    // const { confirmacao } = req.body;
  
    // if (confirmacao !== 'CONFIRMAR') {
    //   return res.status(400).json({ message: 'Confirmação inválida!' });
    // }
  
    try {
      await prisma.missao.deleteMany();
      res.status(200).json({ message: 'Todas as missões foram eliminadas com sucesso!' });
    } catch (error) {
      console.error('Erro ao apagar as missões:', error);
      res.status(500).json({ message: 'Falha ao apagar as missões', error });
    }
  });  

router.post('/cadastrar-despesas', async (req, res) => {
    try {
        const { descricao, moeda_a_debitar, data_padrao, pais, cidade, outro, numero_recibo, valor, foto_recibo, missao_id, user_id, username } = req.body
        await prisma.despesa.create({
            data: {
                descricao,
                moeda_a_debitar,
                data_padrao,
                pais,
                cidade,
                outro,
                numero_recibo,
                valor,
                foto_recibo,
                missao_id,
                user_id,
                username
            }
        })
        res.status(200).json({ message: 'Despesa cadastrada com sucesso!' })
    } catch (error) {
        res.status(500).json({ message: 'Falha ao cadastrar a despesa'})
    }
});





// router.get('/buscar-despesas', async (req, res) => {
//     try {
//         const despesas = await prisma.despesa.findMany({
//             where: {
//                 user_id: req.query.user_id
//             }
//         })
//         res.status(200).json({ message: 'Despesas encontradas!', despesas })
//     } catch (error) {
//         res.status(500).json({ message: 'Falha ao buscar as despesas'})
//     }
// });



router.get('/buscar-despesas', async (req, res) => {
    try {
        const despesas = await prisma.despesa.findMany({
            where: {
                missao_id: req.query.missao_id,
                user_id: req.query.user_id
            }
        })
        res.status(200).json({ message: 'Despesas encontradas!', despesas })
    } catch (error) {
        res.status(500).json({ message: 'Falha ao buscar as despesas'})
    }
})


export default router;