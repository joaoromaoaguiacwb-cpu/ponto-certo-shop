import IMAGES from "./images.json";

// ⚙️ Número do WhatsApp da loja (somente dígitos, com DDI + DDD)
export const STORE_WHATSAPP = "5542984138233";

export type Category = { id: string; name: string; emoji: string };
export type Product = { id: number; name: string; price: number; category: string; image: string; fallback: string; onSale?: boolean };

export const CATEGORIES: Category[] = [
  { id: "frutas", name: "Frutas", emoji: "🍎" },
  { id: "verduras", name: "Verduras e Legumes", emoji: "🥬" },
  { id: "carnes", name: "Carnes e Aves", emoji: "🥩" },
  { id: "frios", name: "Frios e Laticínios", emoji: "🧀" },
  { id: "padaria", name: "Padaria", emoji: "🥖" },
  { id: "mercearia", name: "Mercearia", emoji: "🍚" },
  { id: "bebidas", name: "Bebidas", emoji: "🥤" },
  { id: "limpeza", name: "Limpeza", emoji: "🧽" },
  { id: "higiene", name: "Higiene e Beleza", emoji: "🧴" },
  { id: "congelados", name: "Congelados", emoji: "🧊" },
  { id: "snacks", name: "Snacks e Doces", emoji: "🍫" },
  { id: "utilidades", name: "Utilidades Domésticas", emoji: "🍳" },
];

// Palavra extra por categoria: junto com a palavra do produto, força a foto a ter as DUAS tags
const CONTEXT: Record<string, string> = {
  frutas: "fruit",
  verduras: "vegetable",
  carnes: "meat",
  frios: "dairy",
  padaria: "bakery",
  mercearia: "food",
  bebidas: "drink",
  limpeza: "cleaning",
  higiene: "hygiene",
  congelados: "food",
  snacks: "snack",
  utilidades: "kitchen",
};

