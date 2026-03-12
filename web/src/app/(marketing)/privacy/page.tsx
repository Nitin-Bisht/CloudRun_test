import { LegalPageFrame } from "@/components/marketing/LegalPageFrame"

const sections = [
    {
        title: "Data We Collect",
        paragraphs: [
            "XbandGlobal collects account, authentication, and usage data needed to deliver jurisdiction discovery, provider matching, and secure communication features.",
            "This can include identity details you submit, session metadata, and product interaction logs used for platform operations.",
        ],
    },
    {
        title: "How Data Is Used",
        paragraphs: [
            "We use collected data to provide core functionality, improve product performance, prevent abuse, and support customer requests.",
            "Data is used for service reliability and quality assurance, not for selling personal information.",
        ],
    },
    {
        title: "Sharing And Security",
        paragraphs: [
            "Data is processed with trusted infrastructure providers under contractual safeguards and controlled access policies.",
            "We apply technical and organizational controls to reduce unauthorized access and protect account integrity.",
        ],
    },
    {
        title: "Your Controls",
        paragraphs: [
            "You can request updates or deletion of account information where applicable by contacting support.",
            "If policy terms change, updated language will be reflected on this page with a new effective date.",
        ],
    },
]

export default function PrivacyPage() {
    return (
        <LegalPageFrame
            title="Privacy Policy"
            subtitle="This policy describes how XbandGlobal handles account and operational data to deliver secure global incorporation workflows."
            updatedOn="March 6, 2026"
            sections={sections}
        />
    )
}
