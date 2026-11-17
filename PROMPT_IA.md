# Prompt para ligar um projeto ao painel

No painel, em **Apps conectados → Como ligar o app → Prompt para IA**, este texto já vem com a chave certa. Aqui está a versão modelo: troque `COLE_SUA_CHAVE_AQUI` e `NOME DO PROJETO`.

```text
Quero ligar este projeto (NOME DO PROJETO) ao meu painel de métricas. Faça a integração completa no código, seguindo as regras abaixo.

## Como enviar os dados
Faça POST para:
https://pxtxcbqqbjtmsmwbcise.supabase.co/rest/v1/rpc/painel_enviar

Cabeçalhos:
apikey: sb_publishable_URNeHmQn-EuIyqXbkbMSag_gWTtX2rf
Content-Type: application/json

Corpo (JSON):
{ "chave": "COLE_SUA_CHAVE_AQUI", "eventos": [ { "tipo": "...", "usuario": "id do usuário", "nome": "nome de exibição", "plataforma": "Android | iOS | Web | PC", "dados": { ... } } ] }

- Resposta de sucesso: {"ok": true, "recebidos": N}. Chave errada ou desativada: erro 401.
- Máximo de 200 eventos por envio. Agrupe eventos em lotes (a cada 1 a 2 segundos) em vez de um envio por evento.
- O envio nunca pode travar nem quebrar o app: faça de forma assíncrona, ignore erros de rede e não mostre nada ao usuário.
- Valores em reais (número, ex.: 19.9).
- "usuario" deve ser o id fixo do usuário (ex.: uid do Firebase/Supabase/Google). Antes do login, use um id anônimo salvo no aparelho e troque pelo id real depois do login.

## Eventos que o painel entende (tipo → dados)
- instalar → {} (só na primeira vez que o app abre no aparelho)
- abrir → {} (toda vez que o app abre)
- ping → {} (a cada 60 segundos enquanto o usuário está com o app aberto e visível: mantém ele como ONLINE)
- saiu → {} (quando o usuário fecha ou minimiza o app: marca como OFFLINE)
- entrou → {} (jogador conectou no servidor do jogo: marca como ONLINE)
- cadastro → { "metodo": "google" | "email" | "apple" | "anonimo" }
- login → { "metodo": "google" | "email" | ... }
- assinatura → { "plano": "mensal" | "anual" | "semanal", "valor": 19.9, "status": "ativa" | "renovada" | "cancelada" | "expirada" | "reembolsada", "expira_em": "data ISO (opcional)" }
- transacao → { "valor": 4.9, "item": "500 moedas", "tipo": "compra" | "reembolso" }
- presente → { "para": "nome ou id de quem recebeu", "item": "Rosa", "valor": 1 }
- partida → { "abates": 12, "vitoria": true, "minutos": 8, "modo": "Squad" }
- erro → { "mensagem": "texto do erro" } (capture erros não tratados)
- feedback → { "tipo": "bug" | "sugestao", "mensagem": "...", "contato": "..." }
- servidor → { "online": número de jogadores conectados agora, "versao": "1.0.0" } (SÓ no servidor, a cada 60 segundos; não precisa de "usuario")
- servidor_parou → {} (quando o servidor desligar)
- Qualquer outro evento importante do projeto: invente um tipo em minúsculas com _ (ex.: "nivel_concluido") e mande os detalhes em "dados".

## O que fazer
1. Veja a tecnologia do projeto (site, app, jogo, com ou sem servidor) e crie um módulo/arquivo único de integração (ex.: painel.js, Painel.cs, painel.dart) com uma função para enviar eventos com fila e lotes.
2. Envie automaticamente: instalar, abrir, ping a cada 60 s, saiu, e erro.
3. Procure no código onde acontecem: cadastro e login (com o método), assinaturas/pagamentos, compras, envio de presentes, partidas, e conexão/desconexão de jogadores. Chame o evento certo em cada lugar, com os dados reais.
4. Se o projeto tiver servidor (Node, Python, etc.), envie de lá o evento "servidor" a cada 60 segundos com o número de jogadores online, e "servidor_parou" ao desligar. Pagamentos e assinaturas devem ser enviados preferencialmente pelo servidor, depois de confirmados.
5. Segurança: se houver servidor, guarde a chave em variável de ambiente (PAINEL_CHAVE) e não deixe ela no código público. Se o projeto for só front-end, pode deixar a chave no código.
6. Não mande senhas, e-mails, CPF ou dados de cartão nos eventos.
7. No fim, me diga em quais arquivos e lugares você colocou cada evento, e o que eu preciso fazer (se precisar de algo).

Chave deste projeto: COLE_SUA_CHAVE_AQUI
```
