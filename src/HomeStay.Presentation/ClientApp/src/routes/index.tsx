import { createFileRoute } from "@tanstack/react-router";

import { LoginScreen } from "@/features/auth/pages/LoginPage";

export const Route = createFileRoute("/")({ component: LoginScreen });