// [nome, preço, palavra-chave da foto (inglês)]
const RAW: Record<string, [string, number, string][]> = {
  frutas: [
    ["Banana Prata kg", 4.99, "banana"], ["Maçã Gala kg", 8.49, "apple"], ["Laranja Pera kg", 3.99, "orange"],
    ["Mamão Formosa kg", 5.49, "papaya"], ["Abacaxi Pérola un", 6.99, "pineapple"], ["Uva Thompson 500g", 9.99, "grapes"],
    ["Morango Bandeja 250g", 7.99, "strawberry"], ["Melancia kg", 2.79, "watermelon"], ["Manga Palmer kg", 6.49, "mango"],
    ["Limão Taiti kg", 4.29, "lime"], ["Pera Williams kg", 11.9, "pear"], ["Kiwi kg", 18.9, "kiwi"],
    ["Melão Amarelo kg", 4.99, "melon"], ["Abacate kg", 7.49, "avocado"], ["Tangerina Ponkan kg", 5.99, "tangerine"],
    ["Goiaba Vermelha kg", 6.99, "guava"], ["Maracujá Azedo kg", 9.49, "passionfruit"], ["Coco Verde un", 4.5, "coconut"],
  ],
  verduras: [
    ["Tomate Italiano kg", 6.99, "tomato"], ["Batata Inglesa kg", 4.49, "potato"], ["Cebola kg", 4.99, "onion"],
    ["Cenoura kg", 3.99, "carrot"], ["Alface Crespa un", 2.99, "lettuce"], ["Alho 200g", 6.49, "garlic"],
    ["Pimentão Verde kg", 7.99, "bell-pepper"], ["Abobrinha kg", 4.99, "zucchini"], ["Brócolis Ninja un", 6.99, "broccoli"],
    ["Couve Manteiga maço", 2.99, "kale"], ["Pepino Japonês kg", 5.49, "cucumber"], ["Beterraba kg", 3.99, "beetroot"],
    ["Repolho Verde kg", 2.99, "cabbage"], ["Batata Doce kg", 4.29, "sweet-potato"], ["Mandioca kg", 4.99, "cassava"],
    ["Couve-flor un", 7.49, "cauliflower"], ["Berinjela kg", 5.99, "eggplant"], ["Cheiro-Verde maço", 1.99, "parsley"],
  ],
  carnes: [
    ["Peito de Frango kg", 16.9, "chicken-breast"], ["Coxa e Sobrecoxa kg", 11.9, "chicken"], ["Frango Inteiro kg", 10.9, "whole-chicken"],
    ["Patinho Bovino kg", 39.9, "beef"], ["Alcatra kg", 44.9, "steak"], ["Picanha kg", 69.9, "picanha"],
    ["Carne Moída kg", 32.9, "ground-beef"], ["Costela Bovina kg", 27.9, "ribs"], ["Acém kg", 29.9, "meat"],
    ["Linguiça Toscana kg", 19.9, "sausage"], ["Lombo Suíno kg", 22.9, "pork"], ["Bisteca Suína kg", 18.9, "pork-chop"],
    ["Asa de Frango kg", 17.9, "chicken-wings"], ["Filé de Tilápia kg", 49.9, "fish"], ["Fígado Bovino kg", 15.9, "liver"],
    ["Coxinha da Asa kg", 18.9, "drumstick"], ["Cupim kg", 38.9, "bbq"], ["Hambúrguer Bovino 12un", 24.9, "burger"],
  ],
  frios: [
    ["Caixa de Leite Integral 12un", 59.9, "milk"], ["Queijo Mussarela kg", 39.9, "mozzarella"], ["Presunto Cozido kg", 29.9, "ham"],
    ["Iogurte Natural 170g", 2.99, "yogurt"], ["Manteiga com Sal 200g", 12.9, "butter"], ["Requeijão Cremoso 200g", 7.49, "cream-cheese"],
    ["Margarina 500g", 6.99, "margarine"], ["Queijo Prato kg", 42.9, "cheese"], ["Mortadela kg", 15.9, "mortadella"],
    ["Ovos Brancos 30un", 18.9, "eggs"], ["Peito de Peru kg", 54.9, "turkey"], ["Salame Italiano 100g", 11.9, "salami"],
    ["Creme de Leite 200g", 3.49, "cream"], ["Leite Condensado 395g", 5.99, "condensed-milk"], ["Queijo Parmesão 200g", 19.9, "parmesan"],
    ["Bebida Láctea 1L", 5.49, "dairy"], ["Queijo Coalho 500g", 22.9, "grilled-cheese"], ["Leite Fermentado 6un", 6.99, "milk-bottle"],
  ],
  padaria: [
    ["Pão Francês kg", 14.9, "bread-roll"], ["Pão de Forma 500g", 8.49, "sliced-bread"], ["Pão Integral 400g", 9.99, "wholegrain-bread"],
    ["Bisnaguinha 300g", 7.99, "buns"], ["Bolo de Chocolate un", 19.9, "chocolate-cake"], ["Bolo de Cenoura un", 17.9, "carrot-cake"],
    ["Pão de Queijo kg", 29.9, "cheese-bread"], ["Croissant un", 4.99, "croissant"], ["Baguete un", 6.49, "baguette"],
    ["Torrada Tradicional 160g", 5.49, "toast"], ["Rosca Doce un", 9.9, "sweet-bread"], ["Pão Sírio 320g", 7.49, "pita"],
    ["Sonho un", 3.99, "donut"], ["Pão de Hambúrguer 4un", 6.99, "burger-bun"], ["Pão de Hot Dog 10un", 7.99, "hotdog-bun"],
    ["Biscoito Polvilho 100g", 4.49, "biscuits"], ["Panetone 500g", 18.9, "panettone"], ["Broa de Milho un", 3.49, "cornbread"],
  ],
  mercearia: [
    ["Arroz Branco 5kg", 25.0, "rice"], ["Feijão Carioca 1kg", 7.99, "beans"], ["Feijão Preto 1kg", 8.49, "black-beans"],
    ["Macarrão Espaguete 500g", 4.29, "spaghetti"], ["Macarrão Parafuso 500g", 4.49, "pasta"], ["Óleo de Soja 900ml", 6.99, "cooking-oil"],
    ["Açúcar Refinado 5kg", 21.9, "sugar"], ["Café Torrado 500g", 17.9, "coffee"], ["Farinha de Trigo 1kg", 5.49, "flour"],
    ["Sal Refinado 1kg", 2.49, "salt"], ["Molho de Tomate 340g", 2.99, "tomato-sauce"], ["Azeite Extra Virgem 500ml", 34.9, "olive-oil"],
    ["Fubá 1kg", 4.29, "cornmeal"], ["Farofa Pronta 400g", 5.99, "farofa"], ["Achocolatado 400g", 8.99, "cocoa"],
    ["Aveia em Flocos 500g", 7.49, "oats"], ["Milho Verde Lata 200g", 3.49, "corn"], ["Extrato de Tomate 340g", 4.99, "tomato-paste"],
    ["Arroz Parboilizado 5kg", 26.9, "grain"], ["Vinagre 750ml", 2.99, "vinegar"],
  ],
  bebidas: [
    ["Refrigerante Cola 2L", 9.99, "cola"], ["Refrigerante Guaraná 2L", 7.99, "soda"], ["Água Mineral 1,5L", 2.49, "water-bottle"],
    ["Fardo Água Mineral 12un", 22.9, "bottled-water"], ["Suco de Laranja 1L", 8.99, "orange-juice"], ["Cerveja Lata 350ml 12un", 39.9, "beer"],
    ["Energético 473ml", 9.49, "energy-drink"], ["Chá Gelado 1,5L", 6.99, "iced-tea"], ["Água de Coco 1L", 9.99, "coconut-water"],
    ["Suco em Pó 25g", 1.29, "juice"], ["Vinho Tinto 750ml", 29.9, "red-wine"], ["Isotônico 500ml", 5.49, "sports-drink"],
    ["Refrigerante Laranja 2L", 7.49, "orange-soda"], ["Água com Gás 500ml", 2.99, "sparkling-water"], ["Néctar de Uva 1L", 7.99, "grape-juice"],
    ["Cerveja Long Neck 6un", 34.9, "beer-bottle"], ["Café Gelado 280ml", 6.49, "iced-coffee"], ["Refrigerante Lata 6un", 21.9, "soda-can"],
  ],
  limpeza: [
    ["Detergente 500ml", 2.5, "dish-soap"], ["Sabão em Pó 1,6kg", 19.9, "laundry-detergent"], ["Água Sanitária 2L", 6.49, "bleach"],
    ["Amaciante 2L", 14.9, "fabric-softener"], ["Desinfetante 2L", 9.99, "cleaning"], ["Esponja Dupla Face 4un", 5.49, "sponge"],
    ["Papel Toalha 2 rolos", 6.99, "paper-towel"], ["Saco de Lixo 100L 10un", 8.49, "trash-bag"], ["Limpador Multiuso 500ml", 4.99, "spray-bottle"],
    ["Sabão em Barra 5un", 9.99, "soap-bar"], ["Lustra Móveis 200ml", 7.49, "furniture-polish"], ["Álcool 70% 1L", 8.99, "alcohol"],
    ["Pano de Chão un", 4.49, "floor-cloth"], ["Lã de Aço 8un", 3.49, "steel-wool"], ["Vassoura un", 14.9, "broom"],
    ["Rodo 40cm un", 12.9, "squeegee"], ["Sabão Líquido 3L", 32.9, "laundry"], ["Limpa Vidros 500ml", 6.99, "window-cleaning"],
  ],
  higiene: [
    ["Papel Higiênico 12 rolos", 19.9, "toilet-paper"], ["Creme Dental 90g", 4.49, "toothpaste"], ["Sabonete 85g", 2.29, "soap"],
    ["Shampoo 350ml", 14.9, "shampoo"], ["Condicionador 350ml", 15.9, "conditioner"], ["Desodorante Aerosol 150ml", 13.9, "deodorant"],
    ["Escova de Dente un", 6.99, "toothbrush"], ["Fio Dental 50m", 7.49, "dental-floss"], ["Absorvente 8un", 5.99, "hygiene"],
    ["Fralda Infantil G 30un", 49.9, "diaper"], ["Lenço Umedecido 50un", 8.99, "wet-wipes"], ["Aparelho de Barbear 2un", 9.99, "razor"],
    ["Hidratante Corporal 400ml", 18.9, "lotion"], ["Protetor Solar FPS50", 39.9, "sunscreen"], ["Algodão 50g", 4.49, "cotton"],
    ["Enxaguante Bucal 500ml", 16.9, "mouthwash"], ["Cotonete 75un", 4.99, "cotton-swab"], ["Sabonete Líquido 250ml", 9.49, "hand-soap"],
  ],
  congelados: [
    ["Pizza Congelada Mussarela", 16.9, "pizza"], ["Lasanha Bolonhesa 600g", 18.9, "lasagna"], ["Batata Palito 2kg", 29.9, "french-fries"],
    ["Nuggets de Frango 300g", 12.9, "nuggets"], ["Sorvete 2L", 24.9, "ice-cream"], ["Pão de Queijo Cong. 1kg", 21.9, "cheese-bread"],
    ["Hambúrguer Cong. 672g", 22.9, "hamburger"], ["Polpa de Fruta 1kg", 14.9, "fruit-pulp"], ["Ervilha Congelada 300g", 6.99, "peas"],
    ["Seleta de Legumes 300g", 7.49, "frozen-vegetables"], ["Empanado de Peixe 300g", 13.9, "fish-sticks"], ["Açaí 1kg", 26.9, "acai"],
    ["Picolé Caixa 10un", 19.9, "popsicle"], ["Coxinha Congelada 1kg", 27.9, "snack"], ["Gelo Saco 5kg", 9.99, "ice"],
    ["Camarão Congelado 400g", 39.9, "shrimp"], ["Lasanha 4 Queijos 600g", 19.9, "pasta-bake"], ["Mandioca Congelada 1kg", 11.9, "fried-cassava"],
  ],
  snacks: [
    ["Chocolate ao Leite 90g", 6.49, "chocolate"], ["Biscoito Recheado 130g", 2.99, "cookies"], ["Batata Chips 120g", 9.99, "chips"],
    ["Amendoim Torrado 500g", 11.9, "peanuts"], ["Bala de Goma 100g", 4.99, "gummy"], ["Pipoca de Micro-ondas", 3.49, "popcorn"],
    ["Biscoito Água e Sal 350g", 5.99, "crackers"], ["Wafer Chocolate 115g", 3.49, "wafer"], ["Paçoca 50un", 14.9, "candy"],
    ["Chiclete 10un", 3.99, "chewing-gum"], ["Barra de Cereal 3un", 5.49, "cereal-bar"], ["Salgadinho Milho 140g", 8.49, "snacks"],
    ["Bombom Caixa 250g", 12.9, "bonbon"], ["Doce de Leite 400g", 9.49, "caramel"], ["Goiabada 300g", 5.99, "jam"],
    ["Pirulito 50un", 9.99, "lollipop"], ["Biscoito Maizena 400g", 6.49, "biscuit"], ["Chocolate em Barra 1kg", 49.9, "chocolate-bar"],
  ],
  utilidades: [
    ["Papel Alumínio 30cm", 7.99, "aluminum-foil"], ["Filme PVC 28cm", 6.99, "plastic-wrap"], ["Copo Descartável 100un", 5.99, "plastic-cups"],
    ["Prato Descartável 10un", 4.49, "paper-plates"], ["Guardanapo 50un", 2.99, "napkins"], ["Pilha AA 4un", 14.9, "batteries"],
    ["Lâmpada LED 9W", 9.99, "light-bulb"], ["Fósforo 10 caixas", 4.99, "matches"], ["Vela Branca 8un", 6.49, "candles"],
    ["Pote Plástico 3un", 12.9, "container"], ["Panela Antiaderente 20cm", 59.9, "cooking-pot"], ["Frigideira 24cm", 49.9, "frying-pan"],
    ["Pano de Prato 3un", 14.9, "kitchen-towel"], ["Prendedor de Roupa 12un", 4.99, "clothespin"], ["Garrafa Térmica 1L", 39.9, "thermos"],
    ["Talheres Descartáveis 50un", 5.49, "cutlery"], ["Isqueiro un", 3.99, "lighter"], ["Balde 10L", 11.9, "bucket"],
  ],
};

// Monta o link da foto: palavra do produto + palavra da categoria, e "/all" exige as DUAS tags.
// Ex.: banana + fruit -> https://loremflickr.com/320/320/banana,fruit/all?lock=1
const imageUrl = (kw: string, category: string, id: number) => {
  const tags = [...kw.split("-"), CONTEXT[category]].filter(Boolean).join(",");
  return `https://loremflickr.com/320/320/${tags}/all?lock=${id}`;
};

// Plano B: busca mais aberta (qualquer uma das tags), usada se a foto principal não carregar
const fallbackUrl = (kw: string, id: number) => `https://loremflickr.com/320/320/${kw.split("-").join(",")}?lock=${id}`;

let id = 0;
// Lista ORIGINAL (semente). A loja lê os produtos por src/lib/productsStore.ts, que usa essa lista só no começo.
export const PRODUCTS: Product[] = Object.entries(RAW).flatMap(([category, items]) =>
  items.map(([name, price, kw]) => {
    id++;
    const local = (IMAGES as Record<string, string>)[name];
    return { id, name, price, category, image: local ? `${local}?v=3` : imageUrl(kw, category, id), fallback: fallbackUrl(kw, id), onSale: false };
  }),
);

export const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
