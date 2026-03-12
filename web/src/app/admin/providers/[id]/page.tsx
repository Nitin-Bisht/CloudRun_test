import { redirect } from "next/navigation"

export default function AdminProviderDetailRedirectPage({ params }: { params: { id: string } }) {
    redirect(`/dashboard/admin/providers/${params.id}`)
}
