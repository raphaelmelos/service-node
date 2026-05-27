import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import jwtAPI from "jsonwebtoken";

const app = express();
const jwt = jwtAPI;
const secret = "JmILHTCmw1oQCrt5NV2eYuW1zOIV1p0NlbMl93G0Uw7iRjmgFtBVHjKSI1q4ZCfG3PVqePGNL1G2ZhvpLDloeh";

const db = mysql.createPool(
    {
        host : 'fundatec.mysql.dbaas.com.br',
        user : 'fundatec',
        password: 'Fundatec@ti26',
        database: 'fundatec',
        waitForConnections : true,  
        connectionLimit: 10,
        queueLimit: 0
    }
)

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true}));

function verifiqueJWT(req, res, next)
{
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) return res.status(401).json({auth: false, messagem: 'Token não fornecido'});

    jwt.verify(token,secret, (err, decode)=> {

        if (err) return res.status(500).json({auth: false, messagem: 'Falha na autenticacão'});

        req.userid = decode.id;
        next();

    });
}



app.post("/login", (req,res) => {

    const { usuario, senha } = req.body;

    if (usuario === 'adminti26' && senha ==='ti26@1234')
    {
        const id = '1';
        const token = jwt.sign({id}, secret, {expiresIn: '300s'});
        return res.json({auth: true, token});
    }
    else
    {
        res.status(401).json({erro: 'credenciais inválidas'});
    }
});


app.get("/teste", (req,res) => {
    res.status(200).send('Teste do primeiro servico');
});

app.get("/clientes", verifiqueJWT, async (req,res) => {
   try {

        const sql = "SELECT idcliente, nome, dtanascimento, cpf FROM cliente";
        const [rows] =  await db.query(sql);

        res.status(200).json(rows);
   
   } catch (error) {
        console.log(error);
        res.status(500).json({ erro : 'Erro ao solicitar o cliente'})
   }
});

app.get("/clientesbyid", verifiqueJWT, async (req,res) => {
   try {

        const { idcliente } = req.query;

        if (!idcliente) {
            return res.status(400).json({ erro: 'ID do cliente não fornecido' });
        }

        const sql = "SELECT idcliente, nome, dtanascimento, cpf FROM cliente where idcliente = ?";
        const [rows] =  await db.query(sql,[idcliente]);

        res.status(200).json(rows);
   
   } catch (error) {
        console.log(error);
        res.status(500).json({ erro : 'Erro ao solicitar o cliente'})
   }
});

app.post('/alterarcliente', verifiqueJWT, async (req,res) => {
    try {
       
        const { idcliente, nome, dtanascimento, cpf } = req.body;

        const sql = 'update cliente set nome=? , dtanascimento = ? , cpf = ? '+
                    ' where idcliente=?';
        await db.query(sql, [nome, dtanascimento, cpf, idcliente]);

        res.status(200).json({sucesso : 'Alteração realizado com sucesso'});


    }
    catch (error) {
        console.log(error);
        res.status(500).json({ erro : 'Erro ao alterar o cliente'})
   }
})

app.post('/adicionarCliente', verifiqueJWT, async (req,res) => {
    try {
       
        const { nome, dtanascimento, cpf } = req.body;

        const sql = 'insert into cliente (nome, dtanascimento, cpf) value (?,?,?)';
        await db.query(sql, [nome, dtanascimento, cpf]);

        res.status(200).json({sucesso : 'Cadastro realizado com sucesso'});


    }
    catch (error) {
        console.log(error);
        res.status(500).json({ erro : 'Erro ao solicitar o cliente'})
   }
});

app.delete('/removerCliente/:idcliente', verifiqueJWT, async (req,res) => {
    try {

        const { idcliente } = req.params;

        const sql = 'delete from cliente where idcliente = ?';
        await db.query(sql, [idcliente]);

        res.status(200).json({sucesso : 'Deleção realizado com sucesso'});

    }
    catch (error) {
        console.log(error);
        res.status(500).json({ erro : 'Erro ao deletar o cliente'})
   }

});
app.get('/animais', verifiqueJWT, async (req, res) => {

    try {

        const sql = `
            SELECT idanimal, nome, especie, peso, altura
            FROM animais
        `;

        const [rows] = await db.query(sql);

        res.status(200).json(rows);

    } catch(error) {

        console.log(error);

        res.status(500).json({
            erro: 'Erro ao buscar animais'
        });
    }
});

app.post('/adicionarAnimal', verifiqueJWT, async (req, res) => {

    try {

        const { nome, especie, peso, altura } = req.body;

        const sql = `
            INSERT INTO animais
            (nome, especie, peso, altura)
            VALUES (?,?,?,?)
        `;

        await db.query(sql, [nome, especie, peso, altura]);

        res.status(200).json({
            sucesso: 'Animal cadastrado com sucesso'
        });

    } catch(error) {

        console.log(error);

        res.status(500).json({
            erro: 'Erro ao cadastrar animal'
        });
    }
});
app.post('/alterarAnimal', verifiqueJWT, async (req, res) => {

    try {

        const { idanimal, nome, especie, peso, altura } = req.body;

        const sql = `
            UPDATE animais
            SET nome = ?, especie = ?, peso = ?, altura = ?
            WHERE idanimal = ?
        `;

        await db.query(sql, [
            nome,
            especie,
            peso,
            altura,
            idanimal
        ]);

        res.status(200).json({
            sucesso: 'Animal alterado com sucesso'
        });

    } catch(error) {

        console.log(error);

        res.status(500).json({
            erro: 'Erro ao alterar animal'
        });
    }
});
app.delete('/removerAnimal/:idanimal', verifiqueJWT, async (req, res) => {

    try {

        const { idanimal } = req.params;

        const sql = `
            DELETE FROM animais
            WHERE idanimal = ?
        `;

        await db.query(sql, [idanimal]);

        res.status(200).json({
            sucesso: 'Animal removido com sucesso'
        });

    } catch(error) {

        console.log(error);

        res.status(500).json({
            erro: 'Erro ao remover animal'
        });
    }
});

export default app;