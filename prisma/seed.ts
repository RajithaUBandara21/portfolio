import "dotenv/config";
import argon2 from "argon2";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

async function seedAdminUser() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn(
      "Skipping admin user seed: SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set in .env",
    );
    return;
  }

  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

  await db.user.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash },
  });

  console.log(`Seeded admin user: ${email}`);
}

async function seedProfile() {
  const existing = await db.profile.findFirst();
  if (existing) return;

  const profile = await db.profile.create({
    data: {
      fullName: "[Your Name]",
      headline: "[Your Professional Headline — e.g. Software Engineer]",
      bio: "TODO: Replace this placeholder bio in the admin CMS with a real summary of your engineering background.",
      availability: "[Update your availability status]",
      yearsExperience: null,
    },
  });

  await db.socialLink.createMany({
    data: [
      {
        profileId: profile.id,
        platform: "github",
        url: "https://github.com/your-username",
        order: 0,
      },
      {
        profileId: profile.id,
        platform: "linkedin",
        url: "https://linkedin.com/in/your-username",
        order: 1,
      },
    ],
  });

  console.log("Seeded placeholder profile");
}

async function seedTechnologies() {
  const technologies = [
    "TypeScript",
    "JavaScript",
    "Python",
    "Java",
    "React",
    "Next.js",
    "Node.js",
    "PostgreSQL",
    "Docker",
    "Kubernetes",
  ];

  for (const name of technologies) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    await db.technology.upsert({
      where: { name },
      update: {},
      create: { name, slug },
    });
  }

  console.log(`Seeded ${technologies.length} technologies`);
}

async function seedSkill() {
  const existing = await db.skill.findUnique({ where: { slug: "sample-skill-typescript" } });
  if (existing) return;

  await db.skill.create({
    data: {
      name: "[Sample Skill] TypeScript",
      slug: "sample-skill-typescript",
      category: "LANGUAGE",
      level: "PROFICIENT",
      description: "TODO: describe your real proficiency and replace this sample skill.",
    },
  });

  console.log("Seeded placeholder skill");
}

async function seedProject() {
  const existing = await db.project.findUnique({ where: { slug: "sample-project" } });
  if (existing) return;

  const project = await db.project.create({
    data: {
      slug: "sample-project",
      title: "[Your Project Name]",
      shortDescription: "[One-sentence summary of what this project does and why it matters]",
      fullDescription: "TODO: Replace with a real, detailed project description.",
      categories: ["SOFTWARE_ENGINEERING", "BACKEND"],
      status: "IN_PROGRESS",
      contentStatus: "DRAFT",
      featured: false,
      problem: "[Describe the problem this project solved]",
      solution: "[Describe your solution and approach]",
      architectureNotes: "[Describe the system architecture]",
      challenges: "[Describe real engineering challenges you faced]",
      results: "[Describe real, measured outcomes — never invent numbers]",
      lessons: "[Describe what you learned]",
      futureImprovements: "[Describe planned future work]",
      reliabilityNotes: "[Describe failure handling, retries, timeouts, health checks]",
      securityNotes: "[Describe authentication, authorization, input validation]",
      observabilityNotes: "[Describe logging, metrics, tracing, dashboards]",
      testingNotes: "[Describe unit, integration, e2e, and load testing coverage]",
    },
  });

  const nodeApi = await db.architectureNode.create({
    data: {
      projectId: project.id,
      key: "api",
      label: "API Service",
      kind: "SERVICE",
      technology: "Node.js",
      responsibility: "[Describe this service's responsibility]",
      interfaces: ["REST /api/example"],
      dependencies: ["database"],
      positionX: 0,
      positionY: 0,
    },
  });

  const nodeDb = await db.architectureNode.create({
    data: {
      projectId: project.id,
      key: "database",
      label: "PostgreSQL",
      kind: "DATABASE",
      technology: "PostgreSQL",
      responsibility: "[Describe what data this stores]",
      interfaces: [],
      dependencies: [],
      positionX: 300,
      positionY: 0,
    },
  });

  await db.architectureEdge.create({
    data: {
      projectId: project.id,
      sourceId: nodeApi.id,
      targetId: nodeDb.id,
      label: "reads/writes",
      dataFlow: "[Describe what data flows across this edge]",
    },
  });

  await db.projectDecision.create({
    data: {
      projectId: project.id,
      title: "[Sample technical decision]",
      reason: "[Why this decision was made]",
      alternatives: "[What alternatives were considered]",
      tradeoffs: "[What tradeoffs were accepted]",
    },
  });

  console.log("Seeded placeholder project with sample architecture diagram");
}

async function seedResumeEntities() {
  const experience = await db.experience.findFirst();
  if (!experience) {
    await db.experience.create({
      data: {
        company: "[Company Name]",
        role: "[Your Role]",
        startDate: new Date("2024-01-01"),
        current: true,
        summary: "TODO: Replace with a real summary of your responsibilities.",
        highlights: [],
        technologies: [],
        contentStatus: "DRAFT",
      },
    });
  }

  const education = await db.education.findFirst();
  if (!education) {
    await db.education.create({
      data: {
        institution: "[Institution Name]",
        degree: "[Degree]",
        startDate: new Date("2020-01-01"),
        contentStatus: "DRAFT",
      },
    });
  }

  const certification = await db.certification.findFirst();
  if (!certification) {
    await db.certification.create({
      data: {
        name: "[Certification Name]",
        issuer: "[Issuing Organization]",
        contentStatus: "DRAFT",
      },
    });
  }

  console.log("Seeded placeholder experience, education, certification");
}

async function seedBlog() {
  const tagNames = ["engineering", "notes"];
  const tags = [];
  for (const name of tagNames) {
    const tag = await db.blogTag.upsert({
      where: { name },
      update: {},
      create: { name, slug: name },
    });
    tags.push(tag);
  }

  const existing = await db.blogPost.findUnique({ where: { slug: "sample-post" } });
  if (!existing) {
    await db.blogPost.create({
      data: {
        slug: "sample-post",
        title: "[Sample Blog Post — Replace Me]",
        excerpt: "TODO: Replace with a real excerpt.",
        contentMdx: "TODO: Replace with real MDX content.\n\nThis post supports **Markdown**.",
        contentStatus: "DRAFT",
        readingTimeMin: 1,
        tags: { create: tags.map((tag) => ({ tagId: tag.id })) },
      },
    });
  }

  console.log("Seeded placeholder blog post and tags");
}

async function seedActivity() {
  const existing = await db.activity.findFirst();
  if (existing) return;

  await db.activity.create({
    data: {
      title: "[Sample Talk/Activity]",
      type: "talk",
      description: "TODO: Replace with a real description.",
      date: new Date(),
      contentStatus: "DRAFT",
    },
  });

  console.log("Seeded placeholder activity");
}

async function main() {
  await seedAdminUser();
  await seedProfile();
  await seedTechnologies();
  await seedSkill();
  await seedProject();
  await seedResumeEntities();
  await seedBlog();
  await seedActivity();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
