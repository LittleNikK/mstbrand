import { MongoClient, ObjectId, Db } from 'mongodb';
import bcrypt from 'bcryptjs';

import { ensureIndexes } from '../lib/db/indexes';

export async function seedDatabase(customUri?: string, customDb?: string, existingDb?: Db) {
  const uri = customUri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
  const dbName = customDb || process.env.MONGODB_DB_NAME || 'mst_store';

  console.log('--- MST STORE DATABASE SEED ---');

  let db: Db;
  if (existingDb) {
    db = existingDb;
  } else {
    console.log(`Connecting to: ${uri}/${dbName}`);
    const client = new MongoClient(uri);
    await client.connect();
    db = client.db(dbName);
  }

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
  const colBagsId = new ObjectId();
  const colDrinkwareId = new ObjectId();
  const colStationeryId = new ObjectId();
  const colGoodiesId = new ObjectId();
  const colHampersId = new ObjectId();

  await db.collection('collections').insertMany([
    {
      _id: colApparelId,
      name: 'Apparel & Headwear',
      slug: 'apparel-headwear',
      description: 'Official heavyweight hoodies, developer shirts, graphic tees, caps, and comfort slides tailored for builders.',
      imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=80',
      featured: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: colBagsId,
      name: 'Bags & Daily Carry',
      slug: 'bags-daily-carry',
      description: 'Heavy-duty organic cotton tote bags and weather-sealed developer commuter backpacks.',
      imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80',
      featured: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: colDrinkwareId,
      name: 'Drinkware & Hydration',
      slug: 'drinkware-hydration',
      description: 'Thermal double-walled vacuum steel bottles and ceramic matte coffee cups for marathon coding sessions.',
      imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1200&q=80',
      featured: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: colStationeryId,
      name: 'Stationery & Desk Setup',
      slug: 'stationery-desk-setup',
      description: 'Hardcover dot-grid developer diaries, executive metal pens, and solid aluminum phone stands.',
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80',
      featured: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: colGoodiesId,
      name: 'Pins, Badges & Collectibles',
      slug: 'pins-badges-collectibles',
      description: 'Hard enamel lapel pins, magnetic badges, pinback button sets, metal keychains, and waterproof die-cut stickers.',
      imageUrl: 'https://images.unsplash.com/photo-1617059063772-34532796cdb5?auto=format&fit=crop&w=1200&q=80',
      featured: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: colHampersId,
      name: 'Gift Hampers & Mystery Boxes',
      slug: 'gift-hampers-mystery-boxes',
      description: 'All-in-one ecosystem welcome hampers and limited-edition mystery swag boxes for blockchain contributors.',
      imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1200&q=80',
      featured: false,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // 3. SEED EXACT 19 MST MERCHANDISE PRODUCTS
  console.log('Seeding exact 19 MST Store products requested by user...');
  const products = [
    // 1. PINS
    {
      name: 'MST Precision Enamel Lapel Pin',
      slug: 'mst-precision-enamel-lapel-pin',
      sku: 'MST-PIN-01',
      description: 'A die-cast hard enamel pin featuring the signature MST red geometric node insignia. Finished in electroplated gunmetal with dual butterfly clutches to ensure secure attachment to bags, jackets, or lanyard straps.',
      category: 'goodies',
      brand: 'MST Blockchain',
      sellingPrice: 499,
      referencePrice: 799,
      costPrice: 180,
      stock: 150,
      status: 'published',
      isFeatured: false,
      isLimitedEdition: false,
      collectionIds: [colGoodiesId.toString()],
      tags: ['pins', 'enamel pin', 'lapel pin', 'goodies', 'collectibles'],
      colors: ['Gunmetal Red'],
      sizes: ['OS'],
      variants: [
        { id: 'v_pin_os', sku: 'MST-PIN-01-OS', name: 'Gunmetal Red / One Size', size: 'OS', color: 'Gunmetal Red', colorHex: '#FF2D2D', stock: 150 },
      ],
      specifications: {
        material: 'Die-cast zinc alloy with hard enamel fill',
        dimensions: '32mm x 32mm x 2mm',
        features: ['Dual rubber clutch backings', 'Scratch-resistant polished finish', 'Laser-engraved MST mark on back'],
        origin: 'Crafted for MST Blockchain Community',
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1617059063772-34532796cdb5?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Precision Enamel Lapel Pin',
          isPrimary: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Pin Backing and Packaging Detail',
          isPrimary: false,
        },
      ],
    },

    // 2. MAGNETS BADGES
    {
      name: 'MST Magnetic Tech Badges & Fridge Magnets Set',
      slug: 'mst-magnetic-tech-badges-fridge-magnets-set',
      sku: 'MST-MAG-02',
      description: 'A set of 4 heavy-duty neodymium magnetic badges. Engineered to hold schematics and node checklists securely to magnetic whiteboards, metal PC towers, or refrigerators with zero slip.',
      category: 'goodies',
      brand: 'MST Blockchain',
      sellingPrice: 399,
      referencePrice: 599,
      costPrice: 140,
      stock: 120,
      status: 'published',
      isFeatured: false,
      isLimitedEdition: false,
      collectionIds: [colGoodiesId.toString()],
      tags: ['magnets badges', 'magnetic badge', 'fridge magnet', 'goodies'],
      colors: ['Multi-Color Set'],
      sizes: ['OS'],
      variants: [
        { id: 'v_mag_os', sku: 'MST-MAG-02-OS', name: '4-Pack Set', size: 'OS', color: 'Multi-Color', colorHex: '#1A1816', stock: 120 },
      ],
      specifications: {
        material: 'Pressed steel with N52 neodymium magnet core & matte laminate',
        dimensions: '44mm diameter each',
        features: ['Set of 4 distinct blockchain graphic badges', 'Ultra-strong N52 magnetic grip', 'Anti-scratch backing'],
        origin: 'India',
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Magnetic Tech Badges Set',
          isPrimary: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Magnetic Badges Pack Detail',
          isPrimary: false,
        },
      ],
    },

    // 3. BADGES
    {
      name: 'MST Genesis Ecosystem Pinback Badges Pack',
      slug: 'mst-genesis-ecosystem-pinback-badges-pack',
      sku: 'MST-BDG-03',
      description: 'Classic 58mm pinback button badges celebrating the MST developer community. Features vibrant UV-resistant printing with quotes: "Built for Builders", "50K TPS", and the MST Genesis seal.',
      category: 'goodies',
      brand: 'MST Blockchain',
      sellingPrice: 299,
      referencePrice: 499,
      costPrice: 90,
      stock: 200,
      status: 'published',
      isFeatured: false,
      isLimitedEdition: false,
      collectionIds: [colGoodiesId.toString()],
      tags: ['badges', 'pinback badges', 'button badge', 'goodies'],
      colors: ['Matte Black & Red'],
      sizes: ['OS'],
      variants: [
        { id: 'v_bdg_os', sku: 'MST-BDG-03-OS', name: '5-Badge Pack', size: 'OS', color: 'Matte Black & Red', colorHex: '#FF2D2D', stock: 200 },
      ],
      specifications: {
        material: 'Tinplate with safety pin back & Mylar protective film',
        dimensions: '58mm diameter',
        features: ['5-piece collector pack', 'Rust-resistant safety pin', 'High-gloss UV protection layer'],
        origin: 'India',
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Genesis Pinback Badges Pack',
          isPrimary: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1617059063772-34532796cdb5?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Badges Close-up Detail',
          isPrimary: false,
        },
      ],
    },

    // 4. TODABGAS (TOTE BAGS)
    {
      name: 'MST Heavy-Duty Canvas Tote Bag',
      slug: 'mst-heavy-duty-canvas-tote-bag',
      sku: 'MST-TOTE-04',
      description: 'Crafted from 16 oz unbleached organic canvas cotton. Features reinforced box-stitched handles, an interior zippered phone/wallet pocket, and screen-printed MST Blockchain consensus typography.',
      category: 'bags',
      brand: 'MST Blockchain',
      sellingPrice: 799,
      referencePrice: 1199,
      costPrice: 320,
      stock: 90,
      status: 'published',
      isFeatured: true,
      isLimitedEdition: false,
      collectionIds: [colBagsId.toString()],
      tags: ['todabgas', 'tote bag', 'canvas tote', 'bags', 'eco-friendly'],
      colors: ['Natural Ecru', 'Obsidian Black'],
      sizes: ['OS'],
      variants: [
        { id: 'v_tote_ecru', sku: 'MST-TOTE-04-ECR', name: 'Natural Ecru', size: 'OS', color: 'Natural Ecru', colorHex: '#F5F0E8', stock: 50 },
        { id: 'v_tote_blk', sku: 'MST-TOTE-04-BLK', name: 'Obsidian Black', size: 'OS', color: 'Obsidian Black', colorHex: '#1A1816', stock: 40 },
      ],
      specifications: {
        material: '16 oz 100% GOTS-Certified Organic Cotton Canvas',
        dimensions: '40cm x 36cm x 10cm (26cm handle drop)',
        features: ['Interior zip pocket', 'Reinforced cross-stitch handles', 'Water-based eco pigment print'],
        origin: 'Tirupur, India',
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Heavy-Duty Canvas Tote Bag Front View',
          isPrimary: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1597484662317-9bd7bdda2907?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Canvas Tote Bag Styling Detail',
          isPrimary: false,
        },
      ],
    },

    // 5. KEYCHAIN
    {
      name: 'MST Laser-Etched Hardware Keychain',
      slug: 'mst-laser-etched-hardware-keychain',
      sku: 'MST-KEY-05',
      description: 'Precision milled from aerospace-grade anodized aluminum with a heavy-gauge split ring. Laser-engraved with the MST hash motif and node validator coordinates.',
      category: 'goodies',
      brand: 'MST Blockchain',
      sellingPrice: 449,
      referencePrice: 699,
      costPrice: 160,
      stock: 140,
      status: 'published',
      isFeatured: false,
      isLimitedEdition: false,
      collectionIds: [colGoodiesId.toString()],
      tags: ['keychain', 'metal keyring', 'hardware', 'goodies', 'accessories'],
      colors: ['Matte Black', 'Brushed Silver'],
      sizes: ['OS'],
      variants: [
        { id: 'v_key_blk', sku: 'MST-KEY-05-BLK', name: 'Matte Black', size: 'OS', color: 'Matte Black', colorHex: '#1A1816', stock: 80 },
        { id: 'v_key_slv', sku: 'MST-KEY-05-SLV', name: 'Brushed Silver', size: 'OS', color: 'Brushed Silver', colorHex: '#D5CCC0', stock: 60 },
      ],
      specifications: {
        material: 'CNC Milled 6061-T6 Anodized Aluminum with Stainless Steel Ring',
        dimensions: '65mm x 20mm x 4mm',
        features: ['Laser-etched topography motif', 'Corrosion-proof anodized coat', 'Heavy-duty 30mm split key ring'],
        origin: 'Crafted for MST Blockchain Community',
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Laser-Etched Hardware Keychain Front View',
          isPrimary: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1585642490059-598e3b3c3b0f?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Metal Keychain Finish Detail',
          isPrimary: false,
        },
      ],
    },

    // 6. PEN
    {
      name: 'MST Executive Matte Black Metal Pen',
      slug: 'mst-executive-matte-black-metal-pen',
      sku: 'MST-PEN-06',
      description: 'A perfectly counter-weighted brass rollerball pen featuring a smooth 0.5mm German ceramic ball refill and integrated conductive soft stylus tip. Subtle laser-etched MST logo on the clip.',
      category: 'stationery',
      brand: 'MST Blockchain',
      sellingPrice: 599,
      referencePrice: 899,
      costPrice: 220,
      stock: 110,
      status: 'published',
      isFeatured: false,
      isLimitedEdition: false,
      collectionIds: [colStationeryId.toString()],
      tags: ['pen', 'metal pen', 'rollerball', 'stationery', 'desk'],
      colors: ['Matte Black with Red Accent'],
      sizes: ['OS'],
      variants: [
        { id: 'v_pen_os', sku: 'MST-PEN-06-OS', name: 'Matte Black / 0.5mm Gel', size: 'OS', color: 'Matte Black', colorHex: '#1A1816', stock: 110 },
      ],
      specifications: {
        material: 'Solid weighted brass with matte powder coat',
        weight: '38 grams (ergonomically balanced)',
        features: ['German archival black gel ink refill included', 'Twist-retract mechanism', 'Spring-loaded steel pocket clip'],
        origin: 'Germany / India Assembly',
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Executive Matte Black Metal Pen',
          isPrimary: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1569683795645-b62e50fbf103?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Pen Writing and Tip Detail',
          isPrimary: false,
        },
      ],
    },

    // 7. BOTTLES
    {
      name: 'MST Thermal Vacuum-Insulated Steel Water Bottle',
      slug: 'mst-thermal-vacuum-insulated-steel-water-bottle',
      sku: 'MST-BOT-07',
      description: '750ml double-walled pro-grade 18/8 stainless steel bottle with TempShield vacuum insulation. Keeps ice-water cold for 24 hours or coffee hot for 12 hours without condensation. 100% BPA-free and leakproof.',
      category: 'drinkware',
      brand: 'MST Blockchain',
      sellingPrice: 1499,
      referencePrice: 1999,
      costPrice: 650,
      stock: 85,
      status: 'published',
      isFeatured: true,
      isLimitedEdition: false,
      collectionIds: [colDrinkwareId.toString()],
      tags: ['bottles', 'water bottle', 'flask', 'drinkware', 'hydration'],
      colors: ['Obsidian Black', 'Cyber Red'],
      sizes: ['750ml'],
      variants: [
        { id: 'v_bot_blk', sku: 'MST-BOT-07-BLK', name: 'Obsidian Black / 750ml', size: '750ml', color: 'Obsidian Black', colorHex: '#1A1816', stock: 50 },
        { id: 'v_bot_red', sku: 'MST-BOT-07-RED', name: 'Cyber Red / 750ml', size: '750ml', color: 'Cyber Red', colorHex: '#FF2D2D', stock: 35 },
      ],
      specifications: {
        material: 'Food-grade 18/8 (304) Stainless Steel',
        weight: '390 grams',
        features: ['TempShield vacuum insulation', 'Condensation-proof exterior', 'Ergonomic loop cap', 'Wide mouth ice refill'],
        origin: 'India',
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Thermal Vacuum-Insulated Water Bottle Front View',
          isPrimary: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1570831739427-44f2d7a9446f?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Water Bottle Cap and Texture Detail',
          isPrimary: false,
        },
      ],
    },

    // 8. DIREY (DIARY)
    {
      name: 'MST Developer Hardcover Dot-Grid Diary',
      slug: 'mst-developer-hardcover-dot-grid-diary',
      sku: 'MST-DIR-08',
      description: '192 numbered pages of 120 GSM fountain-pen friendly acid-free paper. Features 5mm dot-grid layout for system architecture diagrams, an expanding rear pocket, elastic band closure, and dual silk ribbon bookmarks.',
      category: 'stationery',
      brand: 'MST Blockchain',
      sellingPrice: 899,
      referencePrice: 1299,
      costPrice: 380,
      stock: 95,
      status: 'published',
      isFeatured: false,
      isLimitedEdition: false,
      collectionIds: [colStationeryId.toString()],
      tags: ['direy', 'diary', 'notebook', 'journal', 'stationery', 'developer'],
      colors: ['Charcoal Black'],
      sizes: ['A5 (148 x 210 mm)'],
      variants: [
        { id: 'v_dir_a5', sku: 'MST-DIR-08-A5', name: 'Hardcover A5', size: 'A5', color: 'Charcoal Black', colorHex: '#1A1816', stock: 95 },
      ],
      specifications: {
        material: 'Vegan PU leather hardcover with 120 GSM bleed-proof ivory paper',
        dimensions: '148mm x 210mm (A5) • 192 pages',
        features: ['5mm subtle dot grid', 'Lay-flat 180° Smyth-sewn binding', 'Expandable back folder', 'Dual ribbon markers'],
        origin: 'India',
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Developer Hardcover Dot-Grid Diary Closed View',
          isPrimary: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Diary Open Dot-Grid Pages Detail',
          isPrimary: false,
        },
      ],
    },

    // 9. CUP
    {
      name: 'MST Ceramic Matte Finish Coffee Cup',
      slug: 'mst-ceramic-matte-finish-coffee-cup',
      sku: 'MST-CUP-09',
      description: '350ml handcrafted stoneware mug featuring a tactile matte exterior glaze and a glossy, stain-resistant interior. Comfortable wide-loop handle designed for long hacking sprints and code reviews.',
      category: 'drinkware',
      brand: 'MST Blockchain',
      sellingPrice: 699,
      referencePrice: 999,
      costPrice: 280,
      stock: 100,
      status: 'published',
      isFeatured: false,
      isLimitedEdition: false,
      collectionIds: [colDrinkwareId.toString()],
      tags: ['cup', 'mug', 'coffee cup', 'drinkware', 'ceramics'],
      colors: ['Matte Black with Red Base'],
      sizes: ['350ml'],
      variants: [
        { id: 'v_cup_350', sku: 'MST-CUP-09-350', name: '350ml Mug', size: '350ml', color: 'Matte Black', colorHex: '#1A1816', stock: 100 },
      ],
      specifications: {
        material: 'High-density ceramic stoneware with lead-free glaze',
        weight: '360 grams',
        features: ['Microwave and dishwasher safe', 'Heat-retentive thick walls', 'Ergonomic easy-grip handle'],
        origin: 'Khurja Pottery, India',
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Ceramic Matte Finish Coffee Cup',
          isPrimary: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Coffee Mug Steam and Texture Detail',
          isPrimary: false,
        },
      ],
    },

    // 10. HODDIES (HOODIES)
    {
      name: 'MST Genesis Heavyweight Builder Hoodie',
      slug: 'mst-genesis-heavyweight-builder-hoodie',
      sku: 'MST-HOOD-10',
      description: 'Engineered from ultra-dense 420 GSM French terry cotton. Features an embroidered high-density MST red geometric insignia on the chest, a double-layered structured hood with metal aglets, and a hidden zip-pocket for hardware wallets.',
      category: 'apparel',
      brand: 'MST Blockchain',
      sellingPrice: 3499,
      referencePrice: 4299,
      costPrice: 1650,
      stock: 75,
      status: 'published',
      isFeatured: true,
      isLimitedEdition: false,
      collectionIds: [colApparelId.toString()],
      tags: ['hoddies', 'hoodies', 'hoodie', 'apparel', 'builder', 'winter'],
      colors: ['Obsidian Black', 'Heather Charcoal'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      variants: [
        { id: 'v_hood_s_blk', sku: 'MST-HOOD-10-S-BLK', name: 'Obsidian Black / S', size: 'S', color: 'Obsidian Black', colorHex: '#0A0A0A', stock: 15 },
        { id: 'v_hood_m_blk', sku: 'MST-HOOD-10-M-BLK', name: 'Obsidian Black / M', size: 'M', color: 'Obsidian Black', colorHex: '#0A0A0A', stock: 25 },
        { id: 'v_hood_l_blk', sku: 'MST-HOOD-10-L-BLK', name: 'Obsidian Black / L', size: 'L', color: 'Obsidian Black', colorHex: '#0A0A0A', stock: 20 },
        { id: 'v_hood_xl_blk', sku: 'MST-HOOD-10-XL-BLK', name: 'Obsidian Black / XL', size: 'XL', color: 'Obsidian Black', colorHex: '#0A0A0A', stock: 15 },
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
          alt: 'MST Genesis Heavyweight Builder Hoodie Front View',
          isPrimary: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Genesis Hoodie Fabric & Embroidery Detail',
          isPrimary: false,
        },
      ],
    },

    // 11. STICKERS
    {
      name: 'MST Holographic Waterproof Die-Cut Stickers Pack',
      slug: 'mst-holographic-waterproof-stickers-pack',
      sku: 'MST-STK-11',
      description: 'Pack of 10 ultra-durable vinyl stickers with holographic and matte UV finishes. Resistant to water, scratches, and direct sunlight — engineered to withstand heavy laptop bag friction and outdoor adventures.',
      category: 'goodies',
      brand: 'MST Blockchain',
      sellingPrice: 349,
      referencePrice: 599,
      costPrice: 95,
      stock: 250,
      status: 'published',
      isFeatured: true,
      isLimitedEdition: false,
      collectionIds: [colGoodiesId.toString()],
      tags: ['stickers', 'laptop stickers', 'holographic', 'goodies', 'vinyl'],
      colors: ['Multi-finish 10-Pack'],
      sizes: ['OS'],
      variants: [
        { id: 'v_stk_10pk', sku: 'MST-STK-11-10PK', name: '10-Sticker Pack', size: 'OS', color: 'Multi-finish', colorHex: '#FF2D2D', stock: 250 },
      ],
      specifications: {
        material: 'Premium 6 mil thick waterproof vinyl with permanent acrylic adhesive',
        dimensions: 'Assorted 50mm - 85mm sizes',
        features: ['100% waterproof and dishwasher safe', 'UV-resistant laminate prevents fading', 'Leaves zero sticky residue on MacBooks upon removal'],
        origin: 'India',
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Holographic Waterproof Stickers Pack',
          isPrimary: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Laptop Stickers Placement Detail',
          isPrimary: false,
        },
      ],
    },

    // 12. SHIRTS
    {
      name: 'MST Oxford Cotton Developer Button-Down Shirt',
      slug: 'mst-oxford-cotton-developer-button-down-shirt',
      sku: 'MST-SHIRT-12',
      description: 'Crafted from breathable 180 GSM two-ply combed Oxford cotton. Combines a crisp modern silhouette with stretch armhole construction for keyboard comfort. Minimal tonal red MST embroidery at the hem.',
      category: 'apparel',
      brand: 'MST Blockchain',
      sellingPrice: 2199,
      referencePrice: 2899,
      costPrice: 950,
      stock: 65,
      status: 'published',
      isFeatured: false,
      isLimitedEdition: false,
      collectionIds: [colApparelId.toString()],
      tags: ['shirts', 'button-down shirt', 'oxford shirt', 'apparel', 'formal'],
      colors: ['Crisp White', 'Midnight Navy'],
      sizes: ['S', 'M', 'L', 'XL'],
      variants: [
        { id: 'v_sh_s_wht', sku: 'MST-SH-12-S-WHT', name: 'Crisp White / S', size: 'S', color: 'Crisp White', colorHex: '#FFFFFF', stock: 15 },
        { id: 'v_sh_m_wht', sku: 'MST-SH-12-M-WHT', name: 'Crisp White / M', size: 'M', color: 'Crisp White', colorHex: '#FFFFFF', stock: 20 },
        { id: 'v_sh_l_wht', sku: 'MST-SH-12-L-WHT', name: 'Crisp White / L', size: 'L', color: 'Crisp White', colorHex: '#FFFFFF', stock: 20 },
        { id: 'v_sh_xl_wht', sku: 'MST-SH-12-XL-WHT', name: 'Crisp White / XL', size: 'XL', color: 'Crisp White', colorHex: '#FFFFFF', stock: 10 },
      ],
      specifications: {
        material: '180 GSM 100% Long-Staple Combed Oxford Cotton',
        weight: '310 grams',
        careInstructions: 'Machine wash warm, iron medium heat',
        origin: 'India',
        features: ['Wrinkle-resistant easy-iron finish', 'Natural mother-of-pearl style buttons', 'Curved hemline'],
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Oxford Cotton Developer Button-Down Shirt',
          isPrimary: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Button-Down Shirt Collar and Fabric Detail',
          isPrimary: false,
        },
      ],
    },

    // 13. T SHIRTS
    {
      name: 'MST "50K TPS" EVM High-Throughput T-Shirt',
      slug: 'mst-50k-tps-evm-high-throughput-t-shirt',
      sku: 'MST-TEE-13',
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
      tags: ['t shirts', 't-shirt', 'graphic tee', 'apparel', '50ktps'],
      colors: ['Obsidian Black', 'Pure White'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      variants: [
        { id: 'v_tee_s_blk', sku: 'MST-TEE-13-S-BLK', name: 'Obsidian Black / S', size: 'S', color: 'Obsidian Black', colorHex: '#0A0A0A', stock: 30 },
        { id: 'v_tee_m_blk', sku: 'MST-TEE-13-M-BLK', name: 'Obsidian Black / M', size: 'M', color: 'Obsidian Black', colorHex: '#0A0A0A', stock: 40 },
        { id: 'v_tee_l_blk', sku: 'MST-TEE-13-L-BLK', name: 'Obsidian Black / L', size: 'L', color: 'Obsidian Black', colorHex: '#0A0A0A', stock: 30 },
        { id: 'v_tee_xl_blk', sku: 'MST-TEE-13-XL-BLK', name: 'Obsidian Black / XL', size: 'XL', color: 'Obsidian Black', colorHex: '#0A0A0A', stock: 20 },
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
          alt: 'MST 50K TPS High-Throughput T-Shirt Front View',
          isPrimary: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Graphic T-Shirt Print Detail',
          isPrimary: false,
        },
      ],
    },

    // 14. CAPS
    {
      name: 'MST Embroidered Geometric Dad Cap',
      slug: 'mst-embroidered-geometric-dad-cap',
      sku: 'MST-CAP-14',
      description: 'Low-profile unstructured 6-panel dad hat constructed from 100% washed chino cotton twill. Features 3D direct embroidery of the MST node emblem with an adjustable brass buckle closure.',
      category: 'headwear',
      brand: 'MST Blockchain',
      sellingPrice: 899,
      referencePrice: 1299,
      costPrice: 380,
      stock: 80,
      status: 'published',
      isFeatured: true,
      isLimitedEdition: false,
      collectionIds: [colApparelId.toString()],
      tags: ['caps', 'cap', 'dad hat', 'headwear', 'embroidered'],
      colors: ['Charcoal Black', 'Faded Stone'],
      sizes: ['OS (Adjustable)'],
      variants: [
        { id: 'v_cap_blk', sku: 'MST-CAP-14-BLK', name: 'Charcoal Black', size: 'OS', color: 'Charcoal Black', colorHex: '#1A1816', stock: 50 },
        { id: 'v_cap_stn', sku: 'MST-CAP-14-STN', name: 'Faded Stone', size: 'OS', color: 'Faded Stone', colorHex: '#D5CCC0', stock: 30 },
      ],
      specifications: {
        material: '100% Washed Chino Cotton Twill',
        weight: '85 grams',
        features: ['3D embroidered insignia', 'Embossed antique brass tuck-in strap', 'Curved visor with 6-row stitching'],
        origin: 'India',
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Embroidered Geometric Dad Cap Front View',
          isPrimary: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Cap Embroidery and Strap Detail',
          isPrimary: false,
        },
      ],
    },

    // 15. SLEEPERS (SLIPPERS)
    {
      name: 'MST Ergonomic Cloud Comfort Slippers & Slides',
      slug: 'mst-ergonomic-cloud-comfort-slippers-slides',
      sku: 'MST-SLP-15',
      description: 'Ultra-lightweight high-resilience EVA foam slides engineered with deep heel cups and anatomical arch support. Molded with anti-slip wave traction grooves and an embossed MST monogram on the strap.',
      category: 'apparel',
      brand: 'MST Blockchain',
      sellingPrice: 999,
      referencePrice: 1499,
      costPrice: 420,
      stock: 70,
      status: 'published',
      isFeatured: false,
      isLimitedEdition: false,
      collectionIds: [colApparelId.toString()],
      tags: ['sleepers', 'slippers', 'slides', 'footwear', 'apparel', 'comfort'],
      colors: ['Obsidian Black'],
      sizes: ['UK 7', 'UK 8', 'UK 9', 'UK 10'],
      variants: [
        { id: 'v_slp_7', sku: 'MST-SLP-15-7', name: 'Obsidian Black / UK 7', size: 'UK 7', color: 'Obsidian Black', colorHex: '#1A1816', stock: 15 },
        { id: 'v_slp_8', sku: 'MST-SLP-15-8', name: 'Obsidian Black / UK 8', size: 'UK 8', color: 'Obsidian Black', colorHex: '#1A1816', stock: 20 },
        { id: 'v_slp_9', sku: 'MST-SLP-15-9', name: 'Obsidian Black / UK 9', size: 'UK 9', color: 'Obsidian Black', colorHex: '#1A1816', stock: 20 },
        { id: 'v_slp_10', sku: 'MST-SLP-15-10', name: 'Obsidian Black / UK 10', size: 'UK 10', color: 'Obsidian Black', colorHex: '#1A1816', stock: 15 },
      ],
      specifications: {
        material: '100% Compression-Molded Virgin EVA Foam',
        weight: '220 grams per pair',
        features: ['4cm thick shock-absorbing sole', 'Hydrophobic quick-dry design', 'Anti-skid grip pattern'],
        origin: 'India',
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Ergonomic Cloud Comfort Slippers & Slides',
          isPrimary: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Slides Sole and Cushioning Detail',
          isPrimary: false,
        },
      ],
    },

    // 16. BAGS
    {
      name: 'MST Weatherproof Tech Commuter Backpack Bag',
      slug: 'mst-weatherproof-tech-commuter-backpack-bag',
      sku: 'MST-BAG-16',
      description: '24-liter water-resistant 900D ballistic nylon backpack with a dedicated suspended 16" MacBook compartment, concealed airtag pocket, waterproof YKK Aquaguard zips, and luggage pass-through strap for crypto conferences.',
      category: 'bags',
      brand: 'MST Blockchain',
      sellingPrice: 2899,
      referencePrice: 3699,
      costPrice: 1250,
      stock: 55,
      status: 'published',
      isFeatured: true,
      isLimitedEdition: false,
      collectionIds: [colBagsId.toString()],
      tags: ['bags', 'backpack', 'tech bag', 'laptop bag', 'travel'],
      colors: ['Stealth Black'],
      sizes: ['24L'],
      variants: [
        { id: 'v_bag_24l', sku: 'MST-BAG-16-24L', name: 'Stealth Black / 24L', size: '24L', color: 'Stealth Black', colorHex: '#1A1816', stock: 55 },
      ],
      specifications: {
        material: '900D Matte TPU-Coated Ballistic Nylon with 210D Ripstop Lining',
        dimensions: '48cm x 31cm x 16cm (24 Liter Capacity)',
        features: ['Suspended fleece-lined 16" laptop sleeve', 'Luggage handle trolley pass-through', 'Waterproof YKK zippers', 'Ergonomic breathable back panel'],
        origin: 'India',
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Weatherproof Tech Commuter Backpack Bag Front View',
          isPrimary: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Backpack Compartments Detail',
          isPrimary: false,
        },
      ],
    },

    // 17. GIFT HAMPERS
    {
      name: 'MST Ecosystem Builder Welcome Gift Hamper',
      slug: 'mst-ecosystem-builder-welcome-gift-hamper',
      sku: 'MST-HAMP-17',
      description: 'The ultimate curated onboarding hamper for MST ecosystem node runners, developers, and ambassadors. Contains the MST Builder Hoodie, Insulated Water Bottle, Ceramic Coffee Mug, Hardcover Diary, Metal Pen, and Collector Pin Pack in a rigid matte presentation box.',
      category: 'bundles',
      brand: 'MST Blockchain',
      sellingPrice: 4999,
      referencePrice: 6499,
      costPrice: 2400,
      stock: 40,
      status: 'published',
      isFeatured: true,
      isLimitedEdition: true,
      collectionIds: [colHampersId.toString()],
      tags: ['gift hampers', 'gift hamper', 'welcome kit', 'bundles', 'swag box'],
      colors: ['Executive Red & Black Edition'],
      sizes: ['Box Set'],
      variants: [
        { id: 'v_hamp_m', sku: 'MST-HAMP-17-M', name: 'Hamper with Medium Hoodie', size: 'M', color: 'Executive Edition', colorHex: '#FF2D2D', stock: 15 },
        { id: 'v_hamp_l', sku: 'MST-HAMP-17-L', name: 'Hamper with Large Hoodie', size: 'L', color: 'Executive Edition', colorHex: '#FF2D2D', stock: 15 },
        { id: 'v_hamp_xl', sku: 'MST-HAMP-17-XL', name: 'Hamper with XL Hoodie', size: 'XL', color: 'Executive Edition', colorHex: '#FF2D2D', stock: 10 },
      ],
      specifications: {
        material: 'Premium rigid presentation gift box with magnetic lid closure & foam inlays',
        dimensions: '42cm x 34cm x 14cm',
        features: ['Contains 6 premium core MST items', 'Personalized signed welcome parchment', 'Collector box keepsake packaging'],
        origin: 'Curated by MST Foundation',
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Ecosystem Builder Welcome Gift Hamper Box',
          isPrimary: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Gift Hamper Unboxing Detail',
          isPrimary: false,
        },
      ],
    },

    // 18. MISTERY BOX (MYSTERY BOX)
    {
      name: 'MST Limited Edition Genesis Swag Mystery Box',
      slug: 'mst-limited-edition-genesis-swag-mystery-box',
      sku: 'MST-MYS-18',
      description: 'A sealed vault box loaded with 4 to 6 surprise items from unreleased testnet releases, numbered prototype pins, exclusive apparel variants, and developer collectables with guaranteed value over ₹6,000.',
      category: 'bundles',
      brand: 'MST Blockchain',
      sellingPrice: 3999,
      referencePrice: 5499,
      costPrice: 1900,
      stock: 35,
      status: 'published',
      isFeatured: true,
      isLimitedEdition: true,
      collectionIds: [colHampersId.toString()],
      tags: ['mistery box', 'mystery box', 'genesis box', 'surprise kit', 'bundles'],
      colors: ['Sealed Genesis Vault'],
      sizes: ['M', 'L', 'XL'],
      variants: [
        { id: 'v_mys_m', sku: 'MST-MYS-18-M', name: 'Mystery Box (Size M Apparel Included)', size: 'M', color: 'Vault Black', colorHex: '#1A1816', stock: 12 },
        { id: 'v_mys_l', sku: 'MST-MYS-18-L', name: 'Mystery Box (Size L Apparel Included)', size: 'L', color: 'Vault Black', colorHex: '#1A1816', stock: 15 },
        { id: 'v_mys_xl', sku: 'MST-MYS-18-XL', name: 'Mystery Box (Size XL Apparel Included)', size: 'XL', color: 'Vault Black', colorHex: '#1A1816', stock: 8 },
      ],
      specifications: {
        material: 'Heavyweight matte vault gift box with holographic tamper-evident seal',
        dimensions: '35cm x 28cm x 12cm',
        features: ['Guaranteed 4-6 premium merchandise goodies', '1-in-10 chance of rare 1-of-1 validator gear', 'Numbered tamper seal'],
        origin: 'Curated by MST Foundation',
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Limited Edition Genesis Swag Mystery Box',
          isPrimary: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Mystery Box Packaging & Mystery Contents',
          isPrimary: false,
        },
      ],
    },

    // 19. PHONE STAND
    {
      name: 'MST Solid Aluminum Ergonomic Desk Phone Stand',
      slug: 'mst-solid-aluminum-ergonomic-desk-phone-stand',
      sku: 'MST-STD-19',
      description: 'Precision CNC-machined from single-block 4mm solid aluminum with dual-axis 270° angle adjustment. Features anti-scratch non-slip silicone cushioning pads and an unobstructed cable routing channel for desktop charging while tracking crypto nodes.',
      category: 'tech-accessories',
      brand: 'MST Blockchain',
      sellingPrice: 849,
      referencePrice: 1199,
      costPrice: 340,
      stock: 100,
      status: 'published',
      isFeatured: true,
      isLimitedEdition: false,
      collectionIds: [colStationeryId.toString()],
      tags: ['phone stand', 'desk stand', 'aluminum stand', 'tech-accessories', 'desk setup'],
      colors: ['Space Gray', 'Matte Black'],
      sizes: ['Universal Phone & Tablet'],
      variants: [
        { id: 'v_std_gry', sku: 'MST-STD-19-GRY', name: 'Space Gray', size: 'Universal', color: 'Space Gray', colorHex: '#5C564E', stock: 55 },
        { id: 'v_std_blk', sku: 'MST-STD-19-BLK', name: 'Matte Black', size: 'Universal', color: 'Matte Black', colorHex: '#1A1816', stock: 45 },
      ],
      specifications: {
        material: '4mm Solid Aerospace Anodized Aluminum with Silicone Cushioning',
        weight: '210 grams (anti-tip stability)',
        features: ['270-degree dual-axis angle adjustment', 'Cable passthrough cutout for clean charging', 'Universal support up to 11-inch tablets'],
        origin: 'India',
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Solid Aluminum Ergonomic Desk Phone Stand Front View',
          isPrimary: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=1000&q=80',
          alt: 'MST Phone Stand Charging Setup Detail',
          isPrimary: false,
        },
      ],
    },
  ];

  // Insert all 19 products
  const productInsertRes = await db.collection('products').insertMany(
    products.map(p => ({
      ...p,
      createdAt: now,
      updatedAt: now,
    }))
  );

  console.log(`Inserted ${productInsertRes.insertedCount} products into catalog.`);

  // 4. SEED PROMO VOUCHERS / DISCOUNT CODES
  console.log('Seeding discount vouchers...');
  await db.collection('discount_codes').insertMany([
    {
      code: 'MST10',
      description: '10% discount on any official MST merchandise item',
      discountType: 'percentage',
      value: 10,
      minOrderAmount: 0,
      active: true,
      usageCount: 14,
      expiresAt: '2028-12-31T23:59:59.000Z',
      createdAt: now,
    },
    {
      code: 'BUILDER500',
      description: '₹500 flat discount on builder orders over ₹3,000',
      discountType: 'fixed',
      value: 500,
      minOrderAmount: 3000,
      active: true,
      usageCount: 28,
      expiresAt: '2028-12-31T23:59:59.000Z',
      createdAt: now,
    },
    {
      code: 'GENESIS15',
      description: '15% discount for Genesis drop contributors over ₹2,000',
      discountType: 'percentage',
      value: 15,
      minOrderAmount: 2000,
      active: true,
      usageCount: 9,
      expiresAt: '2028-12-31T23:59:59.000Z',
      createdAt: now,
    },
  ]);

  // 5. SEED INITIAL INVENTORY MOVEMENTS
  console.log('Logging initial genesis stock movements...');
  const movements = products.map((prod, idx) => ({
    productId: productInsertRes.insertedIds[idx].toString(),
    change: prod.stock,
    previousStock: 0,
    newStock: prod.stock,
    reason: 'Initial Genesis Merchandise Production Stocking',
    createdAt: now,
  }));
  await db.collection('inventory_movements').insertMany(movements);

  // 6. SEED DEMO SEED ORDER
  console.log('Seeding demo fulfilled order...');
  const firstProd = products[9]; // Hoodie
  await db.collection('orders').insertOne({
    orderNumber: 'MST-2026-9042',
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
        productId: productInsertRes.insertedIds[9].toString(),
        name: firstProd.name,
        slug: firstProd.slug,
        brand: firstProd.brand,
        sizeLabel: 'Size L',
        price: firstProd.sellingPrice,
        image: firstProd.images[0].url,
        quantity: 1,
        sku: 'MST-HOOD-10-L-BLK',
        selectedSize: 'L',
        selectedColor: 'Obsidian Black',
      },
    ],
    subtotal: firstProd.sellingPrice,
    discountAmount: 0,
    shippingFee: 0,
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
    collectionsCount: 6,
    message: 'MST Store database successfully initialized with exact 19 merchandise products.',
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
