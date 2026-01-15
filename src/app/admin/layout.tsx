import SessionGuard from "@/components/SessionGuard"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SessionGuard requiredRole="admin">{children}</SessionGuard>
}
