import express from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
// import auth from './auth';

const router = express.Router();
const prisma = new PrismaClient()
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const dir = './uploads';
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);  // Cria a pasta 'uploads' se não existir
      }
      cb(null, dir);
    },
    filename: function (req, file, cb) {
      const extname = path.extname(file.originalname).toLowerCase();
      const filename = `${Date.now()}${extname}`;
      cb(null, filename); // Nome do arquivo com timestamp para evitar conflitos
    },
  });
  
  const upload = multer({ storage: storage });

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






router.get('/buscar-creditos', async (req, res) => {
    try {
        // const user_id = parseInt(req.params.user_id)
        const user_id = req.userId;
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


router.get('/buscar-creditos-limit', async (req, res) => {
    try {
        const user_id = req.userId;
        const creditos = await prisma.credito.findFirst({
            where: {
                user_id
            }
        })
        res.status(200).json({ message: 'Créditos encontrados!', creditos })
    } catch (error) {
        res.status(500).json({ message: 'Falha ao buscar os créditos'})
    }
});

router.delete('/apagar-credito', async (req, res) => {
    // const { confirmacao } = req.body;
  
    // if (confirmacao !== 'CONFIRMAR') {
    //   return res.status(400).json({ message: 'Confirmação inválida!' });
    // }
  
    try {
      await prisma.credito.deleteMany();
      res.status(200).json({ message: 'Todas as missões foram eliminadas com sucesso!' });
    } catch (error) {
      console.error('Erro ao apagar as missões:', error);
      res.status(500).json({ message: 'Falha ao apagar as missões', error });
    }
  });  

// router.post('/cadastrar-cambio', async (req, res) => {
//     try {
//         const { moeda_origem, moeda_destino, cotacao, total_a_cambiar, total_cambiado, numero_recibo } = req.body
//         const user_id = req.userId;
//         const cambios = await prisma.cambio.create({
//             data: { user_id, moeda_origem, moeda_destino, cotacao, total_a_cambiar, total_cambiado, numero_recibo }
//         })
//         console.log(cambios)
//         res.status(200).json({ message: 'Cambio cadastrado com sucesso!', cambios })
//     } catch (error) {
//         console.error(error)
//         res.status(500).json({ message: 'Falha ao cadastrar o cambio'})
//     }
// });

router.post('/cadastrar-cambio', async (req, res) => {
    try {
        const { moeda_origem, moeda_destino, cotacao, total_a_cambiar, total_cambiado, numero_recibo } = req.body;
        const user_id = req.userId;

       // 🔎 Buscar crédito atual
        const credito = await prisma.credito.findFirst({
            where: {
                user_id,
                moeda: moeda_origem // Busca pela moeda de origem
            }
        });
        console.log(credito);

        if (!credito) {
            return res.status(404).json({ message: 'Crédito não encontrado para essa moeda' });
        }

        // ✅ Converter para número antes da comparação
        if (Number(credito.valor) < total_a_cambiar) {
            return res.status(400).json({ message: 'Saldo insuficiente para realizar o câmbio' });
        }

        // ✅ Converter para número antes de subtrair
        const novoValor = (Number(credito.valor) - total_a_cambiar).toString();

        await prisma.credito.update({
            where: {
                id: credito.id
            },
            data: {
                valor: novoValor
            }
        });

        const cambio = await prisma.cambio.create({
            data: {
                user_id,
                moeda_origem,
                moeda_destino,
                cotacao,
                total_a_cambiar,
                total_cambiado,
                numero_recibo
            }
        });

        console.log(cambio);
        res.status(200).json({ message: 'Cambio cadastrado com sucesso!', cambio });
    } catch (error) {
        console.error(error);
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



// router.post('/cadastrar-despesas', async (req, res) => {
//     try {
//         // user_id, valor, cidade, descricao, outro, data_padrao, numero_recibo , missao_id, missao_name}, token
//         const { moeda, valor, cidade, descricao, outro, data_padrao, numero_recibo , missao_id, missao_name } = req.body
//          const user_id = req.userId;
//          const dispesas = await prisma.despesas.create({
//             data: { user_id, moeda, valor, cidade, descricao, outro, data_padrao, numero_recibo, missao_id, missao_name
//             }
//         })
//         res.status(200).json({ message: 'Despesa cadastrada com sucesso!', dispesas })
//     } catch (error) {
//         res.status(500).json({ message: 'Falha ao cadastrar a despesa'})
//     }
// });


// router.post('/cadastrar-despesas', upload.array('photos'), async (req, res) => {
//     try {
//       const { moeda, valor, cidade, descricao, outro, data_padrao, numero_recibo, missao_id, missao_name } = req.body;
//       const user_id = req.userId;  
//       let uploadedPhotos = [];
//       console.log("Fotos carregadas para o servidor:", req.files);
//       if (req.files && req.files.length > 0) {
//         uploadedPhotos = req.files.map(file => `/uploads/${file.filename}`);
//       } 
//       try {
//         console.log("Dados recebidos para cadastrar despesa:", req.body);
//         const despesa = await prisma.despesa.create({
//           data: { user_id, moeda, valor, cidade, descricao, outro, numero_recibo, missao_id, missao_name, photos: JSON.stringify(uploadedPhotos), // Salvando as URLs das fotos no banco de dados
//           },
//         });
//         console.log("Despesa criada:", despesa);
//         res.status(200).json({ error: 'Despesa cadastrada com sucesso!', despesa });
//       } catch (error) {
//         console.error("Erro ao criar despesa no banco:", error);
//         res.status(500).json({ error: 'Falha ao cadastrar a despesa' });
//       }
//     } catch (error) {
//       console.error("Erro ao processar a solicitação:", error);
//       res.status(500).json({ error: 'Erro inesperado ao processar a solicitação' });
//     }
//   });
router.post('/cadastrar-despesas', upload.array('photos'), async (req, res) => {
    try {


        console.log('Arquivos carregados:', req.files); // Deve mostrar os arquivos carregados

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'Nenhum arquivo foi carregado.' });
        }



        const { moeda, valor, cidade, descricao, outro, numero_recibo, missao_id, missao_name } = req.body;
        const user_id = req.userId;
        console.log('Arquivos carregados:', req.files);

        let uploadedPhotos = [];
        if (req.files && req.files.length > 0) {
            uploadedPhotos = req.files.map(file => file.path);
            console.log("Fotos carregadas para o servidor:", uploadedPhotos);
        }
 
        
                


        

        const despesa = await prisma.despesa.create({
            data: {
                user_id,
                moeda,
                valor,
                cidade,
                descricao,
                outro,
                numero_recibo,
                missao_id,
                missao_name,
                photos: JSON.stringify(uploadedPhotos), 
            },
        });

        res.status(200).json({ message: 'Despesa cadastrada com sucesso!', despesa });
    } catch (error) {
        console.error("Erro ao criar despesa no banco:", error);
        res.status(500).json({ error: 'Falha ao cadastrar a despesa' });
    }
});







router.get('/buscar-despesas', async (req, res) => {

    try {
        const dispesas = await prisma.despesas.findMany( );
        res.status(200).json({ message: 'Despesas listados!', dispesas})
    } catch (error) {
        res.status(500).json({ message: 'Falha no servidor'})
    }
});




router.get('/logout', function(req, res) {
    req.session.destroy(function(err) {
        if(err) {
            console.log(err);
            return res.status(500).send();
        }
        return res.status(200).send();
    }).then();
    req.logout();
    res.redirect('/');
});


export default router;



