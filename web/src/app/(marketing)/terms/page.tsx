import { LegalPageFrame } from "@/components/marketing/LegalPageFrame"

const sections = [
    {
        title: "Account Responsibilities",
        paragraphs: [
            "By using XbandGlobal, you agree to provide accurate information and maintain the security of your account credentials.",
            "You are responsible for activity under your account and must use the platform in compliance with applicable laws.",
        ],
    },
    {
        title: "Platform Scope",
        paragraphs: [
            "XbandGlobal provides discovery, comparison, and communication tooling to connect clients with verified service providers.",
            "Feature availability, timelines, and pricing may evolve as the product and coverage expand.",
        ],
    },
    {
        title: "Professional Advice Disclaimer",
        paragraphs: [
            "XbandGlobal is not a law firm and does not provide legal, tax, or regulatory advice.",
            "Users are responsible for independent due diligence and should consult qualified counsel before acting on jurisdictional information.",
        ],
    },
    {
        title: "Changes And Enforcement",
        paragraphs: [
            "We may update these terms to reflect legal, operational, or product changes. Continued use indicates acceptance of updated terms.",
            "Accounts that violate platform rules may be limited or suspended to preserve security and trust.",
        ],
    },
]

export default function TermsPage() {
    return (
        <LegalPageFrame
            title="Terms of Service"
            subtitle="These terms define usage rules, responsibilities, and limitations for access to XbandGlobal services."
            updatedOn="March 6, 2026"
            sections={sections}
        />
    )
}
