import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const documents = [
  // ==================== ENGLISH PRODUCTS (1-100) ====================
  // Category: Electronics, PC hardware, components (15 items)
  {
    title: "UltraFast Gaming Laptop X9",
    content: "High-performance gaming laptop with 14th gen Intel Core i9 processor and NVIDIA RTX 4080 GPU. Features a 240Hz QHD display and advanced cooling system for lag-free gameplay and professional video editing."
  },
  {
    title: "Quantum SSD 2TB NVMe",
    content: "Blazing-fast PCIe 5.0 solid state drive with sequential read speeds up to 10,000 MB/s. Ideal for reducing game load times, accelerating large file transfers, and boosting overall system responsiveness."
  },
  {
    title: "CrystalView 27-inch 4K Monitor",
    content: "27-inch IPS monitor with 4K UHD resolution and 99% sRGB color accuracy. Built-in flicker-free technology and blue light filter reduce eye strain during long work or gaming sessions."
  },
  {
    title: "MechMaster RGB Mechanical Keyboard",
    content: "Tactile mechanical keyboard with customizable RGB backlighting and hot-swappable switches. Features full N-key rollover and programmable macros for competitive gaming and efficient typing."
  },
  {
    title: "PrecisionPro Wireless Mouse",
    content: "Ergonomic wireless mouse with 16,000 DPI optical sensor and 8 programmable buttons. Low-latency 2.4GHz connection and long-lasting battery life up to 70 hours on a single charge."
  },
  {
    title: "ThermalTake Liquid Cooler 360mm",
    content: "All-in-one liquid CPU cooler with three 120mm PWM fans and addressable RGB pump block. Effectively dissipates heat from high-end processors, maintaining stable temperatures under heavy overclocking."
  },
  {
    title: "DDR5 Fury RAM 32GB Kit",
    content: "High-speed DDR5 memory kit (2x16GB) operating at 6000MHz with low CL36 latency. Enhances multitasking performance and speeds up data-intensive applications like 3D rendering and simulation."
  },
  {
    title: "PowerCore 850W Gold PSU",
    content: "Fully modular 850-watt power supply with 80+ Gold efficiency and silent fan operation. Provides stable and clean power delivery for high-end gaming PCs and workstations."
  },
  {
    title: "EdgeView Ultra-wide Curved Monitor",
    content: "34-inch ultra-wide curved monitor with 3440x1440 resolution and 144Hz refresh rate. Supports HDR400 and Picture-by-Picture mode for seamless multitasking and immersive gaming."
  },
  {
    title: "NanoBlade External SSD 1TB",
    content: "Pocket-sized external SSD with USB 3.2 Gen 2 interface delivering up to 1050 MB/s transfer speeds. Durable aluminum casing protects data from drops and dust, perfect for on-the-go backups."
  },
  {
    title: "AirFlow Silent Case Fan",
    content: "120mm PWM fan with fluid dynamic bearings and noise-dampening pads. Delivers up to 75 CFM airflow at only 22 dBA, keeping your PC cool without distracting noise."
  },
  {
    title: "StreamMaster Webcam 4K",
    content: "Ultra HD webcam with Sony STARVIS sensor and dual omnidirectional microphones. Auto-framing and low-light correction make it ideal for professional video conferencing and live streaming."
  },
  {
    title: "DataClutch PCIe Expansion Card",
    content: "4-port NVMe adapter card with PCIe 4.0 x16 interface and individual heat sinks. Allows adding multiple high-speed SSDs to any desktop motherboard for massive storage expansion."
  },
  {
    title: "Lumen LED Strip Kit",
    content: "Addressable RGB LED strip kit with magnetic backing and universal motherboard compatibility. Create dynamic lighting effects synchronized with music or game events to enhance your setup aesthetics."
  },
  {
    title: "RapidCharge USB-C Hub",
    content: "7-in-1 USB-C hub with 100W pass-through charging, HDMI 2.0, Gigabit Ethernet, and SD card slots. Expands laptop connectivity for dual monitors, wired network, and fast data transfers."
  },
  // Category: Smart home appliances, kitchenware (15 items)
  {
    title: "SmartAir Purifier Pro",
    content: "Wi-Fi enabled air purifier with HEPA H13 filter and real-time PM2.5 sensor. Removes 99.97% of allergens, dust, and smoke particles, controllable via voice commands or mobile app."
  },
  {
    title: "RoboVac X5 Auto-Empty",
    content: "Robot vacuum with 4000Pa suction power and self-emptying base station. Maps your home using LiDAR navigation and cleans carpets and hard floors automatically on schedule."
  },
  {
    title: "SmartWash Dishwasher",
    content: "Energy-efficient dishwasher with Wi-Fi connectivity and auto detergent dispensing. Features half-load mode and sanitary rinse cycle that eliminates 99.9% of bacteria using high-temperature steam."
  },
  {
    title: "CookMaster Induction Cooktop",
    content: "4-zone induction cooktop with touch controls and power boost function. Heats pans faster than gas and includes safety lock, overheat protection, and precise temperature regulation."
  },
  {
    title: "CoolBreeze Smart Fan",
    content: "Tower fan with voice control and natural wind simulation. Oscillates 90 degrees and has 12 speed settings, plus an integrated air ionizer for fresher indoor air quality."
  },
  {
    title: "NutriBlend Pro Blender",
    content: "High-speed blender with 1800W motor and stainless steel blades. Breaks down whole fruits, vegetables, and ice for smoothies and soups, includes pre-programmed settings for smoothies and crushing."
  },
  {
    title: "SmartRice Multi-Cooker",
    content: "Multi-functional rice cooker with 10 preset programs for grains, porridge, and cake. Uses fuzzy logic technology to adjust temperature and time, keeping rice warm for up to 24 hours."
  },
  {
    title: "AquaPure Water Filter Pitcher",
    content: "Large-capacity water filter pitcher that removes chlorine, lead, and microplastics. Each filter lasts 2 months and reduces heavy metals while retaining beneficial minerals for great-tasting drinking water."
  },
  {
    title: "SmartLock Wi-Fi Deadbolt",
    content: "Keyless smart deadbolt with fingerprint scanner and temporary access codes. Integrates with Alexa and Google Home, logs entry history, and alerts you when the door is left unlocked."
  },
  {
    title: "EnergyView Smart Plug",
    content: "Wi-Fi smart plug with real-time energy monitoring and scheduling. Track appliance electricity usage, set timers, and turn devices on/off remotely from your smartphone anywhere."
  },
  {
    title: "GrillMaster Electric Griddle",
    content: "Non-stick electric griddle with adjustable temperature control and large cooking surface. Removable drip tray captures grease for healthier cooking, dishwasher-safe plates for easy cleaning."
  },
  {
    title: "HumidifyMate Smart Humidifier",
    content: "Ultrasonic humidifier with built-in humidistat and auto mode. Maintains optimal humidity levels between 40-60%, operates silently at night, and covers rooms up to 500 square feet."
  },
  {
    title: "SmartOven Air Fryer Combo",
    content: "10-in-1 convection oven with air fry, bake, roast, and dehydrate functions. Uses rapid air circulation to cook crispy food with 85% less fat, features a 26-quart capacity."
  },
  {
    title: "CleanSweep Cordless Vacuum",
    content: "Lightweight cordless stick vacuum with detachable battery and HEPA filtration. Provides up to 50 minutes of runtime, converts to a handheld for furniture and car interior cleaning."
  },
  {
    title: "SmartFridge FreshView",
    content: "Family hub refrigerator with touch screen and internal cameras. View contents remotely, manage grocery lists, and get recipe suggestions based on available ingredients with AI assistance."
  },
  // Category: Sports, outdoors, urban mobility (14 items)
  {
    title: "UrbanGlide Electric Scooter",
    content: "Foldable electric scooter with 25-mile range and 18 mph top speed. Features dual shock absorbers and 10-inch pneumatic tires for a smooth commute on city streets and bike lanes."
  },
  {
    title: "TrailBlaze Hiking Backpack 40L",
    content: "Water-resistant daypack with ventilated back panel and adjustable torso length. Includes trekking pole attachments, rain cover, and multiple compression straps for stable load carrying."
  },
  {
    title: "AeroRun Carbon Plated Shoes",
    content: "Lightweight running shoes with carbon fiber plate and energy-return foam. Designed for marathon runners, reducing fatigue and improving running economy by up to 4%."
  },
  {
    title: "Foldable Bike Helmet",
    content: "Urban commuter helmet that folds flat to fit in a backpack. Meets CPSC safety standards with impact-absorbing EPS foam and integrated LED rear light for night visibility."
  },
  {
    title: "QuickPitch Camping Tent 2P",
    content: "Instant pop-up tent for two people with pre-attached poles. Sets up in under 10 seconds, features waterproof fabric and taped seams, includes mesh windows for ventilation."
  },
  {
    title: "HydroFlask Insulated Bottle 32oz",
    content: "Stainless steel vacuum bottle that keeps drinks cold for 24 hours or hot for 12. Powder-coated finish provides non-slip grip, wide mouth allows ice cubes and easy cleaning."
  },
  {
    title: "Compact Electric Skateboard",
    content: "Shortboard-style electric skateboard with 7-mile range and regenerative braking. Wireless remote control with speed modes, suitable for last-mile commuting and campus transportation."
  },
  {
    title: "TrailRun GPS Watch",
    content: "Multi-band GPS watch with barometric altimeter and heart rate monitor. Tracks pace, distance, and elevation gain, offers navigation with offline maps and breadcrumb trail feature."
  },
  {
    title: "CampStove Portable Cooker",
    content: "Wood-burning camp stove with USB charger that converts heat into electricity. Boils water in 5 minutes using twigs, ideal for backpacking and emergency preparedness."
  },
  {
    title: "AirPump Mini Bike Pump",
    content: "High-pressure mini pump with auto-select valve head for Presta/Schrader. Reaches 120 PSI, includes integrated pressure gauge and magnetic mount for frame attachment."
  },
  {
    title: "ZenYoga Mat 6mm",
    content: "Eco-friendly TPE yoga mat with alignment lines and non-slip texture. Closed-cell construction prevents sweat absorption, easy to clean and machine washable for studio hygiene."
  },
  {
    title: "LED Armband Reflective Vest",
    content: "USB-rechargeable LED armband and vest combo with 7 light modes. Increases runner visibility up to 500 meters, lightweight and breathable fabric for night training safety."
  },
  {
    title: "MultiTool Survival Kit",
    content: "Compact multi-tool with 18 functions including pliers, wire cutter, and saw. Includes emergency whistle, fire starter, and glass breaker in a rust-resistant stainless steel body."
  },
  {
    title: "Foldable Cargo Bike Basket",
    content: "Quick-release front basket that expands from 10L to 25L capacity. Fits most handlebars, made of recycled plastic mesh, holds up to 15kg for grocery trips or picnic supplies."
  },
  // Category: Fashion, clothes, shoes, premium accessories (14 items)
  {
    title: "Merino Wool Base Layer",
    content: "Lightweight merino wool crewneck with odor-resistant and moisture-wicking properties. Naturally thermoregulating for all-season comfort, flatlock seams prevent chafing during active wear."
  },
  {
    title: "UrbanTech Waterproof Jacket",
    content: "Breathable rain jacket with taped seams and adjustable hood. Features pit zips for ventilation, packs into its own pocket, and has reflective details for city night safety."
  },
  {
    title: "Leather Lace-Up Boots",
    content: "Full-grain leather boots with Goodyear welt construction and rubber lug sole. Oil-resistant and slip-proof, lined with breathable leather for all-day comfort on concrete or trails."
  },
  {
    title: "Cashmere Blend Scarf",
    content: "Soft cashmere and silk blend scarf measuring 70x200cm. Lightweight yet warm, finished with fringe edges, available in classic herringbone pattern for elegant winter layering."
  },
  {
    title: "Performance Polo Shirt",
    content: "Moisture-wicking polo with four-way stretch fabric and UV protection UPF 50+. Stain-release finish and anti-odor treatment make it ideal for golf, tennis, or casual business wear."
  },
  {
    title: "Slim Fit Chino Pants",
    content: "Organic cotton chinos with stretch elastane for mobility. Garment-dyed and pre-shrunk, features chino slant pockets and welt back pockets, tailored slim fit for modern silhouette."
  },
  {
    title: "Minimalist Leather Backpack",
    content: "Full-grain leather backpack with laptop sleeve up to 15 inches. Brass hardware and YKK zippers, magnetic snap closure, internal organization pockets for urban professionals."
  },
  {
    title: "Running Compression Socks",
    content: "Graduated compression socks (20-30 mmHg) to improve circulation and reduce muscle fatigue. Nylon-spandex blend with moisture control, cushioned sole for high-impact activities."
  },
  {
    title: "Silk Sleep Mask",
    content: "Premium mulberry silk sleep mask with adjustable strap and contoured eye cups. Blocks 100% of light, hypoallergenic and gentle on skin, includes carry pouch for travel."
  },
  {
    title: "Wool Fedora Hat",
    content: "Classic fedora made from Australian wool felt with grosgrain ribbon band. Brim width 7cm, interior moisture-wicking sweatband, crushable and packable for travel wardrobes."
  },
  {
    title: "Bamboo Rayon Socks (3-Pack)",
    content: "Ultra-soft bamboo viscose socks with reinforced heel and toe. Naturally antibacterial and moisture-wicking, seamless toe closure, available in assorted neutral colors."
  },
  {
    title: "Puffer Vest Insulated",
    content: "Lightweight recycled polyester puffer vest with RDS-certified down insulation. Packs into its own chest pocket, wind-resistant and water-repellent, perfect as midlayer or outerwear."
  },
  {
    title: "Leather Belt with Automatic Buckle",
    content: "Full-grain leather belt with self-locking micro-adjustable buckle. No holes required – snaps into place at any position, trimmed width 35mm, available in black and brown."
  },
  {
    title: "Wool Cashmere Beanie",
    content: "Rib-knit beanie blended with 10% cashmere for extra softness. Double-layered for warmth, fold-up cuff with leather logo patch, one size fits most adults."
  },
  // Category: Science books, literature, engineering textbooks (14 items)
  {
    title: "Introduction to Machine Learning",
    content: "Comprehensive textbook covering supervised and unsupervised learning algorithms. Includes Python code examples, real-world case studies in finance and healthcare, and exercises with solutions."
  },
  {
    title: "Classic Fiction: The Silent Garden",
    content: "Award-winning literary novel exploring memory, loss, and family secrets across three generations. Lyrical prose and deep character development, praised by The New York Times Book Review."
  },
  {
    title: "Structural Engineering Handbook",
    content: "Reference guide for steel and concrete design per latest codes. Contains load calculation tables, seismic design principles, and worked examples for bridges and high-rise buildings."
  },
  {
    title: "Cosmology for Beginners",
    content: "Non-technical introduction to the Big Bang, dark matter, and black holes. Illustrated with NASA images, explains complex theories using everyday analogies, suitable for high school students."
  },
  {
    title: "Data Structures in C++",
    content: "Practical textbook covering linked lists, trees, graphs, and hash tables. Includes time complexity analysis and memory management tips, with hundreds of coding problems and debugging techniques."
  },
  {
    title: "Modern Poetry Anthology 2020s",
    content: "Collection of contemporary poems from 50 emerging voices. Themes include climate change, digital identity, and migration, with introductory essays on poetic forms and literary criticism."
  },
  {
    title: "Fundamentals of Robotics",
    content: "Engineering textbook on kinematics, dynamics, and control of robotic manipulators. Features MATLAB simulations, industry case studies on assembly lines, and end-of-chapter projects."
  },
  {
    title: "Short Stories by South Asian Writers",
    content: "Anthology of 20 short stories exploring culture, tradition, and modern life. Each story includes author background and discussion questions for book clubs or university courses."
  },
  {
    title: "Organic Chemistry Mechanisms",
    content: "Step-by-step guide to arrow-pushing and reaction mechanisms. Covers SN1, SN2, E1, E2, addition, and rearrangement reactions with over 300 practice problems and detailed answer keys."
  },
  {
    title: "The History of Quantum Physics",
    content: "Narrative non-fiction tracing quantum theory from Planck to modern entanglement experiments. Includes biographical sketches of key scientists and thought experiments explained in plain language."
  },
  {
    title: "Digital Signal Processing Guide",
    content: "Advanced textbook covering Fourier transforms, filter design, and spectral analysis. Includes real-time processing examples using Python and Jupyter notebooks, suitable for graduate students."
  },
  {
    title: "Bestselling Thriller: Echo Chamber",
    content: "Psychological thriller about a journalist uncovering a deepfake conspiracy. Fast-paced plot with twists, explores themes of truth and media manipulation, nominated for Edgar Award."
  },
  {
    title: "Renewable Energy Systems",
    content: "Engineering textbook on solar, wind, and hydroelectric power. Covers grid integration, storage technologies, and economic analysis, with case studies from European and Asian projects."
  },
  {
    title: "Philosophy of Mind Reader",
    content: "Essential anthology of 25 classic and contemporary texts on consciousness, AI, and free will. Includes introductions by leading philosophers and study questions for each selection."
  },
  // Category: Functional foods, health care, cosmetics (14 items)
  {
    title: "Omega-3 Fish Oil Softgels",
    content: "Molecularly distilled fish oil providing 1000mg EPA and DHA per serving. Supports heart and brain health, third-party tested for mercury and PCBs, enteric coating prevents fishy aftertaste."
  },
  {
    title: "Probiotic 50 Billion CFU",
    content: "Multi-strain probiotic with prebiotic fiber for gut health. Delayed-release capsules survive stomach acid, includes 12 clinically studied strains, dairy-free and shelf-stable formula."
  },
  {
    title: "Vitamin C with Rose Hips",
    content: "Buffered vitamin C tablets with bioflavonoids and rose hips extract. Supports immune function and collagen production, non-GMO and gluten-free, slow-release for all-day absorption."
  },
  {
    title: "Retinol Night Serum",
    content: "Encapsulated retinol 1% with hyaluronic acid and vitamin E. Reduces fine lines and uneven texture, suitable for sensitive skin, fragrance-free and cruelty-free formula."
  },
  {
    title: "Plant Protein Powder",
    content: "Vegan protein blend of pea, rice, and hemp (25g protein per scoop). Contains all essential amino acids, no artificial sweeteners, flavored with organic cacao and stevia."
  },
  {
    title: "Hyaluronic Acid Facial Moisturizer",
    content: "Lightweight gel-cream with hyaluronic acid and ceramides. Provides 72-hour hydration, strengthens skin barrier, oil-free and non-comedogenic, suitable for dry or dehydrated skin."
  },
  {
    title: "Magnesium Glycinate Capsules",
    content: "Highly absorbable chelated magnesium for muscle relaxation and sleep support. 200mg per capsule, non-laxative form, vegan and free from common allergens like soy and gluten."
  },
  {
    title: "Collagen Peptides Powder",
    content: "Hydrolyzed bovine collagen type I and III (10g per serving). Supports hair, skin, nails, and joint health, dissolves easily in hot or cold liquids, unflavored with no clumping."
  },
  {
    title: "Niacinamide Zinc Serum",
    content: "10% niacinamide with 1% PCA zinc to control sebum and reduce blemishes. Calms redness and minimizes pores, alcohol-free and vegan, suitable for acne-prone and oily skin."
  },
  {
    title: "Turmeric Curcumin Complex",
    content: "Standardized curcumin with black pepper extract for absorption. 500mg per capsule, supports joint comfort and inflammation balance, organic turmeric root used, non-GMO verified."
  },
  {
    title: "SPF 50 Mineral Sunscreen",
    content: "Zinc oxide and titanium dioxide sunscreen with antioxidant boost. Water-resistant up to 80 minutes, leaves minimal white cast, reef-safe and biodegradable packaging."
  },
  {
    title: "Melatonin Gummies 5mg",
    content: "Pectin-based melatonin gummies with chamomile and lemon balm. Supports healthy sleep cycles, no artificial colors or high fructose corn syrup, 5mg dose for occasional sleeplessness."
  },
  {
    title: "Tea Tree Oil Face Wash",
    content: "Clarifying gel cleanser with tea tree oil and salicylic acid. Helps clear acne and excess oil, pH-balanced and soap-free, packaged in recycled plastic bottle with pump dispenser."
  },
  {
    title: "CoQ10 Ubiquinone 100mg",
    content: "Fermented Coenzyme Q10 for heart health and cellular energy. Lipid-soluble formula enhanced with medium-chain triglycerides, vegan softgels, third-party tested for purity."
  },
  // Category: Smart toys, children's educational devices (14 items)
  {
    title: "Coding Robot for Kids 6+",
    content: "Programmable robot with color-coded blocks and drag-and-drop coding app. Teaches sequencing, loops, and conditionals through 20+ missions, includes obstacle detection and LED lights."
  },
  {
    title: "Interactive Globe with AR",
    content: "Illuminated smart globe that pairs with augmented reality app. Shows animal habitats, landmarks, and cultural facts, quizzes kids on geography, supports 5 languages including English."
  },
  {
    title: "Math Bingo Learning Tablet",
    content: "Kid-safe tablet with math games for addition, subtraction, multiplication, and division. Adjustable difficulty levels, rewards system with digital stickers, no internet required."
  },
  {
    title: "DIY Electronic Kit (70 Projects)",
    content: "Snap-together electronics kit with LED, buzzer, motor, and sensors. Build working circuits like a burglar alarm or FM radio, includes illustrated manual explaining voltage and current."
  },
  {
    title: "Solar System Planetarium",
    content: "Build and paint 3D solar system model with rotating arms. Includes glow-in-the-dark paint and educational fact cards about each planet, encourages interest in astronomy for ages 8+."
  },
  {
    title: "Phonics Reading Robot",
    content: "Interactive robot that teaches letter sounds and word blending. Responds to 100+ phonetic cards, features speech recognition for pronunciation practice, suitable for pre-K to grade 1."
  },
  {
    title: "Wooden Coding Puzzle Set",
    content: "Screen-free coding game with wooden blocks and command cards. Children arrange directional tiles to navigate a robot through maze challenges, teaches logical thinking and debugging."
  },
  {
    title: "Microscope for Young Scientists",
    content: "Educational microscope with 120x, 240x, and 300x magnification. Includes prepared slides, blank slides, and collection tools, LED illumination for viewing plant cells and insect parts."
  },
  {
    title: "Talking Flash Cards Set",
    content: "Electronic card reader with 224 sight words across animals, objects, and actions. Repeats pronunciation and fun sound effects, USB rechargeable, designed for ages 2-6 language development."
  },
  {
    title: "Buildable Dinosaur Skeleton Kit",
    content: "Assemble a T-Rex skeleton from 40 pieces using kid-friendly tools. Includes wooden base and explanatory booklet about fossil formation, promotes fine motor skills and patience."
  },
  {
    title: "Music Learning Keyboard",
    content: "37-key portable keyboard with light-up guide keys. Teaches notes, chords, and 10 demo songs via built-in tutorial mode, includes microphone for sing-along and recording function."
  },
  {
    title: "Magnetic Tile Construction Set",
    content: "96-piece magnetic building tiles in geometric shapes. Compatible with major brands, strong magnets for stable structures, encourages creativity and spatial reasoning for ages 3+."
  },
  {
    title: "Robot Arm STEM Kit",
    content: "Hydraulic-powered robotic arm kit with no batteries required. Uses water pressure to control gripper, elbow, and wrist movement, includes assembly instructions and physics explanations."
  },
  {
    title: "World Map Floor Puzzle 70 Pcs",
    content: "Large jigsaw puzzle of world map with country flags and animals. Each piece labeled with capital cities, finished size 32x24 inches, educational for learning geography collaboratively."
  },

  // ==================== VIETNAMESE PRODUCTS (101-200) ====================
  // Category: Thiết bị điện tử, phần cứng máy tính, linh kiện PC/Laptop (15 items)
  {
    title: "Laptop Gaming Tốc Độ Ánh Sáng V8",
    content: "Máy tính xách tay chuyên game với vi xử lý Intel Core i9 thế hệ 13 và card đồ họa RTX 4070. Màn hình 165Hz tái tạo màu sắc trung thực, hệ thống tản nhiệt buồng hơi giúp giảm nhiệt khi chơi liên tục 8 giờ."
  },
  {
    title: "Ổ Cứng SSD NVMe Siêu Tốc 2TB",
    content: "Ổ cứng thể rắn PCIe 4.0 với tốc độ đọc lên đến 7.000 MB/s. Giảm thời gian tải game và khởi động hệ điều hành, lý tưởng cho dựng video 4K và máy trạm đồ họa."
  },
  {
    title: "Màn Hình 4K UltraWide 34 inch",
    content: "Màn hình cong 34 inch độ phân giải 3440x1440, tần số quét 144Hz và hỗ trợ HDR400. Tấm nền IPS cho góc nhìn rộng, chân đế điều chỉnh độ cao phù hợp cho lập trình viên và nhà thiết kế."
  },
  {
    title: "Bàn Phím Cơ Blue Switch",
    content: "Bàn phím cơ full-size với switch xanh clicky và đèn nền RGB có thể tùy chỉnh. Chống ghosting toàn bộ phím, khung nhôm chắc chắn, tháo lắp keycap dễ dàng để vệ sinh."
  },
  {
    title: "Chuột Không Dây Siêu Nhẹ 60g",
    content: "Chuột gaming không dây trọng lượng chỉ 60 gram, cảm biến 26.000 DPI và độ trễ 1ms. Pin kéo dài 80 giờ, có thể sạc qua USB-C và dùng khi đang sạc."
  },
  {
    title: "Tản Nhiệt Nước AIO 240mm",
    content: "Bộ tản nhiệt nước all-in-one với 2 quạt ARGB 120mm và block bơm có đèn LED. Tương thích socket Intel và AMD, giảm nhiệt CPU xuống 25°C so với tản khí cao cấp."
  },
  {
    title: "RAM DDR5 32GB Tốc Độ Cao",
    content: "Thanh RAM DDR5 32GB (2x16GB) xung nhịp 5600MHz và độ trễ CL36. Tăng băng thông lên gấp đôi so với DDR4, phù hợp cho render 3D và chạy máy ảo."
  },
  {
    title: "Nguồn Máy Tính 750W Bạc",
    content: "Nguồn máy tính bán modular hiệu suất 80+ Bạc, quạt 120mm êm ái. Dây cáp bọc vải, tụ điện Nhật Bản đảm bảo ổn định cho card đồ họa cao cấp và ép xung."
  },
  {
    title: "Webcam 2K Cho Họp Trực Tuyến",
    content: "Webcam độ phân giải 2K với hai micro khử tiếng ồn. Có nắp che riêng tư và chân đế linh hoạt, tự động lấy nét và cân bằng sáng trong điều kiện ánh sáng yếu."
  },
  {
    title: "Đế Tản Nhiệt Laptop 6 Quạt",
    content: "Đế tản nhiệt bằng nhôm với 6 quạt tốc độ điều chỉnh được. Kết nối USB, đèn LED viền xanh, nâng cao góc gõ phím và giảm nhiệt độ laptop tới 15°C khi chơi game."
  },
  {
    title: "Card Mở Rộng USB 3.2 4 Cổng",
    content: "Card PCIe cấp nguồn 4 cổng USB 3.2 Type-A, tốc độ 10Gbps mỗi cổng. Phù hợp cho máy tính cũ nâng cấp kết nối, hỗ trợ cắm nóng và tương thích đa hệ điều hành."
  },
  {
    title: "Màn Hình Cảm Ứng Di Động 15.6 inch",
    content: "Màn hình phụ di động cảm ứng 10 điểm, độ phân giải Full HD. Chỉ cần một cáp USB-C duy nhất cho nguồn và tín hiệu, lý tưởng cho làm việc hai màn hình khi đi du lịch."
  },
  {
    title: "Keo Tản Nhiệt Cao Cấp",
    content: "Keo tản nhiệt dẫn nhiệt 12.5 W/mK, không dẫn điện. Giảm nhiệt độ CPU lên đến 10°C, dễ dàng bôi bằng thìa đi kèm, thích hợp cho laptop mỏng và PC hiệu năng cao."
  },
  {
    title: "Ổ Cứng Di Động 5TB",
    content: "Ổ cứng gắn ngoài 2.5 inch dung lượng 5TB, giao diện USB 3.0. Vỏ chống sốc nhẹ và sao lưu tự động có lịch trình, bảo mật bằng mã hóa phần cứng 256-bit AES."
  },
  {
    title: "Bộ Điều Khiển Chơi Game",
    content: "Tay cầm gaming không dây với motor rung đa hướng và đèn RGB. Kết nối qua Bluetooth hoặc dongle 2.4GHz, có thể thay pin AA hoặc sạc pin Lition tích hợp."
  },
  // Category: Thiết bị gia dụng thông minh, đồ dùng nhà bếp (15 items)
  {
    title: "Máy Lọc Không Khí Thông Minh",
    content: "Thiết bị lọc không khí với màng lọc HEPA H13 và than hoạt tính. Diệt khuẩn bằng tia UV-C, cảm biến bụi mịn PM2.5 hiển thị chất lượng không khí qua ứng dụng điện thoại."
  },
  {
    title: "Robot Hút Bụi Lau Nhà Tự Động",
    content: "Robot hút bụi và lau nhà hai trong một với công suất 3000Pa. Bản đồ lazer quét phòng, tự động quay về trạm sạc, lông chổi cao su chống rối tóc động vật."
  },
  {
    title: "Máy Rửa Chén Bát Mini 4 Bộ",
    content: "Máy rửa bàn để bàn cho gia đình nhỏ với 4 chương trình rửa. Sấy khô bằng hơi nóng nóng, tiêu thụ điện năng 0.4kWh mỗi lần, cửa kính trong suốt theo dõi quá trình rửa."
  },
  {
    title: "Bếp Từ Âm 3 Vùng Nấu",
    content: "Bếp từ âm tủ 3 vùng nấu tích hợp, mặt kính Schott Ceran. Công nghệ booster đun sôi nước nhanh, cảm ứng từ chuyên dụng cho nồi gang và inox dày."
  },
  {
    title: "Máy Hút Mùi Cổ Điển",
    content: "Máy hút mùi dạng chụp kính cong, động cơ 2 cấp tốc độ. Màng lọc mỡ bằng nhôm có thể tháo rời, đèn LED chiếu sáng vùng bếp, độ ồn chỉ 52dB ở tốc độ cao."
  },
  {
    title: "Nồi Chiên Không Dầu 6 Lít",
    content: "Nồi chiên không dầu dung tích lớn với 8 chế độ nấu. Công nghệ Rapid Air chiên giòn bằng ít dầu, có cửa sổ kính và đèn bên trong để quan sát thực phẩm chín."
  },
  {
    title: "Máy Pha Cà Phê Tự Động",
    content: "Máy pha espresso tích hợp máy xay hạt và tạo bọt sữa. Bảng điều khiển cảm ứng, điều chỉnh nhiệt độ và độ đậm nhạt, thùng nước 1.5 lít có thể tháo rời."
  },
  {
    title: "Tủ Lạnh Inverter 350 Lít",
    content: "Tủ lạnh ngăn đá dưới công nghệ inverter tiết kiệm điện. Kháng khuẩn bằng ion bạc, ngăn rau quả tươi lâu nhờ hệ thống làm mát ẩm, có vòi nước lọc bên ngoài."
  },
  {
    title: "Máy Sấy Quần Áo Bơm Nhiệt",
    content: "Máy sấy quần áo dung tích 8kg, công nghệ bơm nhiệt tiết kiệm 50% điện. Cảm biến độ ẩm tự động dừng khi khô, chống nhăn trong 120 phút sau chu trình."
  },
  {
    title: "Cốc Giữ Nhiệt Thông Minh",
    content: "Cốc giữ nhiệt bằng thép không gỉ 12 giờ nóng lạnh, có nắp chống tràn. Màn hình LED hiển thị nhiệt độ nước bên trong, sạc pin qua đế cảm ứng chống nước."
  },
  {
    title: "Máy Làm Sữa Hạt Đa Năng",
    content: "Máy làm sữa hạt với lưỡi dao titan và nồi nấu chống dính. 10 chức năng: sữa đậu nành, cháo, súp, sinh tố, hoạt động êm dưới 65dB, bảo hành động cơ 5 năm."
  },
  {
    title: "Bộ Dao Nhà Bếp 7 Món",
    content: "Bộ dao inox hợp kim cao cấp, được tôi cứng ở 58HRC. Chuôi gỗ tích hợp khay đựng từ tính, gồm dao đầu bếp, dao thái, và dao gọt hoa quả trong hộp gỗ thông minh."
  },
  {
    title: "Máy Đánh Trứng Cầm Tay",
    content: "Máy đánh trứng 200W với 5 tốc độ và nút turbo. Que đánh và móc nhồi bằng thép không gỉ, có thể tháo rời để rửa bằng máy rửa bát, kèm cốc đựng kèm nắp."
  },
  {
    title: "Bình Lọc Nước Gia Đình 7 Lít",
    content: "Bình lọc nước để bàn dung tích lớn, lõi than hoạt tính và kháng khuẩn. Làm mềm nước, giảm vôi và clo, vòi xoay 360 độ, thay lõi sau 2 tháng dùng cho 4 người."
  },
  {
    title: "Cân Bếp Thông Minh 5kg",
    content: "Cân nhà bếp điện tử chính xác đến 1 gram, kết nối app để ghi chép dinh dưỡng. Màn hình cảm ứng, tự động tắt sau 2 phút, mặt kính chống xước và chịu nhiệt."
  },
  // Category: Đồ thể thao, dã ngoại, phương tiện di chuyển đô thị (14 items)
  {
    title: "Xe Đạp Điện Gập Nhỏ Gọn",
    content: "Xe đạp điện trợ lực với khung nhôm gập chỉ trong 5 giây. Pin lithium 36V tầm hoạt động 60km, mô tơ 250W leo dốc 15 độ, có giỏ hàng và chắn bùn đi mưa."
  },
  {
    title: "Ba Lô Leo Núi 55 Lít",
    content: "Ba lô dã ngoại chuyên dụng chống nước cấp 8000mm. Lưng thoáng khí, đai hông đệm, tích hợp áo mưa và túi đựng túi ngủ phía dưới, trọng lượng rỗng 1.2kg."
  },
  {
    title: "Vợt Cầu Lông Carbon",
    content: "Vợt cầu lông cao cấp khung carbon và lõi thép. Cân bằng nặng đầu tạo uy lực đập cầu, độ căng dây tối đa 30lbs, bao vợt đi kèm 2 lớp chống va đập."
  },
  {
    title: "Đèn Trán Chạy Bộ 400 Lumen",
    content: "Đèn đeo đầu với 3 chế độ sáng, chiếu xa 100 mét. Chống nước IPX6 và pin sạc USB 8 giờ, dây đai điều chỉnh vừa mũ bảo hiểm, lý tưởng cho chạy đêm và leo núi."
  },
  {
    title: "Ván Trượt Điện Thông Minh",
    content: "Ván trượt điện điều khiển từ xa, tốc độ tối đa 25 km/h, phạm vi 12km. Đèn LED dưới gầm và bánh xe cao su 8.5 inch hấp thụ rung tốt, có chế độ tập cho người mới."
  },
  {
    title: "Áo Khoác Chạy Bộ Phản Quang",
    content: "Áo gió siêu nhẹ 120 gram có họa tiết phản quang khắp thân. Chống gió và thấm hút mồ hôi, có thể gấp gọn vào túi đeo eo, phù hợp tập luyện vào sáng sớm hoặc chiều tối."
  },
  {
    title: "Thảm Tập Yoga 8mm",
    content: "Thảm yoga cao su tự nhiên, bề mặt nổi hạt chống trượt ngay cả khi đổ mồ hôi. Đàn hồi tốt bảo vệ khớp, kèm dây đeo và khăn lau, phân hủy sinh học sau 5 năm sử dụng."
  },
  {
    title: "Đồng Hồ GPS Đa Môn",
    content: "Đồng hồ thể thao theo dõi nhịp tim, GPS, và quãng đường bơi lội. Tự động nhận diện 10 môn thể thao, sạc pin trong 2 giờ dùng được 7 ngày, có chế độ tiết kiệm pin."
  },
  {
    title: "Ghế Xếp Du Lịch Siêu Nhẹ",
    content: "Ghế gấp bằng khung nhôm chịu tải 120kg, trọng lượng 0.9kg. Mặt lưới thoáng khí, túi đựng gắn liền, mở ra chỉ 5 giây, thích hợp cho cắm trại hoặc xem hòa nhạc ngoài trời."
  },
  {
    title: "Áo Phao Cứu Hộ Bơi Lội",
    content: "Áo phao bơi tự động bung khi gặp nước, nổi 165N theo chuẩn CE. Dây đai điều chỉnh 4 điểm, có còi và đèn SOS, kích thước phù hợp người lớn từ 40 đến 130 kg."
  },
  {
    title: "Vòi Nước Lọc Di Động",
    content: "Bình lọc nước cầm tay công nghệ sợi rỗng và than hoạt tính. Loại bỏ 99.9% vi khuẩn, ký sinh trùng, lọc được 2000 lít, vòi gập tiện lợi cho trekking và du lịch bụi."
  },
  {
    title: "Bộ Lốp Xe Đạp Chống Đinh",
    content: "Lốp xe đạp địa hình 27.5 inch có lớp keo tự vá khi đinh đâm. Gai dạng ram giảm lực cản lăn, áp suất tối đa 65psi, phù hợp đạp xe đường rừng và đá sỏi."
  },
  {
    title: "Bình Nước Giữ Nhiệt 1 Lít",
    content: "Bình nước thép không gỉ giữ lạnh 24h, nóng 12h. Nắp gài chống tràn, quai đeo có thể tháo, miệng rộng 5cm bỏ đá viên dễ dàng, in logo không phai dưới nước biển."
  },
  {
    title: "Dây Kháng Lực Cao Su 5 Mức",
    content: "Bộ 5 dây kháng lực từ 5kg đến 35kg có thể tháo rời. Tay cầm bọc mút chống trơn, kèm túi đựng và sách hướng dẫn 20 bài tập tại nhà, dễ dàng mang theo du lịch."
  },
  // Category: Thời trang, quần áo, giày dép, phụ kiện cao cấp (14 items)
  {
    title: "Sơ Mi Linen Tay Dài",
    content: "Sơ mi nam chất liệu linen cao cấp pha cotton 30% tạo độ mềm. Phom dáng regular, cổ đức kiểu Ý, nút xà cừ tự nhiên, thoáng mát phù hợp mùa hè nhiệt đới."
  },
  {
    title: "Quần Tây Âu Cao Cấp",
    content: "Quần tây nam suông thẳng, chất vải len pha polyester chống nhăn. Cạp quần có móc kép, túi chéo đựng đồ tiện lợi, nhiều màu trung tính cho văn phòng và tiệc cưới."
  },
  {
    title: "Áo Thun Organic Cotton",
    content: "Áo thun nữ cổ tròn từ bông hữu cơ 100% được chứng nhận GOTS. Mực in nước không chứa hóa chất độc hại, đường may bọc viền chắc chắn, thiết kế oversize phong cách tối giản."
  },
  {
    title: "Giày Thể Thao Chạy Bộ",
    content: "Giày chạy bộ đàn hồi với đế midsole bằng foam siêu nhẹ. Mặt lưới kỹ thuật thoáng khí 360 độ, đệm gót 9mm giảm chấn động, đế cao su chống mòn cho 500 km sử dụng."
  },
  {
    title: "Túi Đeo Chéo Da Thật",
    content: "Túi da bò full-grain handmade, khóa cài nam châm từ tính. Quai đeo điều chỉnh dài 150cm, lót vải nỉ chống xước, có ngăn khóa kéo ẩn phía sau."
  },
  {
    title: "Áo Khoác Denim Nhật Bản",
    content: "Áo khoác jeans từ vải denim selvedge 12oz dệt tại Okayama. Ủi rửa đá tạo hiệu ứng màu tự nhiên, đinh tán đồng, phù hợp phong cách streetwear và công sở trẻ."
  },
  {
    title: "Chân Váy Xếp Ly Dài",
    content: "Chân váy nữ dài qua gối, xếp ly đều bằng công nghệ ép nhiệt. Co giãn 4 chiều, có lót quần short bên trong, chất vải linen pha tencel mềm mượt không nhăn."
  },
  {
    title: "Mũ Lưỡi Trai Vải Tweed",
    content: "Mũ lưỡi trai phong cách Anh từ vải tweed len pha cotton. Logo thêu tay, vành cứng chống gió, lót trong bằng lụa chống thấm mồ hôi, phù hợp mùa thu đông."
  },
  {
    title: "Dây Nịt Da Cá Sấu",
    content: "Dây nịt cao cấp làm từ da cá sấu nuôi tự nhiên (CITES đăng ký). Khóa mạ vàng 18K, lót da bê, khắc tên tùy chọn, đóng trong hộp gỗ sang trọng."
  },
  {
    title: "Áo Len Cashmere Mỏng",
    content: "Áo len nữ cổ lọ, sợi cashmere grade A từ Mông Cổ. Dệt kim gauge 15 mịn màng, không gây ngứa, có thể giặt máy ở chế độ len, màu pastel nhẹ nhàng."
  },
  {
    title: "Giày Cao Gót Kính",
    content: "Giày cao gót 7cm với phần gót trong suốt bằng acrylic chịu lực. Mũi nhọn, mặt giày da lộn và khóa mắt cá, đệm silicon dưới bàn chân cho cảm giác êm khi đi tiệc."
  },
  {
    title: "Bộ Trang Sức Bạc Ý",
    content: "Bộ dây chuyền và khuyên tai bạc 925 mạ vàng hồng 1 micron. Đá CZ cắt round brilliant, thiết kế hình giọt nước, chống oxy hóa 3 lớp, tặng kèm khăn lau chuyên dụng."
  },
  {
    title: "Quần Short Vải Lanh",
    content: "Quần short nam màu be, chất liệu lanh 100% không pha. Cạp có thun co giãn hai bên, hai túi chéo sâu, độ dài trên đầu gối 5cm, thoáng gió đi biển hoặc dã ngoại."
  },
  {
    title: "Áo Gile Lông Cừu",
    content: "Áo vest không tay lót lông cừu New Zealand, vỏ ngoài vải cotton pha sợi kỹ thuật. Khóa kéo YKK, túi hông có nắp, giữ ấm tốt mà không cộm khi mặc áo khoác ngoài."
  },
  // Category: Sách khoa học, văn học, giáo trình kỹ thuật (14 items)
  {
    title: "Giáo Trình Học Máy Cơ Bản",
    content: "Sách nhập môn machine learning với Python và scikit-learn. Bao gồm hồi quy, phân loại, clustering, và mạng nơ-ron 3 tầng, bài tập thực hành kèm giải thích lời giải chi tiết."
  },
  {
    title: "Tiểu Thuyết Ngôn Tình - Hương Mùa Hạ",
    content: "Truyện dài 300 trang về tình yêu và khát vọng của thế hệ 9x. Giải thưởng Văn học trẻ 2023, ngôn ngữ giàu hình ảnh, đề cập chủ đề gia đình và sự tha thứ."
  },
  {
    title: "Kỹ Thuật Phần Mềm Tinh Gọn",
    content: "Sách hướng dẫn thực hành Agile và Scrum cho dự án phần mềm. Các mẫu tài liệu user story, backlog grooming, và metric đánh giá năng suất, có case study từ công ty công nghệ lớn."
  },
  {
    title: "Truyện Ngắn Nguyễn Huy Thiệp",
    content: "Tuyển tập 20 truyện ngắn đặc sắc của nhà văn nổi tiếng. Phân tích chiều sâu tâm lý nhân vật và phê phán xã hội đương thời, có lời bình của nhiều nhà nghiên cứu văn học."
  },
  {
    title: "Cơ Học Lưu Chất Ứng Dụng",
    content: "Giáo trình đại học chuyên ngành cơ khí và xây dựng. Lý thuyết về dòng chảy, áp suất và lực nâng, kèm bảng tra cứu hệ số nhám và bài tập thiết kế kênh dẫn."
  },
  {
    title: "Vũ Trụ Trong Vỏ Hạt Dẻ",
    content: "Sách khoa học phổ thông của Stephen Hawking về vũ trụ học lượng tử. Giải thích lỗ đen và nguồn gốc vũ trụ bằng phép loại suy dễ hiểu, tranh minh họa màu sắc nét."
  },
  {
    title: "Cấu Trúc Dữ Liệu Và Giải Thuật",
    content: "Sách kinh điển bằng tiếng Việt, phù hợp cho tự học lập trình. Cung cấp mã giả và độ phức tạp Big-O cho từng cấu trúc, có bài tập từ dễ đến khó và đáp án."
  },
  {
    title: "Thơ Đường Luật Tuyển Chọn",
    content: "Tập thơ Đường được bình giảng bởi giáo sư Nguyễn Khắc Phi. Giải nghĩa từ Hán-Việt, phân tích nghệ thuật đối và niêm, sách bìa cứng có hình minh họa tranh thủy mặc."
  },
  {
    title: "Điện Tử Công Suất Cơ Bản",
    content: "Giáo trình về chỉnh lưu, nghịch lưu và băm xung. Có mô phỏng trên Matlab/Simulink, bài tập thiết kế bộ nguồn cho xe điện, phù hợp sinh viên năm 3 ngành Điện."
  },
  {
    title: "Lịch Sử Triết Học Phương Đông",
    content: "Sách khái lược tư tưởng Nho gia, Phật giáo và Ấn Độ giáo. So sánh triết lý nhân sinh và vũ trụ quan, bảng niên đại và danh nhân, có phần câu hỏi ôn tập cuối chương."
  },
  {
    title: "Hệ Thống Nhúng Thời Gian Thực",
    content: "Sách chuyên sâu về RTOS, lập trình vi điều khiển ARM Cortex. Ví dụ về điều khiển động cơ và thu thập dữ liệu cảm biến, kèm mã nguồn C cho board STM32."
  },
  {
    title: "Truyện Dài Không Gia Đình",
    content: "Bản dịch mới của tác phẩm kinh điển Pháp. Minh họa gần 50 bức vẽ đen trắng, phần chú giải địa danh và thuật ngữ, thích hợp cho thiếu nhi và người lớn."
  },
  {
    title: "Nhập Môn Hóa Học Hữu Cơ",
    content: "Sách giáo khoa dành cho học sinh lớp 11 chuyên Hóa. 300 bài tập từ cơ bản đến nâng cao, bảng màu nhóm chức và phản ứng đặc trưng, đáp án chi tiết cuối sách."
  },
  {
    title: "Văn Học Dân Gian Việt Nam",
    content: "Tuyển tập truyện cổ tích, ca dao và tục ngữ ba miền. Phân tích giá trị văn hóa và bài học đạo đức, in ấn trên giấy mỹ thuật, có hình vẽ minh họa phong cách Đông Hồ."
  },
  // Category: Thực phẩm chức năng, đồ chăm sóc sức khỏe, mỹ phẩm (14 items)
  {
    title: "Tinh Chất Retinol 0.5%",
    content: "Serum chống lão hóa với retinol ổn định và niacinamide. Làm đầy nếp nhăn và cải thiện độ đàn hồi, không gây kích ứng, đã kiểm nghiệm trên da nhạy cảm."
  },
  {
    title: "Kem Chống Nắng Vật Lý SPF50",
    content: "Kem chống nắng khoáng với kẽm oxit và titan dioxit. Không thấm vào máu, chống nước 80 phút, an toàn cho bà bầu và trẻ em, kết cấu mỏng nhẹ."
  },
  {
    title: "Collagen Peptide Thủy Phân",
    content: "Bột collagen type I và III từ cá biển sâu, phân tử lượng 2000 Dalton. Hấp thu nhanh gấp 3 lần collagen thông thường, có thêm vitamin C và axit hyaluronic."
  },
  {
    title: "Men Vi Sống 30 Tỷ CFU",
    content: "Men tiêu hóa đa chủng với 15 loại lợi khuẩn, công nghệ bảo vệ kép. Tăng cường tiêu hóa lactose và giảm đầy hơi, dạng viên nang tan trong ruột."
  },
  {
    title: "Dầu Gội Kích Thích Mọc Tóc",
    content: "Dầu gội thảo dược có chứa caffeine và biotin. Làm sạch da đầu và giảm rụng tóc, không paraben và sulfate, phù hợp cho tóc mỏng và yếu."
  },
  {
    title: "Viên Uống Bổ Sung Omega-3",
    content: "Dầu cá nhập khẩu từ Na Uy, hàm lượng EPA 550mg và DHA 250mg. Chứng nhận IFOS về độ tinh khiết, vị chanh tự nhiên không tanh, uống vào buổi sáng cùng bữa ăn."
  },
  {
    title: "Sữa Rửa Mặt Tràm Trà",
    content: "Sữa rửa mặt dạng gel dịu nhẹ với chiết xuất tràm trà Úc. Kiểm soát dầu nhờn và kháng viêm mụn, pH 5.5, có thể dùng cho da dầu mụn và da hỗn hợp."
  },
  {
    title: "Vitamin D3 1000IU",
    content: "Viên nang mềm vitamin D3 từ lanolin cừu, dầu ô liu hữu cơ. Tăng cường hấp thu canxi và miễn dịch, dễ nuốt và không dư thừa khi dùng liều thấp hàng ngày."
  },
  {
    title: "Kem Dưỡng Ẩm Cấp Nước",
    content: "Kem dạng gel trong suốt chứa nha đam và allantoin. Không dầu, thẩm thấu nhanh, cấp ẩm trong 48 giờ, thích hợp cho da dầu và da mụn dưới lớp trang điểm."
  },
  {
    title: "Tinh Bột Nghệ Nano Curcumin",
    content: "Curcumin hạt nano kích thước 50nm, sinh khả dụng gấp 10 lần. Hỗ trợ kháng viêm, bảo vệ gan, không màu vàng khó tẩy, viên bao cứng tiện bảo quản."
  },
  {
    title: "Sáp Thơm Nến Trầm Hương",
    content: "Nến thơm từ sáp đậu nành và tinh dầu trầm hương tự nhiên. Đốt sạch không khói đen, thời gian cháy 50 giờ, mùi ấm áp giảm căng thẳng và cải thiện giấc ngủ."
  },
  {
    title: "Bột Sắn Dây Ăn Liền",
    content: "Bột sắn dây nguyên chất 100% từ Nghệ An, không chất bảo quản. Hòa tan với nước nóng thành chè mát gan, giải nhiệt và tốt cho dạ dày, đóng gói túi 500g."
  },
  {
    title: "Kem Dưỡng Mắt Caffeine",
    content: "Kem mắt dạng tuýp có caffeine và peptide. Giảm bọng mắt và quầng thâm sau 4 tuần, đầu bôi massage bằng kim loại, không gây kích ứng cho mắt nhạy cảm."
  },
  {
    title: "Viên Ngủ Ngon Melatonin",
    content: "Thực phẩm bảo vệ sức khỏe với 3mg melatonin và chiết xuất hoa cúc. Hỗ trợ điều hòa giấc ngủ khi bị jet lag hoặc mất ngủ nhẹ, dạng viên ngậm vị bạc hà dễ sử dụng."
  },
  // Category: Đồ chơi thông minh, thiết bị giáo dục trẻ em (14 items)
  {
    title: "Robot Lập Trình Cho Bé 4+",
    content: "Robot giáo dục với thẻ lệnh màu sắc và ứng dụng kéo thả. Dạy tư duy tuần tự, vòng lặp và sự kiện, có nhạc và đèn LED, pin sạc qua USB dùng được 5 giờ."
  },
  {
    title: "Bảng Điện Tử Vẽ Phát Sáng",
    content: "Bảng vẽ LCD 10 inch áp điện, không bụi phấn và mực. Nút xóa một chạm, khóa màn hình chống xóa nhầm, có bút stylus đi kèm, siêu nhẹ 200g cho bé mang đi chơi."
  },
  {
    title: "Bộ Xếp Hình Nam Châm 3D",
    content: "Bộ 100 miếng hình học nam châm mạnh, màu sắc cầu vồng. Xây dựng được cầu, tháp, ô tô, kích thước lớn an toàn cho trẻ 3 tuổi, kèm sách hướng dẫn mẫu."
  },
  {
    title: "Kính Lúp Kỹ Thuật Số",
    content: "Kính lúp cầm tay độ phóng đại 200x, có đèn LED và màn hình LCD. Chụp ảnh và quay video khám phá cánh bướm, vân lá, hỗ trợ thẻ nhớ microSD, pin sạc."
  },
  {
    title: "Bộ Thí Nghiệm Hóa Học Nhí",
    content: "Bộ 30 thí nghiệm an toàn với baking soda, giấy quỳ, và ống nghiệm nhựa. Sách hướng dẫn giải thích phản ứng axit-bazơ, tạo núi lửa, trộn màu, cho trẻ từ 8 tuổi."
  },
  {
    title: "Máy Tính Bảng Học Chữ Cái",
    content: "Máy tính bảng giáo dục cho bé 2-5 tuổi, có 50 thẻ học chữ và số. Phát âm giọng chuẩn, chế độ vẽ và chơi nhạc, màn hình LCD bảo vệ mắt, tự động tắt khi không dùng."
  },
  {
    title: "Bộ Lắp Ráp Mô Hình Năng Lượng",
    content: "Kit lắp ráp xe ô tô chạy bằng pin mặt trời và phong điện. 60 chi tiết có thể lắp 6 mô hình khác nhau, giải thích nguyên lý chuyển đổi năng lượng, dành cho 10+."
  },
  {
    title: "Bảng Tính Nhẩm Thông Minh",
    content: "Bảng học toán với cảm biến nhận diện thẻ số và phép tính. Phát ra âm thanh khen thưởng khi trả lời đúng, có 5 cấp độ từ cộng trừ đến nhân chia cơ bản."
  },
  {
    title: "Đàn Organ Điện Tử 25 Phím",
    content: "Đàn organ mini với 25 phím cảm ứng, 8 nhạc cụ và 10 bài hát mẫu. Có micro hát, điều chỉnh âm lượng, dạy đàn bằng đèn led trên phím, nguồn pin AA hoặc USB."
  },
  {
    title: "Bộ Thẻ Flashcard Song Ngữ",
    content: "Bộ 200 thẻ Anh-Việt về động vật, rau củ, và đồ vật. Mỗi thẻ có hình ảnh thực tế và mã QR quét nghe phát âm, in trên giấy cứng chống xé, bo góc tròn an toàn."
  },
  {
    title: "Rô Bốt Biết Nói Cho Bé",
    content: "Rô bốt tương tác thông minh, trả lời câu hỏi và kể chuyện cổ tích. Nhận diện giọng nói và cử chỉ, có thể nhảy theo nhạc, sạc không dây, pin dùng 6 giờ."
  },
  {
    title: "Bộ Mô Hình Hệ Mặt Trời",
    content: "Mô hình 3D quay tay, hành tinh có màu sơn dạ quang. Kích thước tỉ lệ tương đối, kèm sách 32 trang về hành tinh và tàu vũ trụ, trẻ 6+ tự lắp ráp."
  },
  {
    title: "Bút Cảm Ứng Đọc Sách Nói",
    content: "Bút đọc điện tử chạm vào sách in đặc biệt sẽ phát âm thanh. Chứa 10 câu chuyện song ngữ, ghi âm giọng bố mẹ, dung lượng 8GB, sạc USB."
  },
  {
    title: "Xe Lửa Đồ Chơi Lắp Ghép",
    content: "Bộ đường ray 50 miếng và đầu máy chạy pin có còi đèn. Trẻ tự thiết kế đường đi, có cầu và hầm, phát triển tư duy không gian và kỹ năng lắp ráp, an toàn nhựa ABS."
  }
];

