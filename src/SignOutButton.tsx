import { useClerk, useAuth } from "@clerk/clerk-react";

export function SignOutButton() {
  const { isSignedIn } = useAuth();
  const { signOut } = useClerk();

  if (!isSignedIn) {
    return null;
  }

  return (
    <button
      className="px-4 py-2 rounded-xl text-sm font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors"
      onClick={() => void signOut()}
    >
      Sign out
    </button>
  );
}
