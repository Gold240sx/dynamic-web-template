import UserProfileClient from "@/components/pages/users/user-profile-client";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  return <UserProfileClient userId={userId} />;
}
