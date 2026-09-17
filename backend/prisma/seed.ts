/**
 * prisma/seed.ts
 * ──────────────────────────────────────────────────────────────────────────
 * Development seed data for CRUX × PERIZIA platform.
 *
 * Seeds:
 *   PERIZIA:
 *     - 1 active Perizia edition (2025)
 *     - 4 Perizia days
 *     - 4 venues
 *     - 8 workshops (2 per day)
 *     - 2 scanner stations per type
 *
 *   CRUX:
 *     - 2 editions (2024 archived, 2025 active)
 *     - Several events, posters, galleries, gallery items, videos, announcements
 *
 * IMPORTANT:
 *   - NO real participants
 *   - NO real payments
 *   - NO real QR tokens
 *   - NO real credentials
 *   - All data is obviously fictional / test data
 */

import { PrismaClient, WorkshopStatus, ScannerStationType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // ── Clean existing seed data (idempotent) ─────────────────────────────────
  // Order matters: delete children before parents
  await prisma.foodCollection.deleteMany();
  await prisma.workshopAttendance.deleteMany();
  await prisma.workshopRegistration.deleteMany();
  await prisma.conferenceCheckIn.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.qrCredential.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.participant.deleteMany();
  await prisma.workshop.deleteMany();
  await prisma.periziaDay.deleteMany();
  await prisma.periziaEdition.deleteMany();
  await prisma.scannerStation.deleteMany();
  await prisma.cruxGalleryItem.deleteMany();
  await prisma.cruxGallery.deleteMany();
  await prisma.cruxPoster.deleteMany();
  await prisma.cruxEvent.deleteMany();
  await prisma.cruxVideo.deleteMany();
  await prisma.cruxAnnouncement.deleteMany();
  await prisma.cruxEdition.deleteMany();
  await prisma.mediaAsset.deleteMany();
  await prisma.venue.deleteMany();
  console.log("  ✓ Cleared existing seed data");

  // ═══════════════════════════════════════════════════════════════════════════
  // VENUES
  // ═══════════════════════════════════════════════════════════════════════════

  const mainAuditorium = await prisma.venue.create({
    data: {
      name: "Main Auditorium",
      address: "Academic Block, Ground Floor",
      description: "Main conference hall — 800 seats",
      googleMapsUrl: "https://maps.google.com/?q=Main+Auditorium",
    },
  });

  const seminarHall1 = await prisma.venue.create({
    data: {
      name: "Seminar Hall 1",
      address: "Academic Block A, First Floor",
      description: "Seminar hall — 120 seats",
    },
  });

  const seminarHall2 = await prisma.venue.create({
    data: {
      name: "Seminar Hall 2",
      address: "Academic Block A, Second Floor",
      description: "Seminar hall — 120 seats",
    },
  });

  const labBlock = await prisma.venue.create({
    data: {
      name: "Computer Lab Block",
      address: "Academic Block B, Third Floor",
      description: "Computer labs — 60 workstations",
    },
  });

  const openAirTheatre = await prisma.venue.create({
    data: {
      name: "Open Air Theatre",
      address: "Central Lawn, Campus",
      description: "Open-air stage for cultural performances",
      googleMapsUrl: "https://maps.google.com/?q=Open+Air+Theatre",
    },
  });

  console.log("  ✓ Venues created");

  // ═══════════════════════════════════════════════════════════════════════════
  // SCANNER STATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  await prisma.scannerStation.createMany({
    data: [
      { name: "AUD-01", type: ScannerStationType.CONFERENCE, location: "Main Auditorium — Left Entrance", isActive: true },
      { name: "AUD-02", type: ScannerStationType.CONFERENCE, location: "Main Auditorium — Right Entrance", isActive: true },
      { name: "WS-01",  type: ScannerStationType.WORKSHOP,   location: "Seminar Hall 1 — Entry", isActive: true },
      { name: "WS-02",  type: ScannerStationType.WORKSHOP,   location: "Seminar Hall 2 — Entry", isActive: true },
      { name: "FOOD-01", type: ScannerStationType.FOOD,      location: "Dining Hall — Counter 1", isActive: true },
      { name: "FOOD-02", type: ScannerStationType.FOOD,      location: "Dining Hall — Counter 2", isActive: true },
      { name: "HELP-01", type: ScannerStationType.HELP_DESK, location: "Main Foyer — Registration Desk", isActive: true },
    ],
  });
  console.log("  ✓ Scanner stations created");

  // ═══════════════════════════════════════════════════════════════════════════
  // PERIZIA 2025 EDITION
  // ═══════════════════════════════════════════════════════════════════════════

  const perizia2025 = await prisma.periziaEdition.create({
    data: {
      name: "PERIZIA 2025",
      year: 2025,
      slug: "perizia-2025",
      description:
        "PERIZIA 2025 — Annual Academic Fest. Four days of workshops, talks, and competitions.",
      startDate: new Date("2025-11-20"),
      endDate: new Date("2025-11-23"),
      isActive: true,
      maxParticipants: 500,
    },
  });
  console.log("  ✓ PERIZIA 2025 edition created");

  // ── Perizia Days ───────────────────────────────────────────────────────────

  const [day1, day2, day3, day4] = await Promise.all([
    prisma.periziaDay.create({
      data: {
        editionId: perizia2025.id,
        dayNumber: 1,
        date: new Date("2025-11-20"),
        name: "Day 1 — Inauguration & AI/ML",
      },
    }),
    prisma.periziaDay.create({
      data: {
        editionId: perizia2025.id,
        dayNumber: 2,
        date: new Date("2025-11-21"),
        name: "Day 2 — Web & Cloud",
      },
    }),
    prisma.periziaDay.create({
      data: {
        editionId: perizia2025.id,
        dayNumber: 3,
        date: new Date("2025-11-22"),
        name: "Day 3 — Cybersecurity & Data",
      },
    }),
    prisma.periziaDay.create({
      data: {
        editionId: perizia2025.id,
        dayNumber: 4,
        date: new Date("2025-11-23"),
        name: "Day 4 — Project Expo & Valediction",
      },
    }),
  ]);
  console.log("  ✓ 4 PERIZIA days created");

  // ── Workshops — 2 per day ─────────────────────────────────────────────────

  await prisma.workshop.createMany({
    data: [
      // Day 1
      {
        editionId: perizia2025.id,
        periziaDayId: day1.id,
        venueId: seminarHall1.id,
        title: "Introduction to Machine Learning",
        slug: "intro-machine-learning",
        description: "Hands-on introduction to supervised and unsupervised ML using Python and scikit-learn.",
        speaker: "Dr. Ananya Krishnamurthy",
        startTime: new Date("2025-11-20T10:00:00"),
        endTime: new Date("2025-11-20T13:00:00"),
        capacity: 60,
        status: WorkshopStatus.UPCOMING,
      },
      {
        editionId: perizia2025.id,
        periziaDayId: day1.id,
        venueId: seminarHall2.id,
        title: "Generative AI & Prompt Engineering",
        slug: "generative-ai-prompt-engineering",
        description: "Explore large language models, prompt design, and real-world GenAI applications.",
        speaker: "Mr. Rohan Desai",
        startTime: new Date("2025-11-20T14:00:00"),
        endTime: new Date("2025-11-20T17:00:00"),
        capacity: 60,
        status: WorkshopStatus.UPCOMING,
      },

      // Day 2
      {
        editionId: perizia2025.id,
        periziaDayId: day2.id,
        venueId: seminarHall1.id,
        title: "Full-Stack Web Development with Next.js",
        slug: "fullstack-nextjs",
        description: "Build a full-stack web application with Next.js, TypeScript, and PostgreSQL.",
        speaker: "Ms. Priya Nair",
        startTime: new Date("2025-11-21T10:00:00"),
        endTime: new Date("2025-11-21T13:00:00"),
        capacity: 60,
        status: WorkshopStatus.UPCOMING,
      },
      {
        editionId: perizia2025.id,
        periziaDayId: day2.id,
        venueId: labBlock.id,
        title: "Cloud Computing & AWS Fundamentals",
        slug: "cloud-computing-aws",
        description: "Introduction to cloud architecture, AWS core services, and serverless computing.",
        speaker: "Mr. Karthik Rajan",
        startTime: new Date("2025-11-21T14:00:00"),
        endTime: new Date("2025-11-21T17:00:00"),
        capacity: 50,
        status: WorkshopStatus.UPCOMING,
      },

      // Day 3
      {
        editionId: perizia2025.id,
        periziaDayId: day3.id,
        venueId: seminarHall1.id,
        title: "Ethical Hacking & Penetration Testing",
        slug: "ethical-hacking",
        description: "Practical penetration testing methodologies, tools, and responsible disclosure.",
        speaker: "Ms. Shalini Mehta",
        startTime: new Date("2025-11-22T10:00:00"),
        endTime: new Date("2025-11-22T13:00:00"),
        capacity: 60,
        status: WorkshopStatus.UPCOMING,
      },
      {
        editionId: perizia2025.id,
        periziaDayId: day3.id,
        venueId: labBlock.id,
        title: "Data Engineering with Apache Spark",
        slug: "data-engineering-spark",
        description: "Large-scale data processing pipelines with Apache Spark and PySpark.",
        speaker: "Dr. Vikram Patel",
        startTime: new Date("2025-11-22T14:00:00"),
        endTime: new Date("2025-11-22T17:00:00"),
        capacity: 40,
        status: WorkshopStatus.UPCOMING,
      },

      // Day 4
      {
        editionId: perizia2025.id,
        periziaDayId: day4.id,
        venueId: mainAuditorium.id,
        title: "Research Paper Writing & Publication",
        slug: "research-paper-writing",
        description: "Academic writing workshop — how to structure, submit, and present research papers.",
        speaker: "Prof. Meera Subramaniam",
        startTime: new Date("2025-11-23T10:00:00"),
        endTime: new Date("2025-11-23T12:00:00"),
        capacity: 200,
        status: WorkshopStatus.UPCOMING,
      },
      {
        editionId: perizia2025.id,
        periziaDayId: day4.id,
        venueId: seminarHall2.id,
        title: "Blockchain & Decentralised Applications",
        slug: "blockchain-dapps",
        description: "From smart contracts to DApps — understanding the Web3 stack.",
        speaker: "Mr. Aditya Sharma",
        startTime: new Date("2025-11-23T14:00:00"),
        endTime: new Date("2025-11-23T17:00:00"),
        capacity: 60,
        status: WorkshopStatus.UPCOMING,
      },
    ],
  });
  console.log("  ✓ 8 workshops created (2 per day)");

  // ═══════════════════════════════════════════════════════════════════════════
  // CRUX EDITIONS
  // ═══════════════════════════════════════════════════════════════════════════

  const crux2024 = await prisma.cruxEdition.create({
    data: {
      name: "CRUX 2024",
      year: 2024,
      slug: "crux-2024",
      description: "CRUX 2024 — Annual Cultural Fest. A celebration of art, music, and talent.",
      startDate: new Date("2024-03-10"),
      endDate: new Date("2024-03-12"),
      isActive: false,
    },
  });

  const crux2025 = await prisma.cruxEdition.create({
    data: {
      name: "CRUX 2025",
      year: 2025,
      slug: "crux-2025",
      description: "CRUX 2025 — Annual Cultural Fest. Three nights of music, dance, drama, and more.",
      startDate: new Date("2025-09-18"),
      endDate: new Date("2025-09-20"),
      isActive: true,
    },
  });
  console.log("  ✓ CRUX editions created (2024 + 2025)");

  // ── Media Assets (placeholder metadata — no actual files) ─────────────────

  const posterMedia1 = await prisma.mediaAsset.create({
    data: {
      fileName: "crux-2025-main-poster.webp",
      originalName: "CRUX 2025 Main Poster.webp",
      mediaType: "IMAGE",
      mimeType: "image/webp",
      storageProvider: "R2",
      storageKey: "crux/2025/posters/main-poster.webp",
      publicUrl: "https://cdn.example.com/crux/2025/posters/main-poster.webp",
      fileSize: 245000,
      altText: "CRUX 2025 Official Poster",
    },
  });

  const posterMedia2 = await prisma.mediaAsset.create({
    data: {
      fileName: "crux-2025-night1-poster.webp",
      originalName: "CRUX 2025 Night 1 Poster.webp",
      mediaType: "IMAGE",
      mimeType: "image/webp",
      storageProvider: "R2",
      storageKey: "crux/2025/posters/night1-poster.webp",
      publicUrl: "https://cdn.example.com/crux/2025/posters/night1-poster.webp",
      fileSize: 198000,
      altText: "CRUX 2025 Night 1 — Battle of Bands",
    },
  });

  const galleryMedia1 = await prisma.mediaAsset.create({
    data: {
      fileName: "crux-2024-gallery-01.webp",
      originalName: "Opening Ceremony 2024.webp",
      mediaType: "IMAGE",
      mimeType: "image/webp",
      storageProvider: "R2",
      storageKey: "crux/2024/gallery/opening-ceremony-01.webp",
      publicUrl: "https://cdn.example.com/crux/2024/gallery/opening-ceremony-01.webp",
      fileSize: 312000,
      altText: "CRUX 2024 Opening Ceremony",
    },
  });

  const galleryMedia2 = await prisma.mediaAsset.create({
    data: {
      fileName: "crux-2024-gallery-02.webp",
      originalName: "Dance Performance 2024.webp",
      mediaType: "IMAGE",
      mimeType: "image/webp",
      storageProvider: "R2",
      storageKey: "crux/2024/gallery/dance-performance-01.webp",
      publicUrl: "https://cdn.example.com/crux/2024/gallery/dance-performance-01.webp",
      fileSize: 278000,
      altText: "CRUX 2024 Dance Performance",
    },
  });

  console.log("  ✓ Media asset metadata created");

  // ── CRUX 2025 Events ──────────────────────────────────────────────────────

  await prisma.cruxEvent.createMany({
    data: [
      {
        editionId: crux2025.id,
        title: "Battle of Bands",
        slug: "battle-of-bands",
        description: "Inter-college band competition. Rock, jazz, folk, and everything in between.",
        category: "Music",
        eventDate: new Date("2025-09-18"),
        startTime: new Date("2025-09-18T19:00:00"),
        endTime: new Date("2025-09-18T22:00:00"),
        venueId: openAirTheatre.id,
        displayOrder: 1,
        published: true,
      },
      {
        editionId: crux2025.id,
        title: "Nukkad Natak",
        slug: "nukkad-natak",
        description: "Street play competition — social themes, powerful performances.",
        category: "Drama",
        eventDate: new Date("2025-09-19"),
        startTime: new Date("2025-09-19T17:00:00"),
        endTime: new Date("2025-09-19T20:00:00"),
        venueId: openAirTheatre.id,
        displayOrder: 2,
        published: true,
      },
      {
        editionId: crux2025.id,
        title: "Solo Dance Championship",
        slug: "solo-dance",
        description: "Classical, western, folk — all dance forms welcome.",
        category: "Dance",
        eventDate: new Date("2025-09-20"),
        startTime: new Date("2025-09-20T16:00:00"),
        endTime: new Date("2025-09-20T20:00:00"),
        venueId: mainAuditorium.id,
        displayOrder: 3,
        published: true,
      },
      {
        editionId: crux2025.id,
        title: "Fine Arts Exhibition",
        slug: "fine-arts-exhibition",
        description: "Painting, sculpture, digital art, and photography exhibition.",
        category: "Visual Arts",
        displayOrder: 4,
        published: false, // draft
      },
    ],
  });
  console.log("  ✓ CRUX 2025 events created");

  // ── CRUX Posters ─────────────────────────────────────────────────────────

  await prisma.cruxPoster.createMany({
    data: [
      {
        editionId: crux2025.id,
        title: "CRUX 2025 — Official Poster",
        description: "The official launch poster for CRUX 2025.",
        mediaId: posterMedia1.id,
        displayOrder: 1,
        published: true,
      },
      {
        editionId: crux2025.id,
        title: "Night 1 — Battle of Bands",
        description: "Poster for the opening night band competition.",
        mediaId: posterMedia2.id,
        displayOrder: 2,
        published: true,
      },
    ],
  });
  console.log("  ✓ CRUX 2025 posters created");

  // ── CRUX Galleries ────────────────────────────────────────────────────────

  const gallery2024 = await prisma.cruxGallery.create({
    data: {
      editionId: crux2024.id,
      title: "CRUX 2024 — Highlights",
      description: "Best moments from CRUX 2024",
      coverMediaId: galleryMedia1.id,
      published: true,
    },
  });

  await prisma.cruxGalleryItem.createMany({
    data: [
      {
        galleryId: gallery2024.id,
        mediaId: galleryMedia1.id,
        caption: "Opening Ceremony — Light & Sound Show",
        displayOrder: 1,
      },
      {
        galleryId: gallery2024.id,
        mediaId: galleryMedia2.id,
        caption: "Dance Performance — Group Fusion",
        displayOrder: 2,
      },
    ],
  });
  console.log("  ✓ CRUX galleries and items created");

  // ── CRUX Videos ──────────────────────────────────────────────────────────

  await prisma.cruxVideo.createMany({
    data: [
      {
        editionId: crux2024.id,
        title: "CRUX 2024 Official Aftermovie",
        description: "Relive the best moments of CRUX 2024.",
        youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        youtubeVideoId: "dQw4w9WgXcQ",
        category: "Aftermovie",
        displayOrder: 1,
        published: true,
      },
      {
        editionId: crux2025.id,
        title: "CRUX 2025 — Promo Teaser",
        description: "Get ready for CRUX 2025. Coming September 2025.",
        youtubeUrl: "https://www.youtube.com/watch?v=9bZkp7q19f0",
        youtubeVideoId: "9bZkp7q19f0",
        category: "Promo",
        displayOrder: 1,
        published: true,
      },
    ],
  });
  console.log("  ✓ CRUX videos created");

  // ── CRUX Announcements ────────────────────────────────────────────────────

  await prisma.cruxAnnouncement.createMany({
    data: [
      {
        editionId: crux2025.id,
        title: "CRUX 2025 Registration Now Open",
        content:
          "Registrations for CRUX 2025 events are now open. Visit the Events page to see all competitions and sign up. Limited spots available!",
        published: true,
        publishAt: new Date("2025-08-01"),
        displayOrder: 1,
      },
      {
        editionId: crux2025.id,
        title: "Venue Update — Dance Events",
        content:
          "Solo Dance Championship and Group Dance events will be held at the Main Auditorium this year. Please note the updated venue.",
        published: true,
        publishAt: new Date("2025-08-15"),
        displayOrder: 2,
      },
      {
        editionId: crux2025.id,
        title: "Coming Soon — CRUX 2025 Guest Artist Announcement",
        content: "Stay tuned for an exciting announcement. The CRUX 2025 headline artist will be revealed on September 1st.",
        published: false, // scheduled
        publishAt: new Date("2025-09-01"),
        displayOrder: 3,
      },
    ],
  });
  console.log("  ✓ CRUX announcements created");

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log("\n✅ Seed complete!");
  console.log("   Venues:            5");
  console.log("   Scanner stations:  7");
  console.log("   PERIZIA editions:  1 (2025, active)");
  console.log("   PERIZIA days:      4");
  console.log("   Workshops:         8 (2 per day)");
  console.log("   CRUX editions:     2 (2024, 2025)");
  console.log("   CRUX events:       4");
  console.log("   CRUX posters:      2");
  console.log("   CRUX galleries:    1 (with 2 items)");
  console.log("   CRUX videos:       2");
  console.log("   CRUX announcements: 3");
  console.log("   Media assets:      4 (metadata only, no binary data)");
  console.log("\n   ⚠  No real participants, payments, or QR credentials seeded.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
