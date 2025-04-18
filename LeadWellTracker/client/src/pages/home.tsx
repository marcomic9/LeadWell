import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { User } from "@shared/schema";

export default function Home() {
  const { data: user, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: ["/api/users/1"], // In a real app, this would use the authenticated user's ID
  });

  return (
    <Layout user={user}>
      <Dashboard />
    </Layout>
  );
}
