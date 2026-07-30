import { useAuthStore } from "@/src/store/useAuthStore";
import { Redirect } from "expo-router";

export default function Index() {
  const claims = useAuthStore((state) => state.claims);

  return claims ? (
    <Redirect href="/(drawer)/dashboard" />
  ) : (
    <Redirect href="/(auth)/Login" />
  );
}