// Hàm gọi API đến LM Studio để lấy Vector Embedding 768 chiều
async function getEmbeddingFromLMStudio(text) {
  // Quy tắc bắt buộc của Nomic v1.5: Thêm tiền tố 'search_document: ' khi lưu dữ liệu nền vào kho
  const formattedInput = `search_document: ${text}`;

  const response = await fetch("http://localhost:1234/v1/embeddings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "text-embedding-nomic-embed-text-v1.5",
      input: formattedInput,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LM Studio API Error: ${errorText}`);
  }

  const result = await response.json();
  return result.data[0].embedding; // Mảng số thực chứa đúng 768 phần tử
}

async function seed() {
  console.log("Connecting to LM Studio Local Server (http://localhost:1234)...");
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("Generating 768-dimensional vectors and inserting into Supabase...");

  for (const doc of documents) {
    try {
      // Gộp tiêu đề và nội dung để tối ưu hóa trường thông tin ngữ nghĩa cho mô hình AI
      const textToEmbed = `${doc.title}. ${doc.content}`;

      // Gọi LM Studio sinh vector
      const embedding = await getEmbeddingFromLMStudio(textToEmbed);

      // Thực hiện INSERT vào bảng documents dữ liệu thô kèm mảng vector 768d
      const { error } = await supabase.from('documents').insert({
        title: doc.title,
        content: doc.content,
        embedding: embedding
      });

      if (error) {
        console.error(`❌ Failed to insert ${doc.title}:`, error.message);
      } else {
        console.log(`✅ Inserted document: ${doc.title} (Vector size: ${embedding.length})`);
      }
    } catch (err) {
      console.error(`❌ Error processing document "${doc.title}":`, err.message);
    }
  }

  console.log("Seeding complete!");
}

seed().catch(console.error);