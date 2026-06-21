"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function syncUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const existingUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (existingUser) return existingUser;

  const newUser = await prisma.user.create({
    data: {
      clerkId: userId,
      email: clerkUser.emailAddresses[0].emailAddress,
      name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim(),
    },
  });

  return newUser;
}