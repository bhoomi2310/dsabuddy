import { prisma } from "../config/prismaClient.js";

export const listCompanies = async (req, res) => {
  const take = req.query.take ?? 100;
  const skip = req.query.skip ?? 0;

  const companies = await prisma.company.findMany({
    take,
    skip,
    where: {
      OR: [
        {
          questionCount: {
            gt: 0,
          },
        },
        {
          roundsInfo: {
            not: null,
          },
        },
      ],
    },
    orderBy: [{ name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      questionCount: true,
      logoUrl: true,
      placements: {
        select: {
          eligibleBranches: true,
          minCgpa: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  return res.status(200).json({ companies });
};

export const getCompanyBySlug = async (req, res) => {
  const { slug } = req.params;

  const company = await prisma.company.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      questionCount: true,
      logoUrl: true,
      interviewSets: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          tag: true,
          lastUpdated: true,
          easyCount: true,
          easyTotal: true,
          mediumCount: true,
          mediumTotal: true,
          hardCount: true,
          hardTotal: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      placements: {
        select: {
          role: true,
          ctcLpa: true,
          stipendMonth: true,
          type: true,
          category: true,
          eligibleBranches: true,
          minCgpa: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!company) return res.status(404).json({ error: "Company not found" });
  return res.status(200).json({ company });
};

export const createCompany = async (req, res) => {
  const company = await prisma.company.create({
    data: req.body,
    select: {
      id: true,
      name: true,
      slug: true,
      questionCount: true,
      logoUrl: true,
      createdAt: true,
    },
  });

  return res.status(201).json({ company });
};

export const updateCompany = async (req, res) => {
  const { id } = req.params;

  const company = await prisma.company.update({
    where: { id },
    data: req.body,
    select: {
      id: true,
      name: true,
      slug: true,
      questionCount: true,
      logoUrl: true,
      updatedAt: true,
    },
  });

  return res.status(200).json({ company });
};

export const deleteCompany = async (req, res) => {
  const { id } = req.params;
  await prisma.company.delete({ where: { id } });
  return res.status(204).send();
};

export const listCompanyQuestions = async (req, res) => {
  const { slug } = req.params;

  const company = await prisma.company.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!company) return res.status(404).json({ error: "Company not found" });

  const companyQuestions = await prisma.companyQuestion.findMany({
    where: { companyId: company.id },
    orderBy: [{ order: "asc" }],
    select: {
      companyId: true,
      questionId: true,
      frequency: true,
      solved: true,
      order: true,
      question: {
        select: {
          id: true,
          title: true,
          displayName: true,
          difficulty: true,
          leetcodeUrl: true,
          tags: {
            select: {
              tag: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return res.status(200).json({ companyQuestions });
};

export const upsertCompanyQuestion = async (req, res) => {
  const { companyId, questionId } = req.params;

  const record = await prisma.companyQuestion.upsert({
    where: {
      companyId_questionId: { companyId, questionId },
    },
    create: { companyId, questionId, ...req.body },
    update: { ...req.body },
    select: {
      companyId: true,
      questionId: true,
      frequency: true,
      solved: true,
      order: true,
    },
  });

  return res.status(200).json({ companyQuestion: record });
};

export const deleteCompanyQuestion = async (req, res) => {
  const { companyId, questionId } = req.params;
  await prisma.companyQuestion.delete({
    where: { companyId_questionId: { companyId, questionId } },
  });
  return res.status(204).send();
};

