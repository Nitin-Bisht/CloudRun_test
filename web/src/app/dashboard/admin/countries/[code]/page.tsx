import { getCountryByCode } from "@/app/actions/countries"
import CountryEditForm from "../CountryForm"
import { notFound } from "next/navigation"

export default async function AdminCountryEditPage({ params }: { params: { code: string } }) {
    let initialData = null

    // Support creating new via reserved keyword 'new'
    if (params.code !== "new") {
        initialData = await getCountryByCode(params.code)

        if (!initialData) {
            notFound()
        }
    }

    return <CountryEditForm initialData={initialData} />
}
