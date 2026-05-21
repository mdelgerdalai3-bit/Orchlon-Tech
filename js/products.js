// ===== Orchlon TechSupply LLC бүтээгдэхүүний мэдээлэл =====
// Facebook (orchlontechpage) -ээс эх сурвалжтай
const PRODUCTS = [
  {
    id: 1,
    name: "Dell Latitude 7520 vPRO",
    brand: "Dell",
    cat: "laptop",
    price: 1700000,
    oldPrice: 1938000,
    installment: 1938000,
    rating: 4.9,
    reviews: 18,
    stock: 3,
    badge: "−12%",
    badgeType: "sale",
    featured: true,
    top: true,
    img: "images/products/post2_img1.jpg",
    images: [
      "images/products/post2_img1.jpg"
    ],
    specs: {
      cpu: "Intel Core i7 11-р үе",
      ram: 16,
      storage: "512GB SSD",
      gpu: "Intel Iris Xe",
      screen: "15.6 inch FHD",
      weight: "1.65 кг"
    },
    desc: "Америкаас шууд импортлогдсон Dell Latitude 7520 vPRO бизнес лаптоп. 11-р үеийн i7 процессор, 16GB RAM, 512GB SSD. Бизнес чанартай. 6 сарын баталгаа. 24 цагт хүргэлттэй.",
    fbUrl: "https://www.facebook.com/orchlontechpage/posts/pfbid0mto15Xj3XWJJ9cyiNXKfLiqV93RsDZLmqostd6yUW3B7F83wEoZcgDVeqYmRshpFl"
  },
  {
    id: 2,
    name: "Dell Latitude 3510",
    brand: "Dell",
    cat: "laptop",
    price: 1600000,
    oldPrice: 1825000,
    installment: 1825000,
    rating: 4.7,
    reviews: 14,
    stock: 5,
    badge: "−12%",
    badgeType: "sale",
    featured: true,
    top: true,
    img: "images/products/post2_img2.jpg",
    images: [
      "images/products/post2_img2.jpg"
    ],
    specs: {
      cpu: "Intel Core i7 10-р үе",
      ram: 16,
      storage: "512GB SSD",
      gpu: "Intel UHD Graphics",
      screen: "15.6 inch FHD",
      weight: "1.86 кг"
    },
    desc: "Dell Latitude 3510 бизнес зориулалттай зөөврийн компьютер. 10-р үеийн i7, 16GB RAM, 512GB SSD. Америкаас шууд импорт. 6 сарын баталгаа.",
    fbUrl: "https://www.facebook.com/orchlontechpage/posts/pfbid0mto15Xj3XWJJ9cyiNXKfLiqV93RsDZLmqostd6yUW3B7F83wEoZcgDVeqYmRshpFl"
  },
  {
    id: 3,
    name: "Lenovo ThinkPad T580",
    brand: "Lenovo",
    cat: "laptop",
    price: null,
    oldPrice: null,
    installment: null,
    rating: 4.6,
    reviews: 9,
    stock: 2,
    badge: "Лавлах",
    badgeType: "new",
    featured: true,
    top: false,
    img: "images/products/post4_img1.jpg",
    images: [
      "images/products/post4_img1.jpg",
      "images/products/post4_img2.jpg"
    ],
    specs: {
      cpu: "Intel Core i5/i7",
      ram: 16,
      storage: "256/512GB SSD",
      gpu: "Intel UHD",
      screen: "15.6 inch FHD",
      weight: "2.0 кг"
    },
    desc: "Lenovo ThinkPad бизнес зориулалттай мэргэжлийн лаптоп. Бат бөх, үзэсгэлэнтэй гарын дизайн, ThinkShutter камер. Америкаас шууд импорт. Үнийг утсаар лавлана уу: 8001-2722.",
    fbUrl: "https://www.facebook.com/orchlontechpage/posts/pfbid02aKhNGuyoGLq7sxcks1vkN76DnxdbddtV4fdVPXxxMwAEDR7zJjRTMWGSYAv3PnvFl"
  },
  {
    id: 4,
    name: "Dell зориулалт сонголтын зөвлөгөө",
    brand: "Dell",
    cat: "laptop",
    price: null,
    oldPrice: null,
    installment: null,
    rating: 5.0,
    reviews: 25,
    stock: 99,
    badge: "Зөвлөгөө",
    badgeType: "hot",
    featured: true,
    top: false,
    img: "images/products/post1_img1.jpg",
    images: [
      "images/products/post1_img1.jpg",
      "images/products/post1_img2.jpg",
      "images/products/post1_img3.jpg",
      "images/products/post1_img4.jpg"
    ],
    specs: {
      cpu: "Олон төрөл",
      ram: 0,
      storage: "—",
      gpu: "—",
      screen: "—",
      weight: "—"
    },
    desc: "Dell брэндийн загваруудын ялгаа: Latitude (бизнес/найдвартай), XPS (тэргүүлэх дизайн/нимгэн), Inspiron (төв хэрэглээ), Vostro (жижиг бизнес). Зорилгодоо тохирох загвараа сонгоход туслах зөвлөгөө.",
    fbUrl: "https://www.facebook.com/orchlontechpage/posts/pfbid02L4eYrsjStBsuLSW12YbhGPJEBVuZ7M1YXjfSTf1jhW147HHJf6GRPff56J3WjFNhl"
  },
  {
    id: 5,
    name: "E88 Pro мини drone (зайны удирдлагатай)",
    brand: "E88",
    cat: "accessories",
    price: null,
    oldPrice: null,
    installment: null,
    rating: 4.4,
    reviews: 12,
    stock: 4,
    badge: "Лавлах",
    badgeType: "new",
    featured: false,
    top: false,
    img: "images/products/post3_img1.jpg",
    images: [
      "images/products/post3_img1.jpg",
      "images/products/post3_img2.jpg"
    ],
    specs: {
      cpu: "—",
      ram: 0,
      storage: "—",
      gpu: "—",
      screen: "—",
      weight: "0.2 кг"
    },
    desc: "Эвхэгддэг мини drone, зайны удирдлагатай. Гэр бүлийн зугаа цэнгэл, гадуур орчинд тохиромжтой. Үнийг утсаар лавлана уу: 8001-2722.",
    fbUrl: "https://www.facebook.com/orchlontechpage/posts/pfbid0AshnF5XRsZcLkYf68X75bTEzfbVb98UnQfwSmZqXUSHLPztqrQMNbDLLbC4GQFZpl"
  }
];

function fmtPrice(n) {
  if (n === null || n === undefined) return 'Утсаар лавлана уу';
  return new Intl.NumberFormat('mn-MN').format(n) + '₮';
}
