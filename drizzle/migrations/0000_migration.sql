CREATE TABLE public.store_data (
  key text PRIMARY KEY,
  data jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.store_data TO anon, authenticated;
GRANT ALL ON public.store_data TO service_role;
ALTER TABLE public.store_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read store data" ON public.store_data FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.orders (
  id bigserial PRIMARY KEY,
  at timestamptz NOT NULL DEFAULT now(),
  total numeric NOT NULL DEFAULT 0,
  units numeric NOT NULL DEFAULT 0,
  kg numeric NOT NULL DEFAULT 0,
  coupon text,
  lines jsonb NOT NULL DEFAULT '[]'::jsonb
);
GRANT ALL ON public.orders TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.orders_id_seq TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;