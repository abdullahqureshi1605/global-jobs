import bcrypt from "bcryptjs";

export async function verifyPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  if (!password || !passwordHash) {
    return false;
  }

  try {
    return await bcrypt.compare(
      password,
      passwordHash
    );
  } catch {
    return false;
  }
}
