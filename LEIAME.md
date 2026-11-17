# Painel de Projetos

Painel para acompanhar seus apps e jogos: projetos, tarefas, calendário, bugs, ranking de jogadores, usuários, receita, ideias e versões.

O banco de dados já está pronto no seu Supabase (projeto `carlosandre1514-prog's Project`), com 7 tabelas que começam com `painel_`.

## 1. Subir para o GitHub Pages (pelo Termux)

1. No site do GitHub, crie um repositório vazio chamado `painel-de-projetos`.
2. No Termux:

```bash
cd ~/storage/downloads
unzip painel-de-projetos.zip -d painel-de-projetos
cd painel-de-projetos
git init
git add .
git commit -m "Painel de Projetos"
git branch -M main
git remote add origin https://github.com/carlosandre1514-prog/painel-de-projetos.git
git push -u origin main
```

3. No GitHub, abra o repositório e vá em **Settings → Pages**. Em "Branch", escolha `main` e a pasta `/ (root)`, depois toque em **Save**.
4. Em 1 ou 2 minutos o painel fica em: `https://carlosandre1514-prog.github.io/painel-de-projetos/`

## 2. Ajustar o login no Supabase

No painel do Supabase, abra **Authentication → URL Configuration**:

- **Site URL:** `https://carlosandre1514-prog.github.io/painel-de-projetos/`
- **Redirect URLs:** adicione o mesmo endereço.

Sem isso, o link de confirmação que chega por e-mail não volta para o painel.

Depois abra o painel, toque em **Criar conta**, confirme pelo e-mail e entre. Na tela de Projetos, toque em **Importar meus projetos** para trazer os 12.

Os dados de cada conta são separados: se outra pessoa criar conta, ela não vê nada seu. Se quiser fechar o cadastro depois de criar a sua conta, vá em **Authentication → Sign In / Providers → Email** e desligue "Allow new users to sign up".

### Entrar com Google (opcional)

Precisa criar uma credencial OAuth no Google Cloud e colar em **Authentication → Sign In / Providers → Google**. Até lá, o botão mostra um aviso e o login por e-mail funciona normalmente.

## 3. Ligar seus apps ao painel

Abra um projeto no painel e role até **Ligar este app ao painel**. Copie o código e cole antes de `</body>` no HTML do app. Ele já envia sozinho:

- **instalar**: a primeira vez que alguém abre o app
- **abrir**: toda vez que o app abre (vira "usuários ativos")
- **erro**: quando o app dá erro de JavaScript

E você chama quando precisar:

```js
painel.cadastro();                                // alguém criou conta
painel.feedback('bug', 'A arma some', 'Sniper_BR'); // bug ou 'sugestao'
painel.partida('Sniper_BR', 12, true, 8);        // jogos: nome, abates, venceu, minutos
```

Para apps que não são HTML (Flutter, Android nativo, Python), é só fazer um POST com o mesmo formato para `https://pxtxcbqqbjtmsmwbcise.supabase.co/rest/v1/painel_eventos` com o cabeçalho `apikey`.

## Bom saber

- **Notificações** chegam enquanto o painel está aberto (mesmo em segundo plano no navegador). Com o painel fechado não chega aviso.
- **Commits do GitHub** aparecem dentro de cada projeto que tiver o repositório preenchido. Só repositórios públicos; o GitHub limita a 60 consultas por hora.
- **Instalar como app:** no Chrome do celular, menu ⋮ → "Instalar app" ou "Adicionar à tela inicial".
- **Backup:** em Configurações → Baixar backup. Guarda projetos, tarefas, versões, ideias e receita.
- A chave em `js/config.js` é a chave pública (publishable). Pode ficar no código: quem protege os dados são as regras das tabelas.
