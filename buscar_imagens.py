"""
Roda UMA VEZ no seu computador: busca 1 foto por produto, BAIXA a foto
e salva dentro do projeto. Depois disso o site não usa mais nenhuma API.

Uso (Windows/Mac/Linux, precisa do Python 3). Rode na PASTA RAIZ do projeto:
    python buscar_imagens.py CHAVE_PEXELS CHAVE_PIXABAY
    (sem Pexels:  python buscar_imagens.py "" CHAVE_PIXABAY)

Chaves grátis:
    Pexels  -> https://www.pexels.com/api/
    Pixabay -> https://pixabay.com/api/docs/   (opcional, mas ajuda)

Resultado (já salvo nos lugares certos do projeto):
    public/produtos/001.jpg, 002.jpg, ...
    src/data/images.json

Pode interromper e rodar de novo: ele continua de onde parou.
O Pexels limita a 200 buscas por hora; se bater o limite, o script usa o
Pixabay (se você deu a chave) ou para e é só rodar de novo daqui a 1 hora.
"""
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

SRC = "src/data/products.ts"
PEXELS_KEY = sys.argv[1] if len(sys.argv) > 1 else os.environ.get("PEXELS_KEY", "")
PIXABAY_KEY = sys.argv[2] if len(sys.argv) > 2 else os.environ.get("PIXABAY_KEY", "")
OUT_JSON = "src/data/images.json"
OUT_DIR = "public/produtos"
UA = {"User-Agent": "mercado-imagens/1.0"}

pexels_bloqueado = False


def get(url, headers=None):
    req = urllib.request.Request(url, headers={**UA, **(headers or {})})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def get_json(url, headers=None):
    return json.loads(get(url, headers))


def pexels(query):
    global pexels_bloqueado
    if not PEXELS_KEY or pexels_bloqueado:
        return ""
    url = "https://api.pexels.com/v1/search?" + urllib.parse.urlencode(
        {"query": query, "per_page": 1, "orientation": "square"}
    )
    try:
        j = get_json(url, {"Authorization": PEXELS_KEY})
    except urllib.error.HTTPError as e:
        if e.code == 429:
            pexels_bloqueado = True
            print("  (limite do Pexels atingido, usando as outras fontes)")
            return ""
        raise
    photos = j.get("photos") or []
    return photos[0]["src"]["medium"] if photos else ""


def pixabay(query):
    if not PIXABAY_KEY:
        return ""
    url = "https://pixabay.com/api/?" + urllib.parse.urlencode(
        {"key": PIXABAY_KEY, "q": query, "image_type": "photo",
         "per_page": 3, "safesearch": "true", "order": "popular"}
    )
    hits = get_json(url).get("hits") or []
    return hits[0]["webformatURL"] if hits else ""


def commons(query):
    url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(
        {"action": "query", "format": "json", "generator": "search",
         "gsrnamespace": 6, "gsrsearch": query, "gsrlimit": 1,
         "prop": "imageinfo", "iiprop": "url", "iiurlwidth": 400}
    )
    j = get_json(url)
    for p in (j.get("query", {}).get("pages", {}) or {}).values():
        info = (p.get("imageinfo") or [{}])[0]
        if info.get("thumburl"):
            return info["thumburl"]
    return ""


text = open(SRC, encoding="utf-8").read()
items = re.findall(r'\["([^"]+)",\s*([\d.]+),\s*"([^"]+)"\]', text)
print(f"{len(items)} produtos encontrados")
os.makedirs(OUT_DIR, exist_ok=True)

cache = json.load(open(OUT_JSON, encoding="utf-8")) if os.path.exists(OUT_JSON) else {}

for i, (name, _price, kw) in enumerate(items, 1):
    arquivo = f"{i:03d}.jpg"
    caminho = os.path.join(OUT_DIR, arquivo)
    if cache.get(name) and os.path.exists(caminho):
        continue
    query = kw.replace("-", " ")
    ok = False
    for fonte in (pexels, pixabay, commons):
        try:
            url = fonte(query)
            if not url:
                continue
            data = get(url)
            if len(data) < 2000:
                continue
            open(caminho, "wb").write(data)
            cache[name] = f"/produtos/{arquivo}"
            print(f"[{i}/{len(items)}] {name} ({fonte.__name__}) OK")
            ok = True
            break
        except Exception as e:
            print(f"  erro em {name} ({fonte.__name__}): {e}")
    if not ok:
        print(f"[{i}/{len(items)}] {name} SEM IMAGEM")
    json.dump(cache, open(OUT_JSON, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    time.sleep(0.4)

faltando = [n for n, _, _ in items if not cache.get(n)]
print(f"\nPronto. {len(items) - len(faltando)} com imagem, {len(faltando)} sem.")
if faltando:
    print("Sem imagem (rode de novo mais tarde ou me avise):")
    for n in faltando:
        print(" -", n)
