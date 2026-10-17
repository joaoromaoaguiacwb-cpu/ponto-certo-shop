# Ponto Certo Shop

Crie um e-commerce simples, funcional e muito bonito para um atacado/supermercado chamado "PONTO CERTO". Design mobile-first (a maioria vai acessar pelo celular), mas responsivo no computador.


🎨 IDENTIDADE VISUAL

Use as cores da logo: azul escuro (#1B3566), amarelo (#FFE600), vermelho (#E63946) e branco no fundo. Visual limpo, moderno, botões arredondados, boa legibilidade.


📐 LAYOUT (nesta ordem, de cima para baixo)

1. TOPO: a logo do Ponto Certo (usar a imagem anexada), centralizada, fixa no topo.

2. LOGO ABAIXO: barra de pesquisa grande com ícone de lupa e o texto "Buscar produtos...". A busca filtra os produtos em tempo real pelo nome.

3. EMBAIXO DA PESQUISA: categorias em botões/chips roláveis na horizontal, com ícone ou emoji. Clicar em uma categoria filtra os produtos. Incluir também o botão "Todos". Categorias:
- Frutas
- Verduras e Legumes
- Carnes e Aves
- Frios e Laticínios
- Padaria
- Mercearia (arroz, feijão, massas, óleo, açúcar, café)
- Bebidas
- Limpeza
- Higiene e Beleza
- Congelados
- Snacks e Doces
- Utilidades Domésticas

4. EMBAIXO DAS CATEGORIAS: grade de produtos (2 colunas no celular, 4 ou mais no computador).


🛒 PRODUTOS

Adicione o MÁXIMO de produtos que conseguir: no mínimo 15 a 20 produtos por categoria, com nomes realistas de supermercado/atacado (ex: "Arroz Branco 5kg", "Caixa de Leite 12un", "Detergente 500ml", "Banana Prata kg").

Os produtos são fictícios. Cada produto deve ter: foto, nome, preço em R$ (preços realistas de atacado) e categoria.

Para as fotos: gere imagens ou use fotos da internet (ex: Unsplash/Pexels) que combinem com cada produto. Se alguma imagem não carregar, mostrar uma imagem padrão bonita.

Em cada card do produto: seletor de quantidade com botões − e + (começa em 1) e um botão "Adicionar ao carrinho". Ao adicionar, mostrar um aviso rápido (toast) de confirmação.


🛍️ BOTÃO DO CARRINHO

Botão flutuante redondo no canto inferior direito, sempre visível, com ícone de carrinho e uma bolinha vermelha com a quantidade total de itens.

Ao clicar, abre o carrinho (painel lateral ou tela cheia no celular) com:
- Lista dos produtos com foto, nome, preço e quantidade
- Botões − e + para alterar quantidade e botão de remover cada item
- Botão "Limpar carrinho"
- Total da compra atualizado em tempo real
- Botão grande "Finalizar compra"
- Mensagem amigável quando o carrinho estiver vazio


✅ FINALIZAR COMPRA

Tela com formulário contendo:
- Nome completo
- Telefone/WhatsApp
- Endereço completo (rua, número, bairro, cidade, complemento)
- Botão "📍 Usar minha localização atual": ao clicar, pega a localização do aparelho e preenche o endereço automaticamente, e a pessoa só confirma ou corrige
- Forma de pagamento: Pix, Cartão de crédito, Cartão de débito, Dinheiro (se Dinheiro, perguntar "Precisa de troco para quanto?")
- Resumo do pedido com o total
- Botão "Enviar pedido"

Validar os campos obrigatórios antes de enviar.


📲 ENVIO DO PEDIDO

Ao clicar em "Enviar pedido", abrir o WhatsApp da loja (link wa.me) com uma mensagem pronta e organizada assim:

"🛒 *NOVO PEDIDO - PONTO CERTO*

👤 Cliente: [nome]
📞 Telefone: [telefone]
📍 Endereço: [endereço]
💳 Pagamento: [forma]

*Produtos:*
• 2x Arroz Branco 5kg — R$ 50,00
• 1x Detergente 500ml — R$ 2,50

💰 *TOTAL: R$ 52,50*

Obrigado por comprar no Ponto Certo! Seu pedido será confirmado em instantes. ✅"

Deixe o número de WhatsApp da loja em uma variável fácil de trocar no topo do código (placeholder: 5527999999999).

Depois de enviar, mostrar tela de sucesso e limpar o carrinho.


⚙️ REGRAS TÉCNICAS

- Sem login e sem backend: tudo funcionando no front-end
- Carrinho salvo no localStorage (não perde ao recarregar a página)
- Código simples, organizado e fácil de editar
- Rápido e leve
- Textos em português do Brasil

Não complique: o foco é ser simples, funcional e muito bonito.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://ponto-certo-shop.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7bee218d-b5ef-408e-92ef-c1c8774d888b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
