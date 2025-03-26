import express from 'express';
import publicRoutes from './routes/public.js'
import privateRoutes from './routes/private.js'
import path from 'path';
import { fileURLToPath } from 'url';

import auth from './middlewares/auth.js'

const app = express();
app.use(express.json());








const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Servir arquivos estáticos da pasta 'upload'
app.use('/uploads', express.static(path.join(__dirname, 'upload')));




app.use('/', publicRoutes)
// app.use('/', privateRoutes)
app.use('/', auth, privateRoutes)

app.listen(3000, () => console.log("server init"))
// JFm48ES1mjb9LDwA
// mongodb+srv://hermeno:<db_password>@hermi.o7fmy.mongodb.net/?retryWrites=true&w=majority&appName=Hermi