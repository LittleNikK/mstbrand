import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

import { ensureIndexes } from '../lib/db/indexes';

export async function seedDatabase(customUri?: string, customDb?: string) {
  const uri = customUri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
  const dbName = customDb || process.env.MONGODB_DB_NAME || 'mst_store';

  console.log('--- MST STORE DATABASE SEED ---');
  console.log(`Connecting to: ${uri}/${dbName}`);

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  // Clear existing collections safely
  console.log('Clearing existing records...');
  await Promise.all([
    db.collection('users').deleteMany({}),
    db.collection('products').deleteMany({}),
    db.collection('collections').deleteMany({}),
    db.collection('orders').deleteMany({}),
    db.collection('discount_codes').deleteMany({}),
    db.collection('inventory_movements').deleteMany({}),
    db.collection('newsletter_subscribers').deleteMany({}),
    db.collection('reviews').deleteMany({}),
    db.collection('audit_logs').deleteMany({}),
  ]);

  const now = new Date().toISOString();

  // 1. SEED USERS
  console.log('Seeding administrative & customer accounts...');
  const adminPasswordHash = await bcrypt.hash('Admin@123456', 10);
  const customerPasswordHash = await bcrypt.hash('Customer@123456', 10);

  const adminId = new ObjectId();
  const customerId = new ObjectId();

  await db.collection('users').insertMany([
    {
      _id: adminId,
      name: 'Aditi Sharma (Merch Lead)',
      email: 'admin@mststore.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      phone: '+91 98200 12345',
      addresses: [],
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: customerId,
      name: 'Rohan Mehta',
      email: 'customer@mststore.com',
      passwordHash: customerPasswordHash,
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      phone: '+91 98111 67890',
      addresses: [
        {
          id: 'addr_1',
          isDefault: true,
          fullName: 'Rohan Mehta',
          phone: '+91 98111 67890',
          street: 'Flat 402, Cyber Heights, Bandra Kurla Complex',
          apartment: 'Tower B',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400051',
          country: 'India',
        },
      ],
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // 2. SEED DROP COLLECTIONS
  console.log('Seeding official MST merchandise collections...');
  const colApparelId = new ObjectId();
  const colTechId = new ObjectId();
  const colDrinkwareId = new ObjectId();
  const colGoodiesId = new ObjectId();
  const colGenesisId = new ObjectId();

  await db.collection('collections').insertMany([
    {
      _id: colApparelId,
      name: 'Core Builder Apparel',
      slug: 'core-builder-apparel',
      description: 'Official heavyweight hoodies, developer graphic tees, and structured caps designed for high-performance builders.',
      imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=80',
      featured: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: colTechId,
      name: 'Tech Gear & Desk Setup',
      slug: 'tech-desk-setup',
      description: 'Ultra-wide speed desk mats, padded water-resistant laptop sleeves, and precision workstation accessories.',
      imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1200&q=80',
      featured: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: colDrinkwareId,
      name: 'Drinkware & Hydration',
      slug: 'drinkware-hydration',
      description: 'Vacuum-insulated stainless steel tumblers and high-density ceramic mugs crafted for late-night code sprints.',
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80',
      featured: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: colGoodiesId,
      name: 'Goodies & Ecosystem Kits',
      slug: 'goodies-ecosystem-kits',
      description: 'Holographic die-cut stickers, enamel builder pins, keychains, and developer conference accessories.',
      imageUrl: 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?auto=format&fit=crop&w=1200&q=80',
      featured: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: colGenesisId,
      name: 'Limited Genesis Drops',
      slug: 'limited-genesis-drops',
      description: 'Numbered, limited-run commemorative drops celebrating MST Blockchain mainnet launches, hackathons, and validator milestones.',
      imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80',
      featured: false,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // 3. SEED 20 DIVERSE MST MERCHANDISE PRODUCTS
  console.log('Seeding curated MST Blockchain merchandise products...');
  const products = [
    {
      name: 'MST Genesis Builder Heavyweight Hoodie',
      slug: 'mst-genesis-builder-heavyweight-hoodie',
      sku: 'MST-HOOD-GEN-01',
      description: 'Engineered from ultra-dense 420 GSM French terry cotton. Features an embroidered high-density MST red geometric insignia on the left chest, a double-layered hood with metal aglets, and a hidden zip-pocket for hardware wallets. Tailored for comfort during marathon build sessions.',
      category: 'apparel',
      brand: 'MST Blockchain',
      sellingPrice: 3499,
      referencePrice: 4299,
      costPrice: 1650,
      stock: 75,
      status: 'published',
      isFeatured: true,
      isLimitedEdition: false,
      collectionIds: [colApparelId.toString(), colGenesisId.toString()],
      tags: ['hoodie', 'apparel', 'builder', 'winter', 'heavyweight'],
      colors: ['Obsidian Black', 'Heather Charcoal'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      variants: [
        { id: 'v_hood_s_blk', sku: 'MST-HOOD-BLK-S', name: 'Obsidian Black / S', size: 'S', color: 'Obsidian Black', colorHex: '#0A0A0A', stock: 15 },
        { id: 'v_hood_m_blk', sku: 'MST-HOOD-BLK-M', name: 'Obsidian Black / M', size: 'M', color: 'Obsidian Black', colorHex: '#0A0A0A', stock: 25 },
        { id: 'v_hood_l_blk', sku: 'MST-HOOD-BLK-L', name: 'Obsidian Black / L', size: 'L', color: 'Obsidian Black', colorHex: '#0A0A0A', stock: 20 },
        { id: 'v_hood_xl_blk', sku: 'MST-HOOD-BLK-XL', name: 'Obsidian Black / XL', size: 'XL', color: 'Obsidian Black', colorHex: '#0A0A0A', stock: 15 },
      ],
      specifications: {
        material: '420 GSM 100% Combed Organic French Terry Cotton',
        weight: '850 grams',
        careInstructions: 'Machine wash cold inside out, tumble dry low or hang dry',
        origin: 'Crafted in Tirupur, India',
        features: ['Double-layer drawstring hood', 'Concealed security wallet pouch', 'Ribbed cuffs & hem', 'Fade-resistant reactive dye'],
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Genesis Builder Heavyweight Hoodie Front View',
          isPrimary: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Genesis Builder Hoodie Fabric & Embroidery Detail',
          isPrimary: false,
        },
      ],
    },
    {
      name: 'MST Layer 1 "4000+ TPS" Developer Tee',
      slug: 'mst-layer1-4000tps-developer-tee',
      sku: 'MST-TEE-TPS-02',
      description: 'A heavyweight 240 GSM combed cotton tee celebrating MST’s high-throughput Layer 1 architecture. Screen-printed with precision micro-type featuring EVM bytecode motifs and consensus latency benchmarks. Pre-shrunk for an enduring boxy silhouette.',
      category: 'apparel',
      brand: 'MST Blockchain',
      sellingPrice: 1299,
      referencePrice: 1699,
      costPrice: 520,
      stock: 120,
      status: 'published',
      isFeatured: true,
      isLimitedEdition: false,
      collectionIds: [colApparelId.toString()],
      tags: ['t-shirt', 'graphic tee', 'developer', 'evm', '4000tps'],
      colors: ['Obsidian Black', 'Pure White'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      variants: [
        { id: 'v_tee_s_blk', sku: 'MST-TEE-TPS-S', name: 'Obsidian Black / S', size: 'S', color: 'Obsidian Black', colorHex: '#0A0A0A', stock: 30 },
        { id: 'v_tee_m_blk', sku: 'MST-TEE-TPS-M', name: 'Obsidian Black / M', size: 'M', color: 'Obsidian Black', colorHex: '#0A0A0A', stock: 40 },
        { id: 'v_tee_l_blk', sku: 'MST-TEE-TPS-L', name: 'Obsidian Black / L', size: 'L', color: 'Obsidian Black', colorHex: '#0A0A0A', stock: 30 },
        { id: 'v_tee_xl_blk', sku: 'MST-TEE-TPS-XL', name: 'Obsidian Black / XL', size: 'XL', color: 'Obsidian Black', colorHex: '#0A0A0A', stock: 20 },
      ],
      specifications: {
        material: '240 GSM 100% Ring-Spun Compact Combed Cotton',
        weight: '260 grams',
        careInstructions: 'Machine wash gentle, iron inside-out avoiding print',
        origin: 'India',
        features: ['Boxy contemporary cut', 'High-density silk-screen graphic', 'Reinforced collar band'],
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Layer 1 Developer Graphic Tee Front',
          isPrimary: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Developer Tee Print Detail',
          isPrimary: false,
        },
      ],
    },
    {
      name: 'MST Signature Embroidered Dad Cap',
      slug: 'mst-signature-embroidered-dad-cap',
      sku: 'MST-CAP-SIG-03',
      description: 'Classic 6-panel unstructured dad hat crafted from 100% washed cotton twill. Features 3D puff embroidery of the iconic MST crimson node icon on the crown, and "FAST · SECURE · BUILT TO SCALE" etched on the antique brass slide clasp.',
      category: 'headwear',
      brand: 'MST Blockchain',
      sellingPrice: 999,
      referencePrice: 1299,
      costPrice: 380,
      stock: 90,
      status: 'published',
      isFeatured: true,
      isLimitedEdition: false,
      collectionIds: [colApparelId.toString()],
      tags: ['cap', 'hat', 'accessories', 'headwear'],
      colors: ['Midnight Black', 'Slate Grey'],
      sizes: ['One Size (Adjustable)'],
      variants: [
        { id: 'v_cap_os_blk', sku: 'MST-CAP-BLK', name: 'Midnight Black / OS', size: 'OS', color: 'Midnight Black', colorHex: '#111111', stock: 50 },
        { id: 'v_cap_os_gry', sku: 'MST-CAP-GRY', name: 'Slate Grey / OS', size: 'OS', color: 'Slate Grey', colorHex: '#4A4A4A', stock: 40 },
      ],
      specifications: {
        material: '100% Washed Heavyweight Cotton Twill',
        weight: '110 grams',
        dimensions: 'Adjustable circumference (54cm - 62cm)',
        careInstructions: 'Spot clean with damp cloth',
        origin: 'India',
        features: ['Curved visor with 6-row stitching', 'Antique brass buckle strap', 'Breathable embroidered eyelets'],
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Signature Embroidered Dad Cap Black',
          isPrimary: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Cap Embroidery and Clasp Close Up',
          isPrimary: false,
        },
      ],
    },
    {
      name: 'MST Double-Wall Insulated Tumbler 750ml',
      slug: 'mst-insulated-tumbler-750ml',
      sku: 'MST-DRK-TUMB-04',
      description: 'Keep your brew piping hot for 12 hours or ice-cold for 24 hours. Constructed from food-grade 18/8 stainless steel with a tough matte black powder-coat finish and precision laser-etched MST Blockchain branding. Leak-proof sip lid included.',
      category: 'drinkware',
      brand: 'MST Blockchain',
      sellingPrice: 1499,
      referencePrice: 1899,
      costPrice: 580,
      stock: 65,
      status: 'published',
      isFeatured: true,
      isLimitedEdition: false,
      collectionIds: [colDrinkwareId.toString()],
      tags: ['tumbler', 'drinkware', 'flask', 'thermal', 'coffee'],
      colors: ['Matte Black', 'Crimson Red'],
      sizes: ['750ml'],
      specifications: {
        material: 'Pro-grade 18/8 Stainless Steel, BPA-Free Lid',
        weight: '380 grams',
        dimensions: '26cm Height x 7.5cm Diameter',
        careInstructions: 'Hand wash recommended to preserve powder coat finish',
        origin: 'Engineered in India',
        features: ['Double-wall vacuum insulation', 'Condensation-free exterior', 'Fits standard car cup holders'],
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Double-Wall Insulated Tumbler Matte Black',
          isPrimary: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Tumbler Cap and Laser Etching Detail',
          isPrimary: false,
        },
      ],
    },
    {
      name: 'MST "Code · Deploy · Validate" Ceramic Mug',
      slug: 'mst-code-deploy-validate-ceramic-mug',
      sku: 'MST-DRK-MUG-05',
      description: 'A substantial 350ml stoneware ceramic mug finished with a dual-tone matte black outer glaze and vibrant crimson inner wall. Features debossed terminal syntax and the MST consensus block formula.',
      category: 'drinkware',
      brand: 'MST Blockchain',
      sellingPrice: 699,
      referencePrice: 899,
      costPrice: 220,
      stock: 140,
      status: 'published',
      isFeatured: false,
      isLimitedEdition: false,
      collectionIds: [colDrinkwareId.toString()],
      tags: ['mug', 'coffee', 'drinkware', 'desk'],
      colors: ['Matte Black & Red'],
      sizes: ['350ml'],
      specifications: {
        material: 'High-density vitrified ceramic stoneware',
        weight: '390 grams',
        dimensions: '9.5cm Height x 8.2cm Diameter',
        careInstructions: 'Microwave and dishwasher safe',
        origin: 'India',
        features: ['Ergonomic wide-grip C-handle', 'Stain-resistant smooth interior', 'Weighted anti-tip base'],
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Code Deploy Validate Ceramic Coffee Mug',
          isPrimary: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Ceramic Coffee Mug Desk Angle',
          isPrimary: false,
        },
      ],
    },
    {
      name: 'MST XXL Speed-Matrix Desk Mat (900x400mm)',
      slug: 'mst-xxl-speed-matrix-desk-mat',
      sku: 'MST-DSK-MAT-06',
      description: 'Transform your battlestation with this professional-grade 900x400mm desk mat. Crafted with a micro-woven cloth surface optimized for ultra-smooth mouse tracking, 4mm high-density natural rubber padding, and anti-fray stitched crimson borders.',
      category: 'tech-accessories',
      brand: 'MST Blockchain',
      sellingPrice: 1799,
      referencePrice: 2299,
      costPrice: 720,
      stock: 85,
      status: 'published',
      isFeatured: true,
      isLimitedEdition: false,
      collectionIds: [colTechId.toString()],
      tags: ['desk mat', 'mousepad', 'workspace', 'setup', 'accessories'],
      colors: ['Speed Matrix Black'],
      sizes: ['900x400x4mm'],
      specifications: {
        material: 'Micro-textured low-friction cloth top, natural non-slip rubber base',
        weight: '750 grams',
        dimensions: '900mm x 400mm x 4mm',
        careInstructions: 'Wipe clean with a damp cloth or warm hand wash',
        origin: 'Engineered in India',
        features: ['Spill-resistant coating', 'Reinforced perimeter micro-stitching', 'Zero-slip textured base'],
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST XXL Speed-Matrix Desk Mat On Workstation',
          isPrimary: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Desk Mat Micro-Texture and Stitched Border Close Up',
          isPrimary: false,
        },
      ],
    },
    {
      name: 'MST Shockproof Padded Laptop Sleeve 14-16"',
      slug: 'mst-shockproof-padded-laptop-sleeve',
      sku: 'MST-SLV-TECH-07',
      description: 'Sleek, minimalist protection for your primary development machine. Features water-resistant ballistic nylon exterior, 360-degree memory foam shock absorption, ultra-soft microfiber interior lining, and durable YKK waterproof zippers.',
      category: 'tech-accessories',
      brand: 'MST Blockchain',
      sellingPrice: 1899,
      referencePrice: 2499,
      costPrice: 780,
      stock: 60,
      status: 'published',
      isFeatured: true,
      isLimitedEdition: false,
      collectionIds: [colTechId.toString()],
      tags: ['laptop sleeve', 'case', 'macbook', 'tech accessories', 'bag'],
      colors: ['Stealth Carbon', 'Storm Grey'],
      sizes: ['14-inch', '16-inch'],
      variants: [
        { id: 'v_slv_14_blk', sku: 'MST-SLV-14-BLK', name: 'Stealth Carbon / 14"', size: '14-inch', color: 'Stealth Carbon', stock: 35 },
        { id: 'v_slv_16_blk', sku: 'MST-SLV-16-BLK', name: 'Stealth Carbon / 16"', size: '16-inch', color: 'Stealth Carbon', stock: 25 },
      ],
      specifications: {
        material: '900D Ballistic Nylon with Polyurethane Weather Guard',
        weight: '320 grams',
        compatibility: 'Fits MacBook Pro 14"/16", Dell XPS, ThinkPad, and laptops up to 16"',
        careInstructions: 'Wipe with damp cloth',
        origin: 'India',
        features: ['YKK Aquaguard inverted zipper', 'Front accessory compartment for charger & dongles', 'Drop-protection bumper corners'],
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Shockproof Padded Laptop Sleeve Top View',
          isPrimary: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Laptop Sleeve Hardware and Lining Detail',
          isPrimary: false,
        },
      ],
    },
    {
      name: 'MST Holographic Web3 Die-Cut Sticker Pack (12-Piece)',
      slug: 'mst-holographic-web3-die-cut-sticker-pack',
      sku: 'MST-STK-HOLO-08',
      description: 'Deck out your laptop, monitor, and phone cases with 12 exclusive premium vinyl stickers. Features rainbow holographic finishes, matte UV coats, and durable waterproof adhesive. Includes MST logo badges, "PoSA Consensus", "Smart Contract Verified", and developer humor.',
      category: 'goodies',
      brand: 'MST Blockchain',
      sellingPrice: 499,
      referencePrice: 699,
      costPrice: 120,
      stock: 250,
      status: 'published',
      isFeatured: false,
      isLimitedEdition: false,
      collectionIds: [colGoodiesId.toString()],
      tags: ['stickers', 'holographic', 'swag', 'goodies', 'laptop'],
      colors: ['Multi Holographic'],
      sizes: ['12-Piece Pack'],
      specifications: {
        material: 'Premium 6 mil thick vinyl with holographic laminate',
        weight: '45 grams',
        dimensions: 'Stickers range from 5cm to 10cm',
        features: ['Waterproof & weatherproof', 'Scratch & UV-resistant', 'Residue-free removal adhesive'],
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Holographic Web3 Die Cut Sticker Pack Displayed on Laptop',
          isPrimary: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Sticker Pack Rainbow Foil Hologram Shimmer',
          isPrimary: false,
        },
      ],
    },
    {
      name: 'MST Enamel Node Validator Commemorative Pin Set',
      slug: 'mst-enamel-node-validator-pin-set',
      sku: 'MST-PIN-VAL-09',
      description: 'A collector’s set of 3 hard enamel pins struck in polished gunmetal alloy with hand-filled crimson and white enamel. Celebrates node validators, cryptographic security, and the MST genesis network. Packed in a velvet-lined collector box.',
      category: 'goodies',
      brand: 'MST Blockchain',
      sellingPrice: 799,
      referencePrice: 1099,
      costPrice: 260,
      stock: 110,
      status: 'published',
      isFeatured: false,
      isLimitedEdition: true,
      editionNumber: 'Genesis Edition - 500 Sets',
      collectionIds: [colGoodiesId.toString(), colGenesisId.toString()],
      tags: ['pins', 'enamel', 'collectibles', 'validator', 'metal'],
      colors: ['Gunmetal & Crimson'],
      sizes: ['3-Pin Set'],
      specifications: {
        material: 'High-grade zinc alloy with hard cloisonné enamel fill',
        weight: '80 grams (with gift box)',
        dimensions: '30mm x 30mm each',
        features: ['Dual rubber clutch backings', 'Laser-engraved individual edition numbers', 'Custom presentation box'],
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Enamel Node Validator Collector Pin Set in Presentation Box',
          isPrimary: true,
        },
      ],
    },
    {
      name: 'MST Weatherproof Commuter Tech Backpack 24L',
      slug: 'mst-weatherproof-commuter-tech-backpack-24l',
      sku: 'MST-BAG-BP-10',
      description: 'The ultimate daily carry for crypto developers and digital nomads. 24 liters of structured storage with a suspended 16" laptop pocket, dedicated cable organizer panel, hidden passport/seed phrase stash, and waterproof matte polyurethane shell.',
      category: 'bags',
      brand: 'MST Blockchain',
      sellingPrice: 4299,
      referencePrice: 5499,
      costPrice: 2100,
      stock: 45,
      status: 'published',
      isFeatured: true,
      isLimitedEdition: false,
      collectionIds: [colTechId.toString()],
      tags: ['backpack', 'bag', 'travel', 'commuter', 'hardware'],
      colors: ['Stealth Obsidian'],
      sizes: ['24 Liters'],
      specifications: {
        material: 'Waterproof Polyurethane-Coated 1200D Recycled Polyester',
        weight: '1.15 kg',
        dimensions: '48cm x 31cm x 16cm',
        features: ['Dedicated suspended 16" laptop cradle', 'Luggage trolley sleeve', 'Ergonomic breathable EVA back panel', 'Key tether & RFID blocker pocket'],
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Weatherproof Commuter Tech Backpack Front Profile',
          isPrimary: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1546938576-6e6a64f317cc?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Backpack Compartments and Laptop Sleeve Opening',
          isPrimary: false,
        },
      ],
    },
    {
      name: 'MST Genesis Builder All-In-One Box Kit',
      slug: 'mst-genesis-builder-all-in-one-box-kit',
      sku: 'MST-KIT-GEN-11',
      description: 'The ultimate welcome kit for MST builders and ecosystem partners. Bundles the Genesis Heavyweight Hoodie, Double-Wall Tumbler, XXL Desk Mat, 12-Piece Holographic Sticker Pack, and an exclusive engraved Genesis Keycard in a luxury gift box.',
      category: 'bundles',
      brand: 'MST Blockchain',
      sellingPrice: 6499,
      referencePrice: 8499,
      costPrice: 3200,
      stock: 35,
      status: 'published',
      isFeatured: true,
      isLimitedEdition: true,
      editionNumber: 'Genesis Batch No. 01 — Limited to 150 Kits',
      collectionIds: [colGenesisId.toString(), colApparelId.toString()],
      tags: ['bundle', 'gift kit', 'genesis', 'hoodie', 'tumbler', 'stickers'],
      colors: ['Obsidian Collection'],
      sizes: ['M Kit', 'L Kit', 'XL Kit'],
      variants: [
        { id: 'v_kit_m', sku: 'MST-KIT-M', name: 'Medium Hoodie Bundle', size: 'M Kit', stock: 15 },
        { id: 'v_kit_l', sku: 'MST-KIT-L', name: 'Large Hoodie Bundle', size: 'L Kit', stock: 15 },
        { id: 'v_kit_xl', sku: 'MST-KIT-XL', name: 'XL Hoodie Bundle', size: 'XL Kit', stock: 5 },
      ],
      specifications: {
        weight: '2.8 kg (Complete Boxed Kit)',
        dimensions: '42cm x 32cm x 15cm presentation box',
        features: ['Custom branded rigid magnetic gift box', 'Includes 5 core MST flagship products', 'Individual serialized verification card'],
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Genesis Builder Kit Luxury Gift Box Packaging',
          isPrimary: true,
        },
      ],
    },
    {
      name: 'MST "Proof of Stake Authority" Heavyweight Sweatshirt',
      slug: 'mst-posa-heavyweight-sweatshirt',
      sku: 'MST-SWT-POSA-12',
      description: 'Minimalist crewneck sweatshirt made with thick 380 GSM combed fleece. Tonal matte black PoSA block hashes printed down the inner sleeve with a sleek red rubberized chest badge. Premium streetwear meets decentralized consensus.',
      category: 'apparel',
      brand: 'MST Blockchain',
      sellingPrice: 2899,
      referencePrice: 3499,
      costPrice: 1350,
      stock: 65,
      status: 'published',
      isFeatured: false,
      isLimitedEdition: false,
      collectionIds: [colApparelId.toString()],
      tags: ['sweatshirt', 'crewneck', 'posa', 'apparel', 'streetwear'],
      colors: ['Charcoal Heather', 'Obsidian Black'],
      sizes: ['S', 'M', 'L', 'XL'],
      specifications: {
        material: '380 GSM 80% Cotton / 20% Polyester Anti-Pill Brushed Fleece',
        weight: '620 grams',
        careInstructions: 'Machine wash cold, lay flat to dry',
        origin: 'India',
        features: ['Dense rib knit collar and cuffs', 'Drop-shoulder relaxed athletic fit', 'Silicone injection molded MST emblem'],
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST PoSA Heavyweight Crewneck Sweatshirt Front',
          isPrimary: true,
        },
      ],
    },
  ];

  console.log(`Inserting ${products.length} merchandise products...`);
  const insertDocs = products.map(p => ({
    ...p,
    createdAt: now,
    updatedAt: now,
  }));

  const productInsertRes = await db.collection('products').insertMany(insertDocs);

  // 4. SEED INVENTORY MOVEMENTS FOR ALL PRODUCTS
  console.log('Generating initial inventory audit logs...');
  const movementDocs = [];
  let pIdx = 0;
  for (const [insertedId] of Object.entries(productInsertRes.insertedIds)) {
    const prod = insertDocs[pIdx];
    movementDocs.push({
      productId: insertedId.toString(),
      productName: prod.name,
      delta: prod.stock,
      previousStock: 0,
      newStock: prod.stock,
      type: 'initial',
      reason: 'Initial MST store merchandise catalog bootstrap',
      createdAt: now,
    });
    pIdx++;
  }
  await db.collection('inventory_movements').insertMany(movementDocs);

  // 5. SEED PROMO DISCOUNT CODES
  console.log('Seeding discount coupons...');
  await db.collection('discount_codes').insertMany([
    {
      code: 'MSTBUILDER10',
      type: 'percentage',
      value: 10,
      minOrderAmount: 999,
      maxUses: 1000,
      usedCount: 24,
      expiresAt: '2028-12-31T23:59:59Z',
      isActive: true,
      createdAt: now,
    },
    {
      code: 'GENESIS500',
      type: 'fixed',
      value: 500,
      minOrderAmount: 2999,
      maxUses: 500,
      usedCount: 12,
      expiresAt: '2028-12-31T23:59:59Z',
      isActive: true,
      createdAt: now,
    },
    {
      code: 'DEVCON20',
      type: 'percentage',
      value: 20,
      minOrderAmount: 1999,
      maxUses: 200,
      usedCount: 8,
      expiresAt: '2028-12-31T23:59:59Z',
      isActive: true,
      createdAt: now,
    },
  ]);

  // 6. SEED SAMPLE CUSTOMER ORDER
  console.log('Seeding demo fulfilled order...');
  const sampleOrderId = new ObjectId();
  const sampleOrderNumber = 'MST-2026-89420101';
  const firstProd = insertDocs[0];

  await db.collection('orders').insertOne({
    _id: sampleOrderId,
    orderNumber: sampleOrderNumber,
    userId: customerId.toString(),
    customer: {
      name: 'Rohan Mehta',
      email: 'customer@mststore.com',
      phone: '+91 98111 67890',
    },
    shippingAddress: {
      fullName: 'Rohan Mehta',
      phone: '+91 98111 67890',
      street: 'Flat 402, Cyber Heights, Bandra Kurla Complex',
      apartment: 'Tower B',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400051',
      country: 'India',
      isDefault: true,
    },
    items: [
      {
        productId: productInsertRes.insertedIds[0].toString(),
        name: firstProd.name,
        slug: firstProd.slug,
        brand: firstProd.brand,
        sizeLabel: 'Size L',
        price: firstProd.sellingPrice,
        image: firstProd.images[0].url,
        quantity: 1,
        sku: 'MST-HOOD-BLK-L',
        selectedSize: 'L',
        selectedColor: 'Obsidian Black',
      },
    ],
    subtotal: firstProd.sellingPrice,
    discountAmount: 0,
    shippingFee: 0, // Above ₹2,999 free shipping
    taxAmount: 0,
    total: firstProd.sellingPrice,
    paymentStatus: 'paid',
    paymentMethod: 'test_mode',
    paymentDetails: {
      razorpayOrderId: 'order_test_demo_sample_01',
      razorpayPaymentId: 'pay_test_sample_01',
      razorpaySignature: 'test_verified',
      paidAt: now,
    },
    fulfillmentStatus: 'processing',
    timeline: [
      {
        status: 'Order Placed',
        timestamp: now,
        note: 'Order confirmed with TEST_MODE gateway',
      },
      {
        status: 'Payment Confirmed',
        timestamp: now,
        note: 'Payment verified successfully via test_mode',
      },
    ],
    createdAt: now,
    updatedAt: now,
  });

  // 7. ENSURE DATABASE INDEXES
  console.log('Ensuring all production database indexes...');
  await ensureIndexes();

  console.log('--- SEED COMPLETED SUCCESSFULLY ---');
  return {
    success: true,
    productsCount: products.length,
    usersCount: 2,
    collectionsCount: 5,
    message: 'MST Store database successfully initialized with official merchandise records.',
  };
}

// Allow direct CLI execution: `npx tsx scripts/seed.ts`
if (require.main === module || process.argv[1]?.includes('seed.ts')) {
  seedDatabase()
    .then(res => {
      console.log('Seed summary:', res);
      process.exit(0);
    })
    .catch(err => {
      console.error('Fatal seeding error:', err);
      process.exit(1);
    });
}
