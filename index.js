import express from 'express';
import publicRoutes from './routes/public.js'
import privateRoutes from './routes/private.js'

import auth from './middlewares/auth.js'

const app = express();
app.use(express.json());




app.use('/', publicRoutes)
app.use('/', auth, privateRoutes)

app.listen(3000, () => console.log("server init"))
// JFm48ES1mjb9LDwA
// mongodb+srv://hermeno:<db_password>@hermi.o7fmy.mongodb.net/?retryWrites=true&w=majority&appName=Hermi