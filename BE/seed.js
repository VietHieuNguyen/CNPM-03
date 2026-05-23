const mongoose = require("mongoose");
const Category = require("./model/Category");
const Comic = require("./model/Comic");

const MONGO_URL = "mongodb://localhost:27017/manga_store";

const categoriesData = [
  {
    name: "Manga",
    slug: "manga",
    description: "Truyện tranh Nhật Bản với nhiều thể loại phong phú.",
    image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=60"
  },
  {
    name: "Manhwa",
    slug: "manhwa",
    description: "Truyện tranh Hàn Quốc, thường được tô màu rực rỡ dạng webtoon.",
    image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=60"
  },
  {
    name: "Manhua",
    slug: "manhua",
    description: "Truyện tranh Trung Quốc, thường mang màu sắc cổ trang, tiên hiệp.",
    image: "https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=500&auto=format&fit=crop&q=60"
  },
  {
    name: "Light Novel",
    slug: "light-novel",
    description: "Tiểu thuyết minh họa phong cách anime/manga Nhật Bản.",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop&q=60"
  }
];

const comicsData = (cats) => [
  {
    title: "One Piece - Tập 100",
    slug: "one-piece-tap-100",
    author: "Eiichiro Oda",
    description: "Hành trình tìm kiếm kho báu huyền thoại One Piece của băng hải tặc Mũ Rơm dẫn đầu bởi thuyền trưởng khỉ Luffy. Tập 100 ghi dấu cột mốc lịch sử hoành tráng của bộ truyện.",
    price: 35000,
    discount: 10,
    stock: 50,
    sold: 1250,
    views: 15430,
    images: ["https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80"],
    category: cats.find(c => c.slug === "manga")._id,
    tags: ["Action", "Adventure", "Comedy", "Fantasy"],
    volumes: 100,
    publisher: "NXB Kim Đồng",
    publishYear: 2021,
    rating: { avg: 4.9, count: 180 },
    status: "active",
    isFeatured: true,
    isNew: false,
    isBestSeller: true
  },
  {
    title: "Demon Slayer (Kimetsu no Yaiba) - Tập 1",
    slug: "demon-slayer-tap-1",
    author: "Koyoharu Gotouge",
    description: "Tanjiro Kamado, một cậu bé tốt bụng, kiếm sống bằng nghề bán than. Bi kịch ập đến khi cả gia đình cậu bị quỷ sát hại, và em gái duy nhất Nezuko hóa thành quỷ. Cậu quyết định tham gia sát quỷ đoàn cứu em gái.",
    price: 30000,
    discount: 5,
    stock: 120,
    sold: 980,
    views: 12400,
    images: ["https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80"],
    category: cats.find(c => c.slug === "manga")._id,
    tags: ["Action", "Supernatural", "Adventure", "Historical"],
    volumes: 1,
    publisher: "NXB Kim Đồng",
    publishYear: 2020,
    rating: { avg: 4.8, count: 210 },
    status: "active",
    isFeatured: true,
    isNew: false,
    isBestSeller: true
  },
  {
    title: "Jujutsu Kaisen (Chú Thuật Hồi Chiến) - Tập 15",
    slug: "jujutsu-kaisen-tap-15",
    author: "Gege Akutami",
    description: "Trận chiến nảy lửa tại Shibuya đạt đến đỉnh điểm cao trào. Chú thuật sư Yuuji Itadori cùng đồng đội chống lại thế lực nguyền hồn hắc ám.",
    price: 32000,
    discount: 0,
    stock: 80,
    sold: 450,
    views: 5600,
    images: ["https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80"],
    category: cats.find(c => c.slug === "manga")._id,
    tags: ["Action", "Supernatural", "Fantasy"],
    volumes: 15,
    publisher: "NXB Kim Đồng",
    publishYear: 2022,
    rating: { avg: 4.7, count: 90 },
    status: "active",
    isFeatured: false,
    isNew: true,
    isBestSeller: false
  },
  {
    title: "Solo Leveling - Tập 1 (Bản Thường)",
    slug: "solo-leveling-tap-1",
    author: "Chugong",
    description: "Webtoon manhwa huyền thoại đã được chuyển thể thành sách. Sung Jin-Woo, thợ săn cấp E yếu nhất lịch sử, vô tình có được sức mạnh vô hạn từ hệ thống bí ẩn nâng cấp level.",
    price: 145000,
    discount: 15,
    stock: 45,
    sold: 620,
    views: 8900,
    images: ["https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80"],
    category: cats.find(c => c.slug === "manhwa")._id,
    tags: ["Action", "Fantasy", "Adventure"],
    volumes: 1,
    publisher: "NXB Thanh Niên",
    publishYear: 2021,
    rating: { avg: 4.9, count: 140 },
    status: "active",
    isFeatured: true,
    isNew: false,
    isBestSeller: true
  },
  {
    title: "Spy x Family - Tập 7",
    slug: "spy-x-family-tap-7",
    author: "Tatsuya Endo",
    description: "Mật vụ Twilight nhận nhiệm vụ lập gia đình giả để tiếp cận mục tiêu. Vợ giả là sát thủ chuyên nghiệp, con gái nuôi Anya có khả năng đọc suy nghĩ. Một bộ phim hài hước ấm lòng.",
    price: 30000,
    discount: 0,
    stock: 90,
    sold: 580,
    views: 7200,
    images: ["https://images.unsplash.com/photo-1601987177651-8edfe6c20009?w=600&auto=format&fit=crop&q=80"],
    category: cats.find(c => c.slug === "manga")._id,
    tags: ["Comedy", "Action", "Slice of Life"],
    volumes: 7,
    publisher: "NXB Kim Đồng",
    publishYear: 2022,
    rating: { avg: 4.8, count: 165 },
    status: "active",
    isFeatured: false,
    isNew: true,
    isBestSeller: false
  },
  {
    title: "Chainsaw Man - Tập 1",
    slug: "chainsaw-man-tap-1",
    author: "Tatsuki Fujimoto",
    description: "Denji là một thanh niên nghèo khổ làm thợ săn quỷ thuê cùng chú quỷ cưa Pochita. Sau khi bị hãm hại dã man, anh được tái sinh thành quỷ cưa Chainsaw Man vô địch.",
    price: 35000,
    discount: 20,
    stock: 60,
    sold: 430,
    views: 6100,
    images: ["https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=600&auto=format&fit=crop&q=80"],
    category: cats.find(c => c.slug === "manga")._id,
    tags: ["Action", "Horror", "Supernatural", "Comedy"],
    volumes: 1,
    publisher: "NXB Trẻ",
    publishYear: 2021,
    rating: { avg: 4.6, count: 85 },
    status: "active",
    isFeatured: false,
    isNew: true,
    isBestSeller: false
  },
  {
    title: "Overlord - Light Novel Tập 1",
    slug: "overlord-light-novel-tap-1",
    author: "Kugane Maruyama",
    description: "Game online Yggdrasil đóng cửa, game thủ gạo cội Ainz Ooal Gown bị kẹt lại và xuyên không cùng tòa lâu đài cùng đội quân hộ vệ khát máu chinh phạt dị giới.",
    price: 120000,
    discount: 10,
    stock: 30,
    sold: 150,
    views: 2300,
    images: ["https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80"],
    category: cats.find(c => c.slug === "light-novel")._id,
    tags: ["Isekai", "Fantasy", "Action"],
    volumes: 1,
    publisher: "NXB Hà Nội",
    publishYear: 2018,
    rating: { avg: 4.8, count: 70 },
    status: "active",
    isFeatured: false,
    isNew: false,
    isBestSeller: false
  },
  {
    title: "Võ Thần Chúa Tể - Tập 1",
    slug: "vo-than-chua-te-tap-1",
    author: "Thần Kì Động Họa",
    description: "Đại lục đệ nhất luyện khí sư Tần Trần bị hảo hữu hãm hại té ngã xuống vực thẳm. Ba trăm năm sau, hắn chuyển thế tái sinh ở một thế gia bị khinh rẻ, bắt đầu lại hành trình nghịch thiên võ đạo cường thế.",
    price: 85000,
    discount: 5,
    stock: 75,
    sold: 340,
    views: 4100,
    images: ["https://images.unsplash.com/photo-1508898578281-774ac4893c0c?w=600&auto=format&fit=crop&q=80"],
    category: cats.find(c => c.slug === "manhua")._id,
    tags: ["Adventure", "Fantasy", "Action"],
    volumes: 1,
    publisher: "NXB Đồng Nai",
    publishYear: 2023,
    rating: { avg: 4.5, count: 45 },
    status: "active",
    isFeatured: true,
    isNew: true,
    isBestSeller: false
  },
  {
    title: "Naruto - Tập 72",
    slug: "naruto-tap-72",
    author: "Masashi Kishimoto",
    description: "Tập cuối cùng của bộ truyện huyền thoại Naruto. Trận quyết chiến định mệnh giữa Naruto và Sasuke tại Thung lũng Tận cùng khép lại câu chuyện về thế giới Ninja.",
    price: 30000,
    discount: 0,
    stock: 150,
    sold: 1100,
    views: 13500,
    images: ["https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80"],
    category: cats.find(c => c.slug === "manga")._id,
    tags: ["Action", "Adventure", "Supernatural"],
    volumes: 72,
    publisher: "NXB Kim Đồng",
    publishYear: 2018,
    rating: { avg: 4.9, count: 320 },
    status: "active",
    isFeatured: true,
    isNew: false,
    isBestSeller: true
  },
  {
    title: "Death Note - Tập 12",
    slug: "death-note-tap-12",
    author: "Tsugumi Ohba",
    description: "Trận chiến trí tuệ đỉnh cao giữa Kira (Light Yagami) và Near đi đến hồi kết thúc đầy kịch tính. Quyển sổ thiên mệnh cuối cùng sẽ thuộc về ai?",
    price: 35000,
    discount: 10,
    stock: 90,
    sold: 950,
    views: 11200,
    images: ["https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=600&auto=format&fit=crop&q=80"],
    category: cats.find(c => c.slug === "manga")._id,
    tags: ["Thriller", "Supernatural", "Mystery"],
    volumes: 12,
    publisher: "NXB Trẻ",
    publishYear: 2016,
    rating: { avg: 4.8, count: 195 },
    status: "active",
    isFeatured: false,
    isNew: false,
    isBestSeller: true
  },
  {
    title: "Attack on Titan - Tập 34",
    slug: "attack-on-titan-tap-34",
    author: "Hajime Isayama",
    description: "Sự lựa chọn của Eren Yeager cùng cái kết đầy tranh cãi cho số phận của nhân loại trong tường thành và thế giới bên ngoài. Một kiệt tác đen tối.",
    price: 40000,
    discount: 15,
    stock: 70,
    sold: 850,
    views: 10200,
    images: ["https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80"],
    category: cats.find(c => c.slug === "manga")._id,
    tags: ["Action", "Fantasy", "Drama"],
    volumes: 34,
    publisher: "NXB Trẻ",
    publishYear: 2021,
    rating: { avg: 4.7, count: 240 },
    status: "active",
    isFeatured: true,
    isNew: false,
    isBestSeller: true
  },
  {
    title: "My Hero Academia - Tập 30",
    slug: "my-hero-academia-tap-30",
    author: "Kohei Horikoshi",
    description: "Cuộc tổng tấn công toàn diện của các anh hùng chống lại Liên minh tội phạm. Trận chiến gây ra tổn thất chưa từng có.",
    price: 32000,
    discount: 5,
    stock: 110,
    sold: 300,
    views: 3200,
    images: ["https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80"],
    category: cats.find(c => c.slug === "manga")._id,
    tags: ["Action", "Comedy", "Sports"],
    volumes: 30,
    publisher: "NXB Kim Đồng",
    publishYear: 2022,
    rating: { avg: 4.6, count: 75 },
    status: "active",
    isFeatured: false,
    isNew: true,
    isBestSeller: false
  }
];

mongoose.connect(MONGO_URL)
  .then(async () => {
    console.log("Connected to database to seed...");
    
    // Clear old data
    await Category.deleteMany({});
    await Comic.deleteMany({});
    
    console.log("Cleared old data!");

    // Insert categories
    const categories = await Category.insertMany(categoriesData);
    console.log("Seeded categories successfully!");

    // Insert comics
    const comics = await Comic.insertMany(comicsData(categories));
    console.log("Seeded comics successfully!");

    console.log("Database seeded successfully with", categories.length, "categories and", comics.length, "comics!");
    process.exit(0);
  })
  .catch(err => {
    console.error("Error seeding database:", err);
    process.exit(1);
  });
