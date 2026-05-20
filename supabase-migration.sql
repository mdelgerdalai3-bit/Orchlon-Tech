-- =============================================================
-- Orchlon TechSupply LLC — анхны 5 бүтээгдэхүүн оруулах script
-- Supabase SQL Editor дотор бүгдийг хуулж RUN дарна
-- =============================================================

-- 1. Туршилтын өгөгдлийг арилгах
truncate table products restart identity cascade;

-- 2. Жинхэнэ бүтээгдэхүүнүүдийг оруулах
insert into products (name, brand, cat, price, old_price, installment, stock, badge, badge_type, featured, is_top, img, images, specs, description, fb_url) values

-- 1. Dell Latitude 7520 vPRO
(
  'Dell Latitude 7520 vPRO', 'Dell', 'laptop',
  1700000, 1938000, 1938000, 3,
  '−12%', 'sale', true, true,
  'images/products/post2_img1.jpg',
  '["images/products/post2_img1.jpg"]'::jsonb,
  '{"cpu":"Intel Core i7 11-р үе","ram":16,"storage":"512GB SSD","gpu":"Intel Iris Xe","screen":"15.6 inch FHD","weight":"1.65 кг"}'::jsonb,
  'Америкаас шууд импортлогдсон Dell Latitude 7520 vPRO бизнес лаптоп. 11-р үеийн i7 процессор, 16GB RAM, 512GB SSD. 6 сарын баталгаа. 24 цагт хүргэлттэй.',
  'https://www.facebook.com/orchlontechpage/posts/pfbid0mto15Xj3XWJJ9cyiNXKfLiqV93RsDZLmqostd6yUW3B7F83wEoZcgDVeqYmRshpFl'
),

-- 2. Dell Latitude 3510
(
  'Dell Latitude 3510', 'Dell', 'laptop',
  1600000, 1825000, 1825000, 5,
  '−12%', 'sale', true, true,
  'images/products/post2_img2.jpg',
  '["images/products/post2_img2.jpg"]'::jsonb,
  '{"cpu":"Intel Core i7 10-р үе","ram":16,"storage":"512GB SSD","gpu":"Intel UHD Graphics","screen":"15.6 inch FHD","weight":"1.86 кг"}'::jsonb,
  'Dell Latitude 3510 бизнес зориулалттай зөөврийн компьютер. 10-р үеийн i7, 16GB RAM, 512GB SSD. Америкаас шууд импорт. 6 сарын баталгаа.',
  'https://www.facebook.com/orchlontechpage/posts/pfbid0mto15Xj3XWJJ9cyiNXKfLiqV93RsDZLmqostd6yUW3B7F83wEoZcgDVeqYmRshpFl'
),

-- 3. Lenovo ThinkPad
(
  'Lenovo ThinkPad T580', 'Lenovo', 'laptop',
  null, null, null, 2,
  'Лавлах', 'new', true, false,
  'images/products/post4_img1.jpg',
  '["images/products/post4_img1.jpg","images/products/post4_img2.jpg"]'::jsonb,
  '{"cpu":"Intel Core i5/i7","ram":16,"storage":"256/512GB SSD","gpu":"Intel UHD","screen":"15.6 inch FHD","weight":"2.0 кг"}'::jsonb,
  'Lenovo ThinkPad бизнес зориулалттай мэргэжлийн лаптоп. Бат бөх, үзэсгэлэнтэй гарын дизайн, ThinkShutter камер. Америкаас шууд импорт. Үнийг утсаар лавлана уу: 8001-2722.',
  'https://www.facebook.com/orchlontechpage/posts/pfbid02aKhNGuyoGLq7sxcks1vkN76DnxdbddtV4fdVPXxxMwAEDR7zJjRTMWGSYAv3PnvFl'
),

-- 4. Dell сонголтын зөвлөгөө
(
  'Dell зориулалт сонголтын зөвлөгөө', 'Dell', 'laptop',
  null, null, null, 99,
  'Зөвлөгөө', 'hot', true, false,
  'images/products/post1_img1.jpg',
  '["images/products/post1_img1.jpg","images/products/post1_img2.jpg","images/products/post1_img3.jpg","images/products/post1_img4.jpg"]'::jsonb,
  '{"cpu":"Олон төрөл","ram":0,"storage":"—","gpu":"—","screen":"—","weight":"—"}'::jsonb,
  'Dell брэндийн загваруудын ялгаа: Latitude (бизнес/найдвартай), XPS (тэргүүлэх дизайн/нимгэн), Inspiron (төв хэрэглээ), Vostro (жижиг бизнес). Зорилгодоо тохирох загвараа сонгоход туслах зөвлөгөө.',
  'https://www.facebook.com/orchlontechpage/posts/pfbid02L4eYrsjStBsuLSW12YbhGPJEBVuZ7M1YXjfSTf1jhW147HHJf6GRPff56J3WjFNhl'
),

-- 5. E88 Pro mini drone
(
  'E88 Pro мини drone', 'E88', 'accessories',
  null, null, null, 4,
  'Лавлах', 'new', false, false,
  'images/products/post3_img1.jpg',
  '["images/products/post3_img1.jpg","images/products/post3_img2.jpg"]'::jsonb,
  '{"cpu":"—","ram":0,"storage":"—","gpu":"—","screen":"—","weight":"0.2 кг"}'::jsonb,
  'Эвхэгддэг мини drone, зайны удирдлагатай. Гэр бүлийн зугаа цэнгэл, гадуур орчинд тохиромжтой. Үнийг утсаар лавлана уу: 8001-2722.',
  'https://www.facebook.com/orchlontechpage/posts/pfbid0AshnF5XRsZcLkYf68X75bTEzfbVb98UnQfwSmZqXUSHLPztqrQMNbDLLbC4GQFZpl'
);

-- Шалгах
select id, name, brand, price, stock from products order by id;
