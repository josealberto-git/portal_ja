const express = require('express');
const bodyParser = require('body-parser');
const ytdl = require('ytdl-core');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
app.use(express.static('public'));
app.use(bodyParser.json());

// CONFIG OPENAI
const configuration = new Configuration({
  apiKey: 'SUA_OPENAI_API_KEY_AQUI'
});
const openai = new OpenAIApi(configuration);

// Usuários
let usuarios = [
  {user: "master", senha: "123", tipo: "master"},
  {user: "admin", senha: "123", tipo: "admin"},
  {user: "cliente", senha: "123", tipo: "cliente"}
];

// LOGIN
app.post('/login', (req,res)=>{
  const { user, senha } = req.body;
  const u = usuarios.find(x=>x.user===user && x.senha===senha);
  if(!u) return res.status(401).json({ erro:"Usuário inválido" });
  res.json({ tipo:u.tipo });
});

// CHAT IA
app.post('/chat', async (req,res)=>{
  const { pergunta } = req.body;
  if(!pergunta) return res.status(400).json({ erro:"Pergunta obrigatória" });
  try{
    const response = await openai.createChatCompletion({
      model:'gpt-4',
      messages:[{role:'user', content: pergunta}]
    });
    res.json({ resposta: response.data.choices[0].message.content });
  }catch(e){ res.status(500).json({ erro:e.message }); }
});

// YOUTUBE → MP3
app.get('/youtube', async (req,res)=>{
  const url = req.query.url;
  if(!url || !ytdl.validateURL(url)) return res.status(400).send('URL inválida');
  res.header('Content-Disposition','attachment; filename="musica.mp3"');
  ytdl(url, { filter:'audioonly', format:'mp3' }).pipe(res);
});

app.listen(3000, ()=>console.log('Servidor rodando em http://localhost:3000'));