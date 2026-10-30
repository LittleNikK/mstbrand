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
  const colGoodiesId = new ObjectId();

  await db.collection('collections').insertMany([
    {
      _id: colApparelId,
      name: 'Apparel & T-Shirts',
      slug: 'apparel-streetwear',
      description: 'Official 240 GSM combed compact cotton developer tees and minimalist streetwear.',
      imageUrl: '/t-shirts/Tshirt 4.jpg',
      featured: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: colBagsId,
      name: 'Luggage & Daily Carry',
      slug: 'luggage-daily-carry',
      description: 'Aerospace-grade polycarbonate travel suitcases and 16oz heavy organic canvas tote bags.',
      imageUrl: '/suitecase/Suitcase.png',
      featured: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: colGoodiesId,
      name: 'Ecosystem Goodies & Stickers',
      slug: 'ecosystem-goodies-stickers',
      description: 'Waterproof die-cut vinyl stickers, mascots, protocols, and developer hardware swag.',
      imageUrl: '/stickers/Buildon MST.png',
      featured: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: colDrinkwareId,
      name: 'Drinkware & Workspace',
      slug: 'drinkware-workspace',
      description: 'Official MST ceramic mugs, coffee cups, and developer desktop drinkware.',
      imageUrl: '/uploads/vintage-1793268766783-53e76a5b0ad6dbf3.png',
      featured: true,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // 3. SEED AUTHENTIC MST MERCHANDISE PRODUCTS
  console.log('Seeding authentic MST Store products...');
  const products = [
    {
      name: "test no 9",
      slug: "t",
      sku: "MST-T",
      description: "this is test no 9",
      category: "drinkware",
      brand: "MST Blockchain",
      sellingPrice: 4555,
      costPrice: 5555,
      referencePrice: 5555,
      stock: 14,
      status: "published",
      isFeatured: false,
      isLimitedEdition: false,
      images: [
        {
          url: "/uploads/vintage-1793268766783-53e76a5b0ad6dbf3.png",
          alt: "test no 9 photo",
          isPrimary: true
        }
      ],
      collectionIds: [colDrinkwareId.toString()],
      tags: [],
      colors: [],
      sizes: ["350ml"],
      variants: [
        {
          id: "v_1793268744063_040t",
          sku: "MST-T-350ML-1",
          size: "350ml",
          color: "red",
          stock: 15,
          price: 4555
        }
      ],
      specifications: [
        { name: "Color", value: "red" }
      ],
      sizeLabel: "Standard",
      measurements: {},
      color: "red",
      material: "",
      conditionGrade: "Official Merch",
      conditionNotes: "",
      flaws: [],
      isOneOfOne: false
    },
    {
      name: "MST Blockchain Genesis Builder Heavyweight Hoodie",
      slug: "mst-genesis-builder-hoodie",
      sku: "MST-HD-GENESIS",
      description: "The official MST Blockchain Genesis Builder Hoodie. Engineered for marathon hackathons and cool workspace environments. Crafted from 400 GSM heavyweight organic French terry cotton with reinforced double-needle seams, custom brushed metal aglets, and deep double-lined hood.",
      category: "apparel",
      brand: "MST Blockchain",
      sellingPrice: 3499,
      referencePrice: 4999,
      costPrice: 1400,
      stock: 135,
      status: "published",
      isFeatured: true,
      isLimitedEdition: true,
      collectionIds: [colApparelId.toString()],
      tags: ["hoodie", "hoodies", "apparel", "heavyweight", "cotton", "genesis"],
      colors: ["Stealth Black"],
      sizes: ["S", "M", "L", "XL", "XXL"],
      variants: [
        { id: "v_hd_s", sku: "MST-HD-GEN-S", name: "Stealth Black / S", size: "S", color: "Stealth Black", colorHex: "#1A1816", stock: 20, price: 3499 },
        { id: "v_hd_m", sku: "MST-HD-GEN-M", name: "Stealth Black / M", size: "M", color: "Stealth Black", colorHex: "#1A1816", stock: 35, price: 3499 },
        { id: "v_hd_l", sku: "MST-HD-GEN-L", name: "Stealth Black / L", size: "L", color: "Stealth Black", colorHex: "#1A1816", stock: 40, price: 3499 },
        { id: "v_hd_xl", sku: "MST-HD-GEN-XL", name: "Stealth Black / XL", size: "XL", color: "Stealth Black", colorHex: "#1A1816", stock: 25, price: 3499 },
        { id: "v_hd_xxl", sku: "MST-HD-GEN-XXL", name: "Stealth Black / XXL", size: "XXL", color: "Stealth Black", colorHex: "#1A1816", stock: 15, price: 3499 }
      ],
      specifications: [
        { name: "Material", value: "400 GSM Heavyweight Organic French Terry" },
        { name: "Fit Type", value: "Relaxed Drop-Shoulder Oversized Fit" },
        { name: "Care Instructions", value: "Machine wash cold inside out, hang dry" },
        { name: "Features", value: "Double-needle reinforced seams, custom metal aglets, kangaroo pocket" }
      ],
      images: [
        { url: "/hoddie/Hoodie 5.png", alt: "MST Blockchain Genesis Builder Hoodie - Front View", isPrimary: true },
        { url: "/hoddie/Hoodie 6.png", alt: "MST Blockchain Genesis Builder Hoodie - Detailed Back View", isPrimary: false }
      ]
    },
    {
      name: "MST Blockchain Developer Heavyweight T-Shirt (Stealth Black)",
      slug: "mst-developer-t-shirt-stealth-black",
      sku: "MST-TS-BLK",
      description: "Official MST Blockchain developer t-shirt in signature Stealth Black. Crafted from 240 GSM combed compact cotton for supreme drape, softness, and breathability. Features bold screen-printed typography celebrating high-throughput decentralized computing.",
      category: "apparel",
      brand: "MST Blockchain",
      sellingPrice: 1499,
      referencePrice: 1999,
      costPrice: 550,
      stock: 180,
      status: "published",
      isFeatured: true,
      collectionIds: [colApparelId.toString()],
      tags: ["t-shirt", "tshirt", "apparel", "developer", "stealth-black", "cotton"],
      colors: ["Stealth Black"],
      sizes: ["S", "M", "L", "XL", "XXL"],
      variants: [
        { id: "v_ts_blk_s", sku: "MST-TS-BLK-S", name: "Stealth Black / S", size: "S", color: "Stealth Black", colorHex: "#1A1816", stock: 30, price: 1499 },
        { id: "v_ts_blk_m", sku: "MST-TS-BLK-M", name: "Stealth Black / M", size: "M", color: "Stealth Black", colorHex: "#1A1816", stock: 45, price: 1499 },
        { id: "v_ts_blk_l", sku: "MST-TS-BLK-L", name: "Stealth Black / L", size: "L", color: "Stealth Black", colorHex: "#1A1816", stock: 50, price: 1499 },
        { id: "v_ts_blk_xl", sku: "MST-TS-BLK-XL", name: "Stealth Black / XL", size: "XL", color: "Stealth Black", colorHex: "#1A1816", stock: 35, price: 1499 },
        { id: "v_ts_blk_xxl", sku: "MST-TS-BLK-XXL", name: "Stealth Black / XXL", size: "XXL", color: "Stealth Black", colorHex: "#1A1816", stock: 20, price: 1499 }
      ],
      specifications: [
        { name: "Material", value: "240 GSM 100% Combed Compact Cotton" },
        { name: "Print", value: "High-density soft-feel screen print" },
        { name: "Neckline", value: "1x1 lycra ribbed crew collar (anti-sagging)" }
      ],
      images: [
        { url: "/t-shirts/Tshirt Mokeup Black.png", alt: "MST Developer Heavyweight T-Shirt - Stealth Black Front", isPrimary: true },
        { url: "/t-shirts/Tshirt 3.png", alt: "MST Developer T-Shirt - Front Graphic View", isPrimary: false },
        { url: "/t-shirts/Tshirt 4.png", alt: "MST Developer T-Shirt - Back Graphic Typography", isPrimary: false },
        { url: "/t-shirts/tshirt side angle.png", alt: "MST Developer T-Shirt - Side Profile Angle", isPrimary: false }
      ]
    },
    {
      name: "MST Blockchain Developer Heavyweight T-Shirt (MST Signature Red)",
      slug: "mst-developer-t-shirt-signature-red",
      sku: "MST-TS-RED",
      description: "Official MST Blockchain developer t-shirt in radiant MST Carmine Red. Features high-density white and dark screen-printed architectural graphics highlighting the core consensus engine.",
      category: "apparel",
      brand: "MST Blockchain",
      sellingPrice: 1499,
      referencePrice: 1999,
      costPrice: 550,
      stock: 140,
      status: "published",
      isFeatured: true,
      collectionIds: [colApparelId.toString()],
      tags: ["t-shirt", "tshirt", "apparel", "developer", "signature-red", "cotton"],
      colors: ["MST Red"],
      sizes: ["S", "M", "L", "XL", "XXL"],
      variants: [
        { id: "v_ts_red_s", sku: "MST-TS-RED-S", name: "MST Red / S", size: "S", color: "MST Red", colorHex: "#FF2D2D", stock: 25, price: 1499 },
        { id: "v_ts_red_m", sku: "MST-TS-RED-M", name: "MST Red / M", size: "M", color: "MST Red", colorHex: "#FF2D2D", stock: 35, price: 1499 },
        { id: "v_ts_red_l", sku: "MST-TS-RED-L", name: "MST Red / L", size: "L", color: "MST Red", colorHex: "#FF2D2D", stock: 40, price: 1499 },
        { id: "v_ts_red_xl", sku: "MST-TS-RED-XL", name: "MST Red / XL", size: "XL", color: "MST Red", colorHex: "#FF2D2D", stock: 25, price: 1499 },
        { id: "v_ts_red_xxl", sku: "MST-TS-RED-XXL", name: "MST Red / XXL", size: "XXL", color: "MST Red", colorHex: "#FF2D2D", stock: 15, price: 1499 }
      ],
      specifications: [
        { name: "Material", value: "240 GSM 100% Combed Compact Cotton" },
        { name: "Color", value: "Pantone MST Carmine Red" },
        { name: "Print", value: "High-density crack-resistant screen print" }
      ],
      images: [
        { url: "/t-shirts/Tshirt Mokeup Red.png", alt: "MST Developer T-Shirt - Signature Red Front View", isPrimary: true },
        { url: "/t-shirts/tshirt side angle.png", alt: "MST Developer T-Shirt - Side Angle View", isPrimary: false },
        { url: "/t-shirts/Tshirt 3.png", alt: "MST Developer T-Shirt - Detailed Graphic", isPrimary: false },
        { url: "/t-shirts/Tshirt 4.png", alt: "MST Developer T-Shirt - Back Print Detail", isPrimary: false }
      ]
    },
    {
      name: "MST Blockchain Premium Hard-Shell Travel Suitcase",
      slug: "mst-premium-travel-suitcase",
      sku: "MST-LUG-SUITCASE",
      description: "Engineered for global web3 summits, devcons, and travel. Features a shock-absorbing aerospace-grade polycarbonate hard-shell with custom MST geometric laser embossing, TSA-approved combination lock, 360-degree whisper-quiet Japanese Hinomoto spinner wheels, and expandable water-resistant compartments.",
      category: "bags",
      brand: "MST Blockchain",
      sellingPrice: 6999,
      referencePrice: 9999,
      costPrice: 3200,
      stock: 50,
      status: "published",
      isFeatured: true,
      isLimitedEdition: true,
      collectionIds: [colBagsId.toString()],
      tags: ["suitcase", "luggage", "travel", "bags", "hard-shell", "tsa"],
      colors: ["Matte Obsidian"],
      sizes: ["Cabin 20\"", "Medium 24\"", "Check-in 28\""],
      variants: [
        { id: "v_sc_20", sku: "MST-SC-20", name: "Cabin Size 20\"", size: "Cabin 20\"", color: "Matte Obsidian", colorHex: "#1E1E1E", stock: 25, price: 6999 },
        { id: "v_sc_24", sku: "MST-SC-24", name: "Medium Check-in 24\"", size: "Medium 24\"", color: "Matte Obsidian", colorHex: "#1E1E1E", stock: 15, price: 8499 },
        { id: "v_sc_28", sku: "MST-SC-28", name: "Large Check-in 28\"", size: "Check-in 28\"", color: "Matte Obsidian", colorHex: "#1E1E1E", stock: 10, price: 9999 }
      ],
      specifications: [
        { name: "Shell Material", value: "100% German Bayer Polycarbonate (Scratch-Resistant)" },
        { name: "Wheels", value: "360° Hinomoto Whisper-Quiet Dual Spinner Wheels" },
        { name: "Locking System", value: "Integrated Flush-Mount TSA Combination Lock" },
        { name: "Handle", value: "Aircraft-Grade 3-Stage Telescopic Aluminum Handle" }
      ],
      images: [
        { url: "/suitecase/Suitcase.png", alt: "MST Premium Hard-Shell Travel Suitcase - Front", isPrimary: true },
        { url: "/suitecase/Suitcase all Dairaction  .png", alt: "MST Hard-Shell Travel Suitcase - All Angle Perspective", isPrimary: false }
      ]
    },
    {
      name: "MST Blockchain Heavy-Duty Canvas Tote Bag",
      slug: "mst-heavy-duty-canvas-tote-bag",
      sku: "MST-BG-TOTE",
      description: "The everyday carrier for crypto conferences, laptop transport, and groceries. Built with 16oz ultra-heavy unbleached organic cotton canvas, reinforced cross-stitched handles with double rivets, and an internal zippered valuables pocket.",
      category: "bags",
      brand: "MST Blockchain",
      sellingPrice: 799,
      referencePrice: 1199,
      costPrice: 280,
      stock: 220,
      status: "published",
      isFeatured: true,
      collectionIds: [colBagsId.toString()],
      tags: ["tote", "tote-bag", "canvas", "bags", "organic", "conference"],
      colors: ["Natural Canvas Cream"],
      sizes: ["One Size"],
      variants: [
        { id: "v_tote_std", sku: "MST-TOTE-STD", name: "Standard (16L)", size: "One Size", color: "Natural Cream", colorHex: "#EAE5D9", stock: 220, price: 799 }
      ],
      specifications: [
        { name: "Material", value: "16oz 100% Organic Unbleached Cotton Duck Canvas" },
        { name: "Dimensions", value: "15\" H x 16\" W x 5\" D with 11\" Shoulder Drop" },
        { name: "Capacity", value: "16 Litres (Fits 16\" MacBook Pro comfortably)" },
        { name: "Interior", value: "Zippered security pocket for keys, wallet & phone" }
      ],
      images: [
        { url: "/tote-bag/MST Blockchain Tote Bag Mockup.png", alt: "MST Heavy-Duty Canvas Tote Bag Mockup", isPrimary: true }
      ]
    },
    {
      name: "MST Ecosystem Die-Cut Waterproof Stickers Pack (6-Piece Set)",
      slug: "mst-ecosystem-die-cut-stickers-pack",
      sku: "MST-STK-PACK6",
      description: "Complete 6-piece collector sticker set showcasing the MST Blockchain ecosystem. Includes MST Buddy mascot, BuildOn MST, ChainPay, BridgeKey One Hardware, MST Academy, and Rapidex DEX stickers. High-gloss UV-protected die-cut vinyl built to endure daily laptop and tumbler use.",
      category: "goodies",
      brand: "MST Blockchain",
      sellingPrice: 349,
      referencePrice: 599,
      costPrice: 90,
      stock: 350,
      status: "published",
      isFeatured: true,
      collectionIds: [colGoodiesId.toString()],
      tags: ["stickers", "pack", "goodies", "vinyl", "mascot", "waterproof"],
      colors: ["Multi-color"],
      sizes: ["6-Piece Pack"],
      variants: [
        { id: "v_stk_pack", sku: "MST-STK-SET6", name: "6-Piece Complete Pack", size: "6-Piece Pack", color: "Multi-color", colorHex: "#FF2D2D", stock: 350, price: 349 }
      ],
      specifications: [
        { name: "Material", value: "Heavyweight Die-Cut Vinyl with Matte UV Shield" },
        { name: "Waterproofing", value: "100% Dishwasher & Weatherproof (Residue-free removal)" },
        { name: "Dimensions", value: "Average size: 3\" x 3\" per sticker" }
      ],
      images: [
        { url: "/stickers/Buildon MST.png", alt: "MST Ecosystem Sticker Pack - BuildOn MST", isPrimary: true },
        { url: "/stickers/MST Buddy.png", alt: "MST Buddy Mascot Sticker", isPrimary: false },
        { url: "/stickers/Chainpay Sticker.png", alt: "ChainPay Protocol Sticker", isPrimary: false },
        { url: "/stickers/Bridegeky one Wallet.png", alt: "BridgeKey One Wallet Sticker", isPrimary: false },
        { url: "/stickers/Academy Sticker.png", alt: "MST Academy Sticker", isPrimary: false },
        { url: "/stickers/Rapidex Sticker.png", alt: "Rapidex Protocol Sticker", isPrimary: false }
      ]
    },
    {
      name: "MST Buddy Mascot Official Die-Cut Sticker",
      slug: "mst-buddy-mascot-die-cut-sticker",
      sku: "MST-STK-BUDDY",
      description: "The official adorable MST Blockchain mascot \"MST Buddy\" die-cut laptop sticker. Thick vinyl with protective laminate.",
      category: "goodies",
      brand: "MST Blockchain",
      sellingPrice: 99,
      referencePrice: 149,
      costPrice: 20,
      stock: 400,
      status: "published",
      isFeatured: false,
      collectionIds: [colGoodiesId.toString()],
      tags: ["stickers", "buddy", "mascot", "goodies"],
      colors: ["Full Color"],
      sizes: ["3-inch", "5-inch"],
      variants: [
        { id: "v_stk_bdy_3", sku: "MST-STK-BDY-3", name: "Standard 3-inch", size: "3-inch", color: "Full Color", colorHex: "#FF2D2D", stock: 250, price: 99 },
        { id: "v_stk_bdy_5", sku: "MST-STK-BDY-5", name: "Large 5-inch", size: "5-inch", color: "Full Color", colorHex: "#FF2D2D", stock: 150, price: 149 }
      ],
      specifications: [
        { name: "Material", value: "Weatherproof Scratch-Resistant Vinyl" }
      ],
      images: [
        { url: "/stickers/MST Buddy.png", alt: "MST Buddy Official Mascot Sticker", isPrimary: true }
      ]
    },
    {
      name: "BuildOn MST Official Die-Cut Builder Sticker",
      slug: "buildon-mst-official-builder-sticker",
      sku: "MST-STK-BUILDON",
      description: "Show pride building on high-throughput decentralized infrastructure. The official BuildOn MST laptop badge.",
      category: "goodies",
      brand: "MST Blockchain",
      sellingPrice: 99,
      referencePrice: 149,
      costPrice: 20,
      stock: 450,
      status: "published",
      isFeatured: false,
      collectionIds: [colGoodiesId.toString()],
      tags: ["stickers", "buildon", "developer", "goodies"],
      colors: ["Full Color"],
      sizes: ["3-inch", "5-inch"],
      variants: [
        { id: "v_stk_bld_3", sku: "MST-STK-BLD-3", name: "Standard 3-inch", size: "3-inch", color: "Full Color", colorHex: "#FF2D2D", stock: 300, price: 99 },
        { id: "v_stk_bld_5", sku: "MST-STK-BLD-5", name: "Large 5-inch", size: "5-inch", color: "Full Color", colorHex: "#FF2D2D", stock: 150, price: 149 }
      ],
      specifications: [
        { name: "Material", value: "Weatherproof Scratch-Resistant Vinyl" }
      ],
      images: [
        { url: "/stickers/Buildon MST.png", alt: "BuildOn MST Official Builder Sticker", isPrimary: true }
      ]
    },
    {
      name: "ChainPay Protocol Official Die-Cut Sticker",
      slug: "chainpay-protocol-official-die-cut-sticker",
      sku: "MST-STK-CPAY",
      description: "Official sticker for ChainPay, the high-speed instant settlement crypto payment gateway built on MST.",
      category: "goodies",
      brand: "MST Blockchain",
      sellingPrice: 99,
      referencePrice: 149,
      costPrice: 20,
      stock: 300,
      status: "published",
      isFeatured: false,
      collectionIds: [colGoodiesId.toString()],
      tags: ["stickers", "chainpay", "payments", "goodies"],
      colors: ["Full Color"],
      sizes: ["3-inch", "5-inch"],
      variants: [
        { id: "v_stk_cpy_3", sku: "MST-STK-CPY-3", name: "Standard 3-inch", size: "3-inch", color: "Full Color", colorHex: "#FF2D2D", stock: 200, price: 99 },
        { id: "v_stk_cpy_5", sku: "MST-STK-CPY-5", name: "Large 5-inch", size: "5-inch", color: "Full Color", colorHex: "#FF2D2D", stock: 100, price: 149 }
      ],
      specifications: [
        { name: "Material", value: "Weatherproof Scratch-Resistant Vinyl" }
      ],
      images: [
        { url: "/stickers/Chainpay Sticker.png", alt: "ChainPay Protocol Official Sticker", isPrimary: true }
      ]
    },
    {
      name: "BridgeKey One Hardware Wallet Die-Cut Sticker",
      slug: "bridgekey-one-hardware-wallet-die-cut-sticker",
      sku: "MST-STK-BKEY",
      description: "Official sticker representing BridgeKey One, the ultra-secure cold storage hardware wallet for the MST ecosystem.",
      category: "goodies",
      brand: "MST Blockchain",
      sellingPrice: 99,
      referencePrice: 149,
      costPrice: 20,
      stock: 249,
      status: "published",
      isFeatured: false,
      collectionIds: [colGoodiesId.toString()],
      tags: ["stickers", "bridgekey", "wallet", "security", "goodies"],
      colors: ["Full Color"],
      sizes: ["3-inch", "5-inch"],
      variants: [
        { id: "v_stk_bky_3", sku: "MST-STK-BKEY-3", name: "Standard 3-inch", size: "3-inch", color: "Full Color", colorHex: "#FF2D2D", stock: 150, price: 99 },
        { id: "v_stk_bky_5", sku: "MST-STK-BKEY-5", name: "Large 5-inch", size: "5-inch", color: "Full Color", colorHex: "#FF2D2D", stock: 100, price: 149 }
      ],
      specifications: [
        { name: "Material", value: "Weatherproof Scratch-Resistant Vinyl" }
      ],
      images: [
        { url: "/stickers/Bridegeky one Wallet.png", alt: "BridgeKey One Wallet Official Sticker", isPrimary: true }
      ]
    },
    {
      name: "MST Academy Builder Certification Die-Cut Sticker",
      slug: "mst-academy-builder-certification-sticker",
      sku: "MST-STK-ACAD",
      description: "Official MST Academy sticker. Dedicated to developers, smart contract auditors, and students learning on MST.",
      category: "goodies",
      brand: "MST Blockchain",
      sellingPrice: 99,
      referencePrice: 149,
      costPrice: 20,
      stock: 350,
      status: "published",
      isFeatured: false,
      collectionIds: [colGoodiesId.toString()],
      tags: ["stickers", "academy", "education", "goodies", "smart-contracts"],
      colors: ["Full Color"],
      sizes: ["3-inch", "5-inch"],
      variants: [
        { id: "v_stk_acd_3", sku: "MST-STK-ACD-3", name: "Standard 3-inch", size: "3-inch", color: "Full Color", colorHex: "#FF2D2D", stock: 250, price: 99 },
        { id: "v_stk_acd_5", sku: "MST-STK-ACD-5", name: "Large 5-inch", size: "5-inch", color: "Full Color", colorHex: "#FF2D2D", stock: 100, price: 149 }
      ],
      specifications: [
        { name: "Material", value: "Weatherproof Scratch-Resistant Vinyl" }
      ],
      images: [
        { url: "/stickers/Academy Sticker.png", alt: "MST Academy Official Sticker", isPrimary: true }
      ]
    },
    {
      name: "Rapidex Decentralized Exchange Official Die-Cut Sticker",
      slug: "rapidex-dex-official-die-cut-sticker",
      sku: "MST-STK-RAPIDEX",
      description: "Official sticker for Rapidex, the ultra-fast sub-second settlement decentralized order book exchange on MST.",
      category: "goodies",
      brand: "MST Blockchain",
      sellingPrice: 99,
      referencePrice: 149,
      costPrice: 20,
      stock: 180,
      status: "published",
      isFeatured: false,
      collectionIds: [colGoodiesId.toString()],
      tags: ["stickers", "rapidex", "dex", "goodies", "defi"],
      colors: ["Full Color"],
      sizes: ["3-inch", "5-inch"],
      variants: [
        { id: "v_stk_rpx_3", sku: "MST-STK-RPX-3", name: "Standard 3-inch", size: "3-inch", color: "Full Color", colorHex: "#FF2D2D", stock: 100, price: 99 },
        { id: "v_stk_rpx_5", sku: "MST-STK-RPX-5", name: "Large 5-inch", size: "5-inch", color: "Full Color", colorHex: "#FF2D2D", stock: 80, price: 149 }
      ],
      specifications: [
        { name: "Material", value: "Weatherproof Scratch-Resistant Vinyl" }
      ],
      images: [
        { url: "/stickers/Rapidex Sticker.png", alt: "Rapidex Protocol Official Sticker", isPrimary: true }
      ]
    }
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
  const firstProd = products[1]; // Genesis Hoodie
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
    message: `MST Store database successfully initialized with ${products.length} merchandise products.`,
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
