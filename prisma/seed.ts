import { PrismaClient, UserRole } from "@prisma/client";
import {
  testCloudinaryConnection,
  uploadImageToCloudinary,
} from "../src/config/cloudinary";
import { hashPassword } from "../src/utils/auth.helper";

const prisma = new PrismaClient();

// Helper function to generate unique promotion code
function generateUniqueCode(baseCode: string): string {
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${baseCode}-${randomSuffix}`;
}

// Sample image URLs (you can replace these with actual image URLs)
const sampleImages = {
  techConference:
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop&crop=center",
  networking:
    "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=600&fit=crop&crop=center",
  workshop:
    "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop&crop=center",
  musicFestival:
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&crop=center",
  sportsEvent:
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&crop=center",
  artExhibition:
    "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center",
  healthWorkshop:
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&crop=center",
  foodFestival:
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop&crop=center",
};

async function main() {
  console.log("🌱 Starting database seeding...");

  // Test Cloudinary connection first
  await testCloudinaryConnection();

  // Create sample users
  const organizer1 = await prisma.user.upsert({
    where: { email: "organizer1@example.com" },
    update: {},
    create: {
      email: "organizer1@example.com",
      fullName: "John Organizer",
      password: await hashPassword("password123"),
      role: "ORGANIZER",
      points: 0,
    },
  });

  const organizer2 = await prisma.user.upsert({
    where: { email: "organizer2@example.com" },
    update: {},
    create: {
      email: "organizer2@example.com",
      fullName: "Jane Events",
      password: await hashPassword("password123"),
      role: "ORGANIZER",
      points: 0,
    },
  });

  const user1 = await prisma.user.upsert({
    where: { email: "user1@example.com" },
    update: {},
    create: {
      email: "user1@example.com",
      fullName: "Alice Customer",
      password: await hashPassword("password123"),
      role: "CUSTOMER",
      points: 50000,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "user2@example.com" },
    update: {},
    create: {
      email: "user2@example.com",
      fullName: "Bob Customer",
      password: await hashPassword("password123"),
      role: "CUSTOMER",
      points: 100000,
    },
  });

  console.log("✅ Users created");

  // Upload sample images to Cloudinary
  console.log("📸 Uploading images to Cloudinary...");
  const techConferenceImage = await uploadImageToCloudinary(
    sampleImages.techConference,
    "tech-conference-2025"
  );
  const networkingImage = await uploadImageToCloudinary(
    sampleImages.networking,
    "startup-networking-event"
  );
  const workshopImage = await uploadImageToCloudinary(
    sampleImages.workshop,
    "digital-marketing-workshop"
  );
  const musicFestivalImage = await uploadImageToCloudinary(
    sampleImages.musicFestival,
    "music-festival-jakarta"
  );
  const sportsEventImage = await uploadImageToCloudinary(
    sampleImages.sportsEvent,
    "marathon-jakarta"
  );
  const artExhibitionImage = await uploadImageToCloudinary(
    sampleImages.artExhibition,
    "modern-art-exhibition"
  );
  const healthWorkshopImage = await uploadImageToCloudinary(
    sampleImages.healthWorkshop,
    "yoga-wellness-retreat"
  );
  const foodFestivalImage = await uploadImageToCloudinary(
    sampleImages.foodFestival,
    "culinary-festival"
  );

  console.log("✅ Images uploaded to Cloudinary");

  // Create sample promotions first
  const promotion1 = await prisma.promotion.create({
    data: {
      code: generateUniqueCode("EARLY2025"),
      discountPercent: 20,
      validUntil: new Date("2025-07-01T23:59:59Z"),
      maxUses: 50,
      minPurchase: 100000,
      isActive: true,
    },
  });

  const promotion2 = await prisma.promotion.create({
    data: {
      code: generateUniqueCode("STUDENT50"),
      discountPercent: 50,
      validUntil: new Date("2025-07-31T23:59:59Z"),
      maxUses: 20,
      minPurchase: 200000,
      isActive: true,
    },
  });

  const promotion3 = await prisma.promotion.create({
    data: {
      code: generateUniqueCode("FESTIVAL25"),
      discountPercent: 25,
      validUntil: new Date("2025-08-10T23:59:59Z"),
      maxUses: 100,
      minPurchase: 500000,
      isActive: true,
    },
  });

  // Create additional promotions
  const promotion4 = await prisma.promotion.create({
    data: {
      code: generateUniqueCode("NEWUSER15"),
      discountPercent: 15,
      validUntil: new Date("2025-12-31T23:59:59Z"),
      maxUses: 500,
      minPurchase: 100000,
      isActive: true,
    },
  });

  const promotion5 = await prisma.promotion.create({
    data: {
      code: generateUniqueCode("LASTCHANCE40"),
      discountPercent: 40,
      validUntil: new Date("2025-07-18T23:59:59Z"),
      maxUses: 30,
      minPurchase: 250000,
      isActive: true,
    },
  });

  const promotion6 = await prisma.promotion.create({
    data: {
      code: generateUniqueCode("GROUPBUY30"),
      discountPercent: 30,
      validUntil: new Date("2025-08-12T23:59:59Z"),
      maxUses: 200,
      minPurchase: 600000,
      isActive: true,
    },
  });

  const promotion7 = await prisma.promotion.create({
    data: {
      code: generateUniqueCode("EXPIRED10"),
      discountPercent: 10,
      validUntil: new Date("2025-06-20T23:59:59Z"), // Already expired
      maxUses: 100,
      minPurchase: 100000,
      isActive: false,
    },
  });

  const promotion8 = await prisma.promotion.create({
    data: {
      code: generateUniqueCode("VIPACCESS35"),
      discountPercent: 35,
      validUntil: new Date("2025-08-14T23:59:59Z"),
      maxUses: 50,
      minPurchase: 500000,
      isActive: true,
    },
  });

  console.log("✅ Promotions created");

  // Create sample events
  const event1 = await prisma.event.create({
    data: {
      title: "Tech Conference 2025",
      description:
        "A comprehensive technology conference featuring the latest trends in software development, AI, and digital transformation. Join industry leaders and innovators for a full day of learning and networking.",
      category: "TECHNOLOGY",
      location: "Jakarta Convention Center, Jakarta",
      startDate: new Date("2025-07-15T09:00:00Z"),
      endDate: new Date("2025-07-15T17:00:00Z"),
      price: 500000,
      totalSeats: 200,
      availableSeats: 195, // Some seats already booked
      isFree: false,
      status: "UPCOMING",
      image: techConferenceImage,
      tags: ["technology", "conference", "networking", "AI", "software"],
      organizerId: organizer1.id,
      promotionId: promotion1.id,
    },
  });

  const event2 = await prisma.event.create({
    data: {
      title: "Startup Networking Event",
      description:
        "Connect with fellow entrepreneurs, investors, and startup enthusiasts in this exciting networking event. Perfect opportunity to find co-founders, investors, or business partners.",
      category: "BUSINESS",
      location: "WeWork Sudirman, Jakarta",
      startDate: new Date("2025-07-20T18:00:00Z"),
      endDate: new Date("2025-07-20T21:00:00Z"),
      price: 0,
      totalSeats: 50,
      availableSeats: 47, // Some seats already booked
      isFree: true,
      status: "UPCOMING",
      image: networkingImage,
      tags: [
        "startup",
        "networking",
        "business",
        "entrepreneurship",
        "investors",
      ],
      organizerId: organizer2.id,
      // No promotion for free event
    },
  });

  const event3 = await prisma.event.create({
    data: {
      title: "Digital Marketing Workshop",
      description:
        "Learn the latest digital marketing strategies and tools to grow your business online. Covers SEO, social media marketing, content marketing, and paid advertising.",
      category: "EDUCATION",
      location: "Binus University, Jakarta",
      startDate: new Date("2025-08-01T10:00:00Z"),
      endDate: new Date("2025-08-01T16:00:00Z"),
      price: 300000,
      totalSeats: 80,
      availableSeats: 78, // Some seats already booked
      isFree: false,
      status: "UPCOMING",
      image: workshopImage,
      tags: ["marketing", "workshop", "education", "SEO", "social-media"],
      organizerId: organizer1.id,
      promotionId: promotion2.id,
    },
  });

  const event4 = await prisma.event.create({
    data: {
      title: "Music Festival Jakarta",
      description:
        "Experience amazing live performances from local and international artists. Two stages with different genres, food trucks, and an unforgettable atmosphere.",
      category: "ENTERTAINMENT",
      location: "Ancol Beach City, Jakarta",
      startDate: new Date("2025-08-15T16:00:00Z"),
      endDate: new Date("2025-08-15T23:00:00Z"),
      price: 750000,
      totalSeats: 500,
      availableSeats: 485, // Some seats already booked
      isFree: false,
      status: "UPCOMING",
      image: musicFestivalImage,
      tags: ["music", "festival", "entertainment", "live-music", "outdoor"],
      organizerId: organizer2.id,
      promotionId: promotion3.id,
    },
  });

  // Create more events with different statuses
  const event5 = await prisma.event.create({
    data: {
      title: "Jakarta Marathon 2025",
      description:
        "Join thousands of runners in the biggest marathon event in Jakarta. Multiple categories: 5K, 10K, 21K, and 42K. All fitness levels welcome!",
      category: "SPORTS",
      location: "Monas, Jakarta",
      startDate: new Date("2025-07-25T05:00:00Z"),
      endDate: new Date("2025-07-25T12:00:00Z"),
      price: 150000,
      totalSeats: 1000,
      availableSeats: 850,
      isFree: false,
      status: "UPCOMING",
      image: sportsEventImage,
      tags: ["marathon", "running", "sports", "fitness", "health"],
      organizerId: organizer1.id,
      promotionId: promotion4.id,
    },
  });

  const event6 = await prisma.event.create({
    data: {
      title: "Modern Art Exhibition",
      description:
        "Explore contemporary art from emerging Indonesian artists. Interactive installations, paintings, sculptures, and digital art showcases.",
      category: "ART",
      location: "National Gallery, Jakarta",
      startDate: new Date("2025-07-10T10:00:00Z"),
      endDate: new Date("2025-07-10T20:00:00Z"),
      price: 75000,
      totalSeats: 200,
      availableSeats: 180,
      isFree: false,
      status: "ACTIVE", // Currently ongoing
      image: artExhibitionImage,
      tags: ["art", "exhibition", "contemporary", "gallery", "culture"],
      organizerId: organizer2.id,
      promotionId: promotion5.id,
    },
  });

  const event7 = await prisma.event.create({
    data: {
      title: "Yoga & Wellness Retreat",
      description:
        "A peaceful day of yoga, meditation, and wellness activities. Includes healthy meals, wellness workshops, and relaxation sessions.",
      category: "HEALTH",
      location: "Puncak Resort, Bogor",
      startDate: new Date("2025-08-20T08:00:00Z"),
      endDate: new Date("2025-08-20T18:00:00Z"),
      price: 400000,
      totalSeats: 30,
      availableSeats: 25,
      isFree: false,
      status: "UPCOMING",
      image: healthWorkshopImage,
      tags: ["yoga", "wellness", "meditation", "health", "retreat"],
      organizerId: organizer1.id,
      promotionId: promotion6.id,
    },
  });

  const event8 = await prisma.event.create({
    data: {
      title: "Culinary Festival 2025",
      description:
        "Taste the best dishes from top restaurants and street food vendors. Cooking competitions, food workshops, and live cooking demonstrations.",
      category: "FOOD",
      location: "PIK Avenue, Jakarta",
      startDate: new Date("2025-06-20T12:00:00Z"),
      endDate: new Date("2025-06-22T22:00:00Z"),
      price: 100000,
      totalSeats: 300,
      availableSeats: 0, // Sold out
      isFree: false,
      status: "ENDED", // Past event
      image: foodFestivalImage,
      tags: ["food", "culinary", "festival", "cooking", "restaurants"],
      organizerId: organizer2.id,
      promotionId: promotion7.id, // Expired promotion
    },
  });

  console.log("✅ Events created");

  // Create sample transactions with unique constraint checking
  const transactionData = [
    {
      userId: user1.id,
      eventId: event1.id,
      promotionId: promotion1.id,
      totalAmount: 500000,
      pointsUsed: 10000, // Used 10k points (10k IDR value)
      discountAmount: 100000, // 20% discount from promotion
      finalAmount: 390000, // 500k - 10k points - 100k discount
      paymentMethod: "Bank Transfer",
      status: "DONE" as const,
      quantity: 1,
      notes: "Early bird registration",
    },
    {
      userId: user2.id,
      eventId: event2.id,
      totalAmount: 0,
      pointsUsed: 0,
      discountAmount: 0,
      finalAmount: 0,
      status: "DONE" as const,
      quantity: 1,
      notes: "Free event registration",
    },
    {
      userId: user1.id,
      eventId: event3.id,
      promotionId: promotion2.id,
      totalAmount: 300000,
      pointsUsed: 0,
      discountAmount: 150000, // 50% student discount
      finalAmount: 150000,
      paymentMethod: "Credit Card",
      status: "WAITING_PAYMENT" as const,
      paymentDeadline: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      quantity: 1,
      notes: "Student discount applied",
    },
    {
      userId: user2.id,
      eventId: event5.id, // Marathon
      promotionId: promotion4.id,
      totalAmount: 150000,
      pointsUsed: 5000,
      discountAmount: 22500, // 15% new user discount
      finalAmount: 122500, // 150k - 5k points - 22.5k discount
      paymentMethod: "E-Wallet",
      status: "DONE" as const,
      quantity: 1,
      notes: "Marathon registration with new user discount",
    },
    {
      userId: user1.id,
      eventId: event6.id, // Art Exhibition
      promotionId: promotion5.id,
      totalAmount: 75000,
      pointsUsed: 15000,
      discountAmount: 30000, // 40% last chance discount
      finalAmount: 30000, // 75k - 15k points - 30k discount
      paymentMethod: "Bank Transfer",
      status: "DONE" as const,
      quantity: 1,
      paymentProof: "https://example.com/payment-proof-1.jpg",
      notes: "Art exhibition with last chance discount",
    },
    {
      userId: user2.id,
      eventId: event8.id, // Food Festival (ended event)
      totalAmount: 100000,
      pointsUsed: 0,
      discountAmount: 0,
      finalAmount: 100000,
      paymentMethod: "Credit Card",
      status: "DONE" as const,
      quantity: 1,
      notes: "Food festival participation",
    },
    {
      userId: user1.id,
      eventId: event4.id, // Music Festival
      promotionId: promotion3.id,
      totalAmount: 750000,
      pointsUsed: 20000,
      discountAmount: 187500, // 25% festival discount
      finalAmount: 542500, // 750k - 20k points - 187.5k discount
      paymentMethod: "Bank Transfer",
      status: "WAITING_CONFIRMATION" as const,
      paymentDeadline: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago (expired)
      confirmationDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      paymentProof: "https://example.com/payment-proof-2.jpg",
      quantity: 1,
      notes: "Uploaded payment proof, waiting for confirmation",
    },
    {
      userId: user2.id,
      eventId: event7.id, // Yoga & Wellness Retreat
      promotionId: promotion6.id,
      totalAmount: 400000,
      pointsUsed: 10000,
      discountAmount: 120000, // 30% group buy discount
      finalAmount: 270000, // 400k - 10k points - 120k discount
      status: "CANCELLED" as const,
      quantity: 1,
      notes: "Cancelled due to schedule conflict",
    },
    {
      userId: user1.id,
      eventId: event7.id, // Yoga & Wellness Retreat (different user)
      promotionId: promotion6.id,
      totalAmount: 400000,
      pointsUsed: 25000,
      discountAmount: 120000,
      finalAmount: 255000,
      paymentMethod: "E-Wallet",
      status: "REJECTED" as const,
      paymentProof: "https://example.com/payment-proof-3.jpg",
      quantity: 1,
      notes: "Payment proof rejected - blurry image",
    },
    {
      userId: user2.id,
      eventId: event3.id, // Digital Marketing Workshop (different user)
      totalAmount: 300000,
      pointsUsed: 0,
      discountAmount: 0,
      finalAmount: 300000,
      status: "EXPIRED" as const,
      paymentDeadline: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago (expired)
      quantity: 1,
      notes: "Payment deadline expired",
    },
  ];

  // Create transactions with unique constraint checking
  for (const txData of transactionData) {
    const exists = await prisma.transaction.findFirst({
      where: {
        userId: txData.userId,
        eventId: txData.eventId,
      },
    });

    if (!exists) {
      await prisma.transaction.create({ data: txData });
      console.log(`✅ Transaction added: ${txData.notes}`);
    } else {
      console.log(`⏭️ Skipped duplicate transaction: ${txData.notes}`);
    }
  }

  // Create more transactions to test pagination
  const additionalTransactionData = [
    {
      userId: user1.id,
      eventId: event1.id,
      totalAmount: 500000,
      pointsUsed: 5000,
      discountAmount: 0,
      finalAmount: 495000,
      paymentMethod: "Bank Transfer",
      status: "DONE" as const,
      quantity: 1,
      notes: "Additional transaction 1 for testing",
    },
    {
      userId: user1.id,
      eventId: event2.id,
      totalAmount: 0,
      pointsUsed: 0,
      discountAmount: 0,
      finalAmount: 0,
      status: "DONE" as const,
      quantity: 1,
      notes: "Additional transaction 2 for testing",
    },
    {
      userId: user1.id,
      eventId: event3.id,
      totalAmount: 300000,
      pointsUsed: 2000,
      discountAmount: 0,
      finalAmount: 298000,
      paymentMethod: "Credit Card",
      status: "WAITING_PAYMENT" as const,
      quantity: 1,
      notes: "Additional transaction 3 for testing",
      paymentDeadline: new Date(Date.now() + 1 * 60 * 60 * 1000),
    },
    {
      userId: user1.id,
      eventId: event4.id,
      totalAmount: 750000,
      pointsUsed: 15000,
      discountAmount: 0,
      finalAmount: 735000,
      paymentMethod: "E-Wallet",
      status: "DONE" as const,
      quantity: 1,
      notes: "Additional transaction 4 for testing",
    },
    {
      userId: user1.id,
      eventId: event5.id,
      totalAmount: 150000,
      pointsUsed: 3000,
      discountAmount: 0,
      finalAmount: 147000,
      paymentMethod: "Bank Transfer",
      status: "WAITING_CONFIRMATION" as const,
      quantity: 1,
      notes: "Additional transaction 5 for testing",
      paymentProof: "https://example.com/payment-proof-additional.jpg",
    },
    // Additional transactions for user2 to create more diverse data
    {
      userId: user2.id,
      eventId: event1.id, // Tech Conference
      totalAmount: 500000,
      pointsUsed: 20000,
      discountAmount: 0,
      finalAmount: 480000,
      paymentMethod: "Credit Card",
      status: "DONE" as const,
      quantity: 1,
      notes: "User2 Tech Conference registration",
    },
    {
      userId: user2.id,
      eventId: event4.id, // Music Festival
      totalAmount: 750000,
      pointsUsed: 30000,
      discountAmount: 0,
      finalAmount: 720000,
      paymentMethod: "Bank Transfer",
      status: "WAITING_PAYMENT" as const,
      quantity: 1,
      notes: "User2 Music Festival registration",
      paymentDeadline: new Date(Date.now() + 1.5 * 60 * 60 * 1000), // 1.5 hours from now
    },
    {
      userId: user2.id,
      eventId: event6.id, // Art Exhibition
      totalAmount: 75000,
      pointsUsed: 5000,
      discountAmount: 0,
      finalAmount: 70000,
      paymentMethod: "E-Wallet",
      status: "CANCELLED" as const,
      quantity: 1,
      notes: "User2 Art Exhibition - cancelled",
    },
  ];

  // Create additional transactions with unique constraint checking
  for (const txData of additionalTransactionData) {
    const exists = await prisma.transaction.findFirst({
      where: {
        userId: txData.userId,
        eventId: txData.eventId,
      },
    });

    if (!exists) {
      await prisma.transaction.create({ data: txData });
      console.log(`✅ Transaction added: ${txData.notes}`);
    } else {
      console.log(`⏭️ Skipped duplicate transaction: ${txData.notes}`);
    }
  }

  console.log("✅ Transactions created");

  // Create sample reviews
  const review1 = await prisma.review.create({
    data: {
      userId: user1.id,
      eventId: event1.id,
      rating: 5,
      comment:
        "Amazing conference! Learned a lot about the latest tech trends.",
    },
  });

  const review2 = await prisma.review.create({
    data: {
      userId: user2.id,
      eventId: event2.id,
      rating: 4,
      comment: "Great networking opportunity. Met some interesting people.",
    },
  });

  // Additional reviews for other events
  const review3 = await prisma.review.create({
    data: {
      userId: user2.id,
      eventId: event5.id, // Marathon
      rating: 5,
      comment:
        "Well-organized marathon with great support along the route. Definitely joining again next year!",
    },
  });

  const review4 = await prisma.review.create({
    data: {
      userId: user1.id,
      eventId: event6.id, // Art Exhibition
      rating: 4,
      comment:
        "Beautiful art pieces from talented local artists. The interactive installations were particularly impressive.",
    },
  });

  const review5 = await prisma.review.create({
    data: {
      userId: user2.id,
      eventId: event8.id, // Food Festival (ended)
      rating: 5,
      comment:
        "Amazing variety of food! The cooking demonstrations were educational and entertaining.",
    },
  });

  const review6 = await prisma.review.create({
    data: {
      userId: user1.id,
      eventId: event8.id, // Food Festival (another review)
      rating: 4,
      comment:
        "Great atmosphere and delicious food. Slightly crowded but worth the experience.",
    },
  });

  console.log("✅ Reviews created");

  console.log("🎉 Database seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
