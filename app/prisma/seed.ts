import { Prisma, PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const main = async () => {
  let userBody: Prisma.UserCreateInput;
  userBody = {
    userName: 'admin',
    imageUrl: '/takt.png',
  };

  const user = await prisma.user.upsert({
    where: { userName: 'admin' },
    update: {},
    create: userBody,
  });

  let postBody: Prisma.PostCreateInput;
  for (let i = 0; i < 20; i++) {
    postBody = {
      title: `title-${i}`,
      content: `content-${i}`,
      author: { connect: { id: user.id } },
    };
    await prisma.post.upsert({
      where: { id: i },
      update: {},
      create: postBody,
    });
  }
};

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
