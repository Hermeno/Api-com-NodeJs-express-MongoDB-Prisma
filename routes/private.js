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





router.post('/cadastrar-credito', async (req, res) => {
    try {
        const { moeda, valor, referencia, missao_id } = req.body;
        const user_id = req.userId; // Pega direto do token autenticado

        const credito = await prisma.credito.create({
            data: {
                user_id,
                moeda,
                valor,
                referencia,
                missao_id
            },
        });

        res.status(201).json({ message: 'Crédito cadastrado!', credito });
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

// router.get('/buscar-moedas', async (req, res) => {
//     const { missao_id } = req.body;
//     try {
//         const user_id = req.userId;
//         const creditos = await prisma.credito.findMany({
//             where: { user_id, missao_id },
//             select: { 
//                 moeda: true,
//                 valor: true 
//             }
//         });        
//         res.status(200).json({ message: 'Créditos encontrados!', creditos });
//     } catch (error) {
//         res.status(500).json({ message: 'Falha ao buscar os créditos' });
//     }
// });





router.delete('/apagar-credito', async (req, res) => {
    try {
      await prisma.credito.deleteMany();
      res.status(200).json({ message: 'Todos moedas foram eliminadas com sucesso!' });
    } catch (error) {
      console.error('Erro ao apagar as missões:', error);
      res.status(500).json({ message: 'Falha ao apagar as missões', error });
    }
  });  

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
        await prisma.credito.create({
            data: {
                user_id,
                moeda: moeda_destino,
                valor: total_cambiado,
                referencia: refere,
                missao_id
            },
        });



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




router.put('/atualizar-cambio/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { moeda_origem, moeda_destino, cotacao, total_a_cambiar, total_cambiado, numero_recibo, missao_id } = req.body;
        const user_id = req.userId;

        // 🔎 Verificar se o câmbio existe
        const cambioExistente = await prisma.cambio.findUnique({
            where: { id: Number(id) }
        });

        if (!cambioExistente) {
            return res.status(404).json({ message: 'Câmbio não encontrado' });
        }

        // 🔎 Buscar crédito atual com base na moeda de origem
        const credito = await prisma.credito.findFirst({
            where: {
                user_id,
                moeda: moeda_origem
            }
        });

        if (!credito) {
            return res.status(404).json({ message: 'Crédito não encontrado para essa moeda' });
        }

        // ✅ Verificar se há saldo suficiente para a atualização
        const saldoAtual = Number(credito.valor) + Number(cambioExistente.total_a_cambiar); // Converte para número para calcular
        if (saldoAtual < Number(total_a_cambiar)) {
            return res.status(400).json({ message: 'Saldo insuficiente para realizar o câmbio' });
        }

        // ✅ Atualizar saldo no crédito (salvando como string)
        const novoValor = (saldoAtual - Number(total_a_cambiar)).toString();
        await prisma.credito.update({
            where: { id: credito.id },
            data: { valor: novoValor }
        });

        // ✅ Atualizar o câmbio (salvando strings diretamente)
        const cambioAtualizado = await prisma.cambio.update({
            where: { id: Number(id) },
            data: {
                moeda_origem,
                moeda_destino,
                cotacao,
                total_a_cambiar,
                total_cambiado,
                numero_recibo,
                missao_id
            }
        });








        res.status(200).json({ message: 'Câmbio atualizado com sucesso!', cambio: cambioAtualizado });
    } catch (error) {
        console.error('Erro ao atualizar câmbio:', error);
        res.status(500).json({ message: 'Falha ao atualizar o câmbio' });
    }
});



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

  router.delete('/apagar-cambio', async (req, res) => {
    try {
      await prisma.cambio.deleteMany();
      res.status(200).json({ message: 'Todas as missões foram eliminadas com sucesso!' });
    } catch (error) {
      console.error('Erro ao apagar as missões:', error);
      res.status(500).json({ message: 'Falha ao apagar as missões', error });
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



